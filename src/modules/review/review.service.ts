import mongoose from "mongoose";
import { Review } from "./review.model";
import { Booking } from "../bookings/bookings.modal";
import { IReviewQueryParams, IReviewServiceParams } from "./review.interfaces";
import { ApiError } from "../errors";
import httpStatus from "http-status";

/**
 * Create a new review
 */
export const createReview = async (
  userId: string,
  userRole: string,
  reviewData: {
    rating: number;
    comment?: string;
    reviewOn: string;
    reviewType: string;
  }
) => {
  const { rating, comment, reviewOn, reviewType } = reviewData;

  // Find the booking and populate service details
  const findBooking = await Booking.findOne({ _id: reviewOn }).populate({
    path: "service",
    select: "vendorId _id",
  });

  if (!findBooking) {
    throw new ApiError(
      "No booking found for this review",
      httpStatus.NOT_FOUND
    );
  }

  if (findBooking.status !== "completed") {
    throw new ApiError(
      "You can only review completed bookings",
      httpStatus.BAD_REQUEST
    );
  }

  // Check if the user has already reviewed this booking
  const existingReview = await Review.findOne({
    reviewOn,
    reviewer: userId,
    isDeleted: false,
  });

  if (existingReview) {
    throw new ApiError(
      "You have already reviewed this booking",
      httpStatus.BAD_REQUEST
    );
  }

  // Create the review
  const review = await Review.create({
    rating,
    comment,
    reviewOn,
    reviewer: userId,
    reviewType,
  });

  return {
    review,
    notificationData: {
      userId:
        userRole === "customer"
          ? (findBooking.service as any).vendorId
          : findBooking.user,
      bookingId: findBooking._id,
    },
  };
};

/**
 * Get all reviews with advanced filtering and aggregation
 */
export const getAllReviews = async (queryParams: IReviewQueryParams) => {
  const {
    page = 1,
    limit = 10,
    serviceCategories,
    reviewType,
    owners,
    ratings,
    search,
    isDeleted = false,
    reviewerRole,
  } = queryParams;

  const skip = (Number(page) - 1) * Number(limit);

  const matchStage: any = {
    isDeleted: isDeleted === true,
  };

  if (reviewType) {
    matchStage.reviewType = reviewType;
  }

  if (ratings) {
    const ratingValues = Array.isArray(ratings) ? ratings : [ratings];
    matchStage.rating = { $in: ratingValues.map((r) => Number(r)) };
  }

  if (serviceCategories) {
    const categoryValues = Array.isArray(serviceCategories)
      ? serviceCategories
      : [serviceCategories];
    matchStage["service.ServiceCategory"] = {
      $in: categoryValues.map((c) => new mongoose.Types.ObjectId(c)),
    };
  }

  if (owners) {
    const ownerIds = Array.isArray(owners)
      ? owners.map((id) => new mongoose.Types.ObjectId(id))
      : [new mongoose.Types.ObjectId(owners)];
    matchStage["serviceOwner._id"] = { $in: ownerIds };
  }

  if (reviewerRole) {
    matchStage["reviewer.role"] = reviewerRole;
  }

  if (search) {
    matchStage.$or = [
      { "serviceOwner.fullName": { $regex: search, $options: "i" } },
      { "reviewer.email": { $regex: search, $options: "i" } },
      { "service.title": { $regex: search, $options: "i" } },
      { "service.description": { $regex: search, $options: "i" } },
      { comment: { $regex: search, $options: "i" } },
    ];
  }

  const queryPipeline = [
    {
      $lookup: {
        from: "users",
        localField: "reviewer",
        foreignField: "_id",
        as: "reviewer",
      },
    },
    { $unwind: { path: "$reviewer", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "bookings",
        localField: "reviewOn",
        foreignField: "_id",
        as: "booking",
      },
    },
    { $unwind: { path: "$booking", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "servicelistings",
        localField: "booking.service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "service.vendorId",
        foreignField: "_id",
        as: "serviceOwner",
      },
    },
    { $unwind: { path: "$serviceOwner", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        "serviceOwner.fullName": {
          $concat: [
            { $ifNull: ["$serviceOwner.firstName", ""] },
            " ",
            { $ifNull: ["$serviceOwner.lastName", ""] },
          ],
        },
      },
    },
    { $match: matchStage },
  ];

  const result = await Review.aggregate([
    {
      $facet: {
        stats: [
          ...queryPipeline,
          {
            $group: {
              _id: null,
              totalReviews: { $sum: 1 },
            },
          },
        ],
        reviews: [
          ...queryPipeline,
          { $sort: { createdAt: -1 } },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
          {
            $project: {
              _id: 1,
              rating: 1,
              comment: 1,
              reviewOn: 1,
              createdAt: 1,
              updatedAt: 1,
              reviewType: 1,
              reviewer: 1,
              booking: 1,
              service: 1,
              hide: 1,
              serviceOwner: {
                _id: 1,
                profilePicture: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        stats: { $arrayElemAt: ["$stats", 0] },
        reviews: 1,
      },
    },
  ]);

  const { stats, reviews } = result[0];

  return {
    reviews,
    totalReviews: stats?.totalReviews || 0,
    page: Number(page),
    limit: Number(limit),
    results: reviews.length,
  };
};

/**
 * Get reviews for a specific service
 */
export const getReviewsForService = async (
  serviceId: string,
  queryParams: IReviewServiceParams
) => {
  const { page = 1, limit = 10, reviewType, isDeleted = false } = queryParams;
  const skip = (Number(page) - 1) * Number(limit);

  const matchCondition: any = {
    "booking.service": new mongoose.Types.ObjectId(serviceId),
    isDeleted: typeof isDeleted === "string" ? isDeleted === "true" : isDeleted,
    hide: false,
  };

  if (reviewType) {
    matchCondition.reviewType = reviewType;
  }

  const queryPipeline = [
    {
      $lookup: {
        from: "users",
        localField: "reviewer",
        foreignField: "_id",
        as: "reviewer",
      },
    },
    { $unwind: "$reviewer" },
    {
      $lookup: {
        from: "bookings",
        localField: "reviewOn",
        foreignField: "_id",
        as: "booking",
      },
    },
    { $unwind: "$booking" },
    { $match: matchCondition },
  ];

  const result = await Review.aggregate([
    {
      $facet: {
        stats: [
          ...queryPipeline,
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" },
              totalReviews: { $sum: 1 },
            },
          },
        ],
        reviews: [
          { $sort: { createdAt: -1 } },
          { $skip: Number(skip) },
          { $limit: Number(limit) },
          ...queryPipeline,
          {
            $project: {
              _id: 1,
              rating: 1,
              comment: 1,
              reviewOn: 1,
              createdAt: 1,
              updatedAt: 1,
              hide: 1,
              reviewType: 1,
              reviewer: {
                firstName: 1,
                lastName: 1,
                profilePicture: 1,
                location: 1,
              },
              serviceId: "$booking.service",
            },
          },
        ],
      },
    },
    {
      $project: {
        stats: { $arrayElemAt: ["$stats", 0] },
        reviews: 1,
      },
    },
  ]);

  const { stats, reviews } = result[0];

  return {
    reviews,
    totalReviews: stats?.totalReviews || 0,
    averageRating: stats?.averageRating || 0,
    page: Number(page),
    limit: Number(limit),
    results: reviews.length,
  };
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId: string) => {
  const review = await Review.findById(reviewId)
    .populate("reviewer", "firstName lastName email profilePicture")
    .populate("reviewOn");

  if (!review) {
    throw new ApiError("No review found with that ID", httpStatus.NOT_FOUND);
  }

  return review;
};

/**
 * Update a review
 */
export const updateReview = async (
  reviewId: string,
  userId: string,
  userRole: string,
  updateData: {
    rating?: number;
    comment?: string;
    reviewType?: string;
    hide?: boolean;
  }
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError("No review found with that ID", httpStatus.NOT_FOUND);
  }

  // Check authorization
  if (review.reviewer.toString() !== userId && userRole !== "admin") {
    throw new ApiError(
      "Unauthorized to update this review",
      httpStatus.FORBIDDEN
    );
  }

  const updatedReview = await Review.findByIdAndUpdate(reviewId, updateData, {
    new: true,
    runValidators: true,
  });

  return updatedReview;
};

/**
 * Delete a review (soft delete)
 */
export const deleteReview = async (reviewId: string) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError("No review found with that ID", httpStatus.NOT_FOUND);
  }

  const deletedReview = await Review.findByIdAndUpdate(
    reviewId,
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );

  return deletedReview;
};

/**
 * Hide/unhide a review
 */
export const hideReview = async (
  reviewId: string,
  userId: string,
  userRole: string,
  hide: boolean
) => {
  const review = await Review.findById(reviewId);

  if (!review) {
    throw new ApiError("No review found with that ID", httpStatus.NOT_FOUND);
  }

  // Check authorization
  if (review.reviewer.toString() !== userId && userRole !== "admin") {
    throw new ApiError(
      "Unauthorized to hide this review",
      httpStatus.FORBIDDEN
    );
  }

  review.hide = hide;
  await review.save();

  return review;
};
