"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSavedListingsByUserId = exports.toggleSaveListing = exports.getMyListings = exports.getAdminListings = exports.deleteListingById = exports.updateListingById = exports.getListingsByVendorId = exports.getListingById = exports.queryVenuesandVendor = exports.createListing = void 0;
const http_status_1 = __importDefault(require("http-status"));
const listings_modal_1 = __importDefault(require("./listings.modal"));
const listings_venue_1 = __importDefault(require("./listings.venue"));
const listing_vendor_1 = __importDefault(require("./listing.vendor"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const listing_filter_1 = require("./listing.filter");
/**
 * Create a listing (venue or vendor)
 * @param {Partial<IListingsModal>} listingBody
 * @returns {Promise<IListingsModal>}
 */
const createListing = async (listingBody) => {
    const { listingtype } = listingBody;
    if (!listingtype) {
        throw new ApiError_1.default("Listing type (venue or vendor) is required", http_status_1.default.BAD_REQUEST);
    }
    if (listingtype === "venue") {
        return listings_venue_1.default.create(listingBody);
    }
    else if (listingtype === "vendor") {
        return listing_vendor_1.default.create(listingBody);
    }
    else {
        throw new ApiError_1.default('Invalid listing type. Must be either "venue" or "vendor"', http_status_1.default.BAD_REQUEST);
    }
};
exports.createListing = createListing;
/**
 * Query for venues with aggregation and pagination
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
const queryVenuesandVendor = async (filter, options) => {
    const page = parseInt(options["page"]) || 1;
    const limit = parseInt(options["limit"]) || 10;
    const skip = (page - 1) * limit;
    const sortBy = options["sortBy"] || "createdAt:desc";
    // Parse sort
    const sortParts = sortBy.split(":");
    const sortField = sortParts[0];
    const sortOrder = sortParts[1] === "desc" ? -1 : 1;
    console.log("Filter in service...:", filter, (0, listing_filter_1.listingFilter)(filter));
    // Build match stage
    const matchStage = {
        isDeleted: false,
        ispublished: true,
        ...(0, listing_filter_1.listingFilter)(filter),
    };
    const pipeline = [
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
                logo: 1,
            },
        },
        {
            $facet: {
                results: [{ $skip: skip }, { $limit: limit }],
                totalCount: [{ $count: "count" }],
            },
        },
    ];
    const result = await listings_modal_1.default.aggregate(pipeline);
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
exports.queryVenuesandVendor = queryVenuesandVendor;
const getListingById = async (id) => {
    const listing = await listings_modal_1.default.findById(id)
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
        throw new ApiError_1.default("Listing not found", http_status_1.default.NOT_FOUND);
    }
    return listing;
};
exports.getListingById = getListingById;
/**
 * Get listings by vendor user ID
 * @param {mongoose.Types.ObjectId} vendorId
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
const getListingsByVendorId = async (vendorId, options) => {
    const page = parseInt(options["page"]) || 1;
    const limit = parseInt(options["limit"]) || 10;
    const skip = (page - 1) * limit;
    const filter = { vendorId, isDeleted: false };
    if (options["listingtype"]) {
        filter.listingtype = options["listingtype"];
    }
    const listings = await listings_modal_1.default.find(filter)
        .populate("amenties")
        .populate("subcategories")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const totalResults = await listings_modal_1.default.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);
    return {
        results: listings,
        page,
        limit,
        totalPages,
        totalResults,
    };
};
exports.getListingsByVendorId = getListingsByVendorId;
/**
 * Update listing by id (venue or vendor)
 * @param {mongoose.Types.ObjectId} listingId
 * @param {Partial<IListingsModal>} updateBody
 * @returns {Promise<any>}
 */
const updateListingById = async (listingId, updateBody) => {
    const listing = await listings_modal_1.default.findById(listingId);
    if (!listing) {
        throw new ApiError_1.default("Listing not found", http_status_1.default.NOT_FOUND);
    }
    const model = listing.listingtype === "venue" ? listings_venue_1.default : listing_vendor_1.default;
    const updatedListing = await model.findOneAndUpdate({ _id: listingId }, updateBody, { new: true, runValidators: true });
    return updatedListing;
};
exports.updateListingById = updateListingById;
/**
 * Delete listing by id (soft delete)
 * @param {mongoose.Types.ObjectId} listingId
 * @returns {Promise<any>}
 */
const deleteListingById = async (listingId) => {
    const listing = await listings_modal_1.default.findById(listingId);
    if (!listing) {
        throw new ApiError_1.default("Listing not found", http_status_1.default.NOT_FOUND);
    }
    listing.isDeleted = true;
    await listing.save();
    return listing;
};
exports.deleteListingById = deleteListingById;
/**
 * Get all listings for admin with pagination
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
const getAdminListings = async (options) => {
    const page = parseInt(options["page"]) || 1;
    const limit = parseInt(options["limit"]) || 10;
    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };
    if (options["listingtype"]) {
        filter.listingtype = options["listingtype"];
    }
    const listings = await listings_modal_1.default.find(filter)
        .populate("vendorId", "name email profilePicture")
        .populate("amenties")
        .populate("eventtypes")
        .populate("subcategories")
        .populate("serviceTypeId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const totalResults = await listings_modal_1.default.countDocuments({
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
exports.getAdminListings = getAdminListings;
/**
 * Get listings for logged-in vendor user with pagination
 * @param {mongoose.Types.ObjectId} vendorId
 * @param {Object} options - Query options
 * @returns {Promise<any>}
 */
const getMyListings = async (vendorId, options) => {
    const page = parseInt(options["page"]) || 1;
    const limit = parseInt(options["limit"]) || 10;
    const skip = (page - 1) * limit;
    const filter = { vendorId, isDeleted: false };
    if (options["listingtype"]) {
        filter.listingtype = options["listingtype"];
    }
    const listings = await listings_modal_1.default.find(filter)
        .populate("amenties")
        .populate("eventtypes")
        .populate("subcategories")
        .populate("serviceTypeId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const totalResults = await listings_modal_1.default.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);
    return {
        results: listings,
        page,
        limit,
        totalPages,
        totalResults,
    };
};
exports.getMyListings = getMyListings;
const toggleSaveListing = async (listingId, userId) => {
    const listing = await listings_modal_1.default.findById(listingId);
    if (!listing) {
        throw new ApiError_1.default("Listing not found", http_status_1.default.NOT_FOUND);
    }
    // Initialize savedBy array if not exists
    if (!listing.savedBy) {
        listing.savedBy = [];
    }
    // Work with savedBy as array
    const savedByArray = listing.savedBy;
    // Check if already saved
    const isSaved = savedByArray.some((id) => id.toString() === userId.toString());
    if (isSaved) {
        // Remove from savedBy by filtering
        listing.savedBy = savedByArray.filter((id) => id.toString() !== userId.toString());
        await listing.save();
        return { message: "Listing unsaved successfully", saved: false, listing };
    }
    else {
        // Add to savedBy
        savedByArray.push(userId);
        listing.savedBy = savedByArray;
        await listing.save();
        return { message: "Listing saved successfully", saved: true, listing };
    }
};
exports.toggleSaveListing = toggleSaveListing;
const getSavedListingsByUserId = async (userId, options) => {
    const page = parseInt(options["page"]) || 1;
    const limit = parseInt(options["limit"]) || 10;
    const skip = (page - 1) * limit;
    const filter = {
        savedBy: userId,
        isDeleted: false,
    };
    const listings = await listings_modal_1.default.find(filter)
        .select("name listingtype location basePriceRange media logo")
        .populate("serviceTypeId", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();
    const totalResults = await listings_modal_1.default.countDocuments(filter);
    const totalPages = Math.ceil(totalResults / limit);
    return {
        results: listings,
        page,
        limit,
        totalPages,
        totalResults,
    };
};
exports.getSavedListingsByUserId = getSavedListingsByUserId;
