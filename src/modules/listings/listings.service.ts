import httpStatus from "http-status";
import mongoose from "mongoose";
import ServiceListing from "./listings.modal";
import VenueListing from "./listings.venue";
import VendorListing from "./listing.vendor";
import ApiError from "../errors/ApiError";
import { IListingsModal } from "./listings.interfaces";
import { listingFilter } from "./listing.filter";

/**
 * Create a listing (venue or vendor)
 * @param {Partial<IListingsModal>} listingBody
 * @returns {Promise<IListingsModal>}
 */
export const createListing = async (
  listingBody: Partial<IListingsModal>
): Promise<any> => {
  const { listingtype } = listingBody;

  if (!listingtype) {
    throw new ApiError(
      "Listing type (venue or vendor) is required",
      httpStatus.BAD_REQUEST
    );
  }

  if (listingtype === "venue") {
    return VenueListing.create(listingBody);
  } else if (listingtype === "vendor") {
    return VendorListing.create(listingBody);
  } else {
    throw new ApiError(
      'Invalid listing type. Must be either "venue" or "vendor"',
      httpStatus.BAD_REQUEST
    );
  }
};

/**
 * Query for venues with aggregation and pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
export const queryVenuesandVendor = async (
  filter: Record<string, any>,
  options: Record<string, any>
): Promise<any> => {
  const page = parseInt(options["page"]) || 1;
  const limit = parseInt(options["limit"]) || 10;
  const skip = (page - 1) * limit;
  const sortBy = options["sortBy"] || "createdAt:desc";

  // Parse sort
  const sortParts = sortBy.split(":");
  const sortField = sortParts[0];
  const sortOrder = sortParts[1] === "desc" ? -1 : 1;

  console.log("Filter in service...:", filter,listingFilter(filter));
  // Build match stage
  const matchStage: mongoose.FilterQuery<IListingsModal> = {
  
    isDeleted: false,
    ispublished: true,
    ...listingFilter(filter),
  };

  const pipeline: mongoose.PipelineStage[] = [
    {
      $lookup: {
        from: "amenities",
        localField: "amenties",
        foreignField: "_id",
        as: "amenitiesData",
      },
    },
    {
      $lookup: {
        from: "servicecategories",
        localField: "serviceTypeId",
        foreignField: "_id",
        as: "serviceTypeData",
      },
    },
    {
      $unwind: {
        path: "$serviceTypeData",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: "eventtypes",
        localField: "eventTypes",
        foreignField: "_id",
        as: "eventTypesData",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "vendorId",
        foreignField: "_id",
        as: "vendorData",
        pipeline: [
          {
            $project: {
              name: 1,
              profilePicture: 1,
              
            },
          },
        ],
      },
    },
    { $match: matchStage },
    { $sort: { [sortField]: sortOrder } },
    {
      $project: {
        serviceTypeData: 1,
        vendorData: { $arrayElemAt: ["$vendorData", 0] },
        name: 1,
        listingtype: 1,
        description: 1,
        location: 1,
        capacity: 1,
        basePriceRange: 1,
        media: 1,
        logo: 1
      },
    },
    {
      $facet: {
        results: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await ServiceListing.aggregate(pipeline);

  const totalResults = result[0]?.totalCount[0]?.count || 0;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: result[0]?.results || [],
    page,
    limit,
    totalPages,
    totalResults,
  };
};

export const getListingById = async (
  id: mongoose.Types.ObjectId
): Promise<any> => {
  const listing = await ServiceListing.findById(id)
    .populate("amenties")
    .populate("subcategories")
    .populate("eventtypes")
    .populate("serviceTypeId")
    .populate("vendorId", "name email")
    .populate({
      path: "packages.amenties",
      model: "Amenities",
    });

  if (!listing) {
    throw new ApiError("Listing not found", httpStatus.NOT_FOUND);
  }

  return listing;
};

/**
 * Get listings by vendor user ID
 * @param {mongoose.Types.ObjectId} vendorId
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
export const getListingsByVendorId = async (
  vendorId: mongoose.Types.ObjectId,
  options: Record<string, any>
): Promise<any> => {
  const page = parseInt(options["page"]) || 1;
  const limit = parseInt(options["limit"]) || 10;
  const skip = (page - 1) * limit;

  const filter: any = { vendorId, isDeleted: false };

  if (options["listingtype"]) {
    filter.listingtype = options["listingtype"];
  }

  const listings = await ServiceListing.find(filter)
    .populate("amenties")
    .populate("subcategories")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const totalResults = await ServiceListing.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: listings,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Update listing by id (venue or vendor)
 * @param {mongoose.Types.ObjectId} listingId
 * @param {Partial<IListingsModal>} updateBody
 * @returns {Promise<any>}
 */
export const updateListingById = async (
  listingId: mongoose.Types.ObjectId,
  updateBody: Partial<IListingsModal>
): Promise<any> => {
  const listing = await ServiceListing.findById(listingId);

  if (!listing) {
    throw new ApiError("Listing not found", httpStatus.NOT_FOUND);
  }

  const model = listing.listingtype === "venue" ? VenueListing : VendorListing;

  const updatedListing = await model.findOneAndUpdate(
    { _id: listingId },
    updateBody,
    { new: true, runValidators: true }
  );

  return updatedListing;
};

/**
 * Delete listing by id (soft delete)
 * @param {mongoose.Types.ObjectId} listingId
 * @returns {Promise<any>}
 */
export const deleteListingById = async (
  listingId: mongoose.Types.ObjectId
): Promise<any> => {
  const listing = await ServiceListing.findById(listingId);

  if (!listing) {
    throw new ApiError("Listing not found", httpStatus.NOT_FOUND);
  }

  listing.isDeleted = true;
  await listing.save();

  return listing;
};

/**
 * Get all listings for admin with pagination
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
export const getAdminListings = async (
  options: Record<string, any>
): Promise<any> => {
  const page = parseInt(options["page"]) || 1;
  const limit = parseInt(options["limit"]) || 10;
  const skip = (page - 1) * limit;
  const filter: any = { isDeleted: false };
  if (options["listingtype"]) {
    filter.listingtype = options["listingtype"];
  }

  const listings = await ServiceListing.find(filter)
    .populate("vendorId", "name email profilePicture")
    .populate("amenties")
    .populate("eventtypes")
    .populate("subcategories")
    .populate("serviceTypeId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalResults = await ServiceListing.countDocuments({
    isDeleted: false,
  });
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: listings,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

/**
 * Get listings for logged-in vendor user with pagination
 * @param {mongoose.Types.ObjectId} vendorId
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
export const getMyListings = async (
  vendorId: mongoose.Types.ObjectId,
  options: Record<string, any>
): Promise<any> => {
  const page = parseInt(options["page"]) || 1;
  const limit = parseInt(options["limit"]) || 10;
  const skip = (page - 1) * limit;
  const filter: any = { vendorId, isDeleted: false };
  if (options["listingtype"]) {
    filter.listingtype = options["listingtype"];
  }

  const listings = await ServiceListing.find(filter)
    .populate("amenties")
    .populate("eventtypes")
    .populate("subcategories")
    .populate("serviceTypeId")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const totalResults = await ServiceListing.countDocuments(filter);
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: listings,
    page,
    limit,
    totalPages,
    totalResults,
  };
};
