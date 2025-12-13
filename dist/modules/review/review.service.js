"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideReview = exports.deleteReview = exports.updateReview = exports.getReviewById = exports.getReviewsForService = exports.getAllReviews = exports.createReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const review_model_1 = require("./review.model");
const bookings_modal_1 = require("../bookings/bookings.modal");
const errors_1 = require("../errors");
const http_status_1 = __importDefault(require("http-status"));
/**
 * Create a new review
 */
const createReview = async (userId, userRole, reviewData) => {
    const { rating, comment, reviewOn, reviewType } = reviewData;
    // Find the booking and populate service details
    const findBooking = await bookings_modal_1.Booking.findOne({ _id: reviewOn }).populate({
        path: "service",
        select: "vendorId _id",
    });
    if (!findBooking) {
        throw new errors_1.ApiError("No booking found for this review", http_status_1.default.NOT_FOUND);
    }
    if (findBooking.status !== "completed") {
        throw new errors_1.ApiError("You can only review completed bookings", http_status_1.default.BAD_REQUEST);
    }
    // Check if the user has already reviewed this booking
    const existingReview = await review_model_1.Review.findOne({
        reviewOn,
        reviewer: userId,
        isDeleted: false,
    });
    if (existingReview) {
        throw new errors_1.ApiError("You have already reviewed this booking", http_status_1.default.BAD_REQUEST);
    }
    // Create the review
    const review = await review_model_1.Review.create({
        rating,
        comment,
        reviewOn,
        reviewer: userId,
        reviewType,
    });
    return {
        review,
        notificationData: {
            userId: userRole === "customer"
                ? findBooking.service.vendorId
                : findBooking.user,
            bookingId: findBooking._id,
        },
    };
};
exports.createReview = createReview;
/**
 * Get all reviews with advanced filtering and aggregation
 */
const getAllReviews = async (queryParams) => {
    const { page = 1, limit = 10, serviceCategories, reviewType, owners, ratings, search, isDeleted = false, reviewerRole, } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const matchStage = {
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
            $in: categoryValues.map((c) => new mongoose_1.default.Types.ObjectId(c)),
        };
    }
    if (owners) {
        const ownerIds = Array.isArray(owners)
            ? owners.map((id) => new mongoose_1.default.Types.ObjectId(id))
            : [new mongoose_1.default.Types.ObjectId(owners)];
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
    const result = await review_model_1.Review.aggregate([
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
exports.getAllReviews = getAllReviews;
/**
 * Get reviews for a specific service
 */
const getReviewsForService = async (serviceId, queryParams) => {
    const { page = 1, limit = 10, reviewType, isDeleted = false } = queryParams;
    const skip = (Number(page) - 1) * Number(limit);
    const matchCondition = {
        "booking.service": new mongoose_1.default.Types.ObjectId(serviceId),
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
    const result = await review_model_1.Review.aggregate([
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
exports.getReviewsForService = getReviewsForService;
/**
 * Get a single review by ID
 */
const getReviewById = async (reviewId) => {
    const review = await review_model_1.Review.findById(reviewId)
        .populate("reviewer", "firstName lastName email profilePicture")
        .populate("reviewOn");
    if (!review) {
        throw new errors_1.ApiError("No review found with that ID", http_status_1.default.NOT_FOUND);
    }
    return review;
};
exports.getReviewById = getReviewById;
/**
 * Update a review
 */
const updateReview = async (reviewId, userId, userRole, updateData) => {
    const review = await review_model_1.Review.findById(reviewId);
    if (!review) {
        throw new errors_1.ApiError("No review found with that ID", http_status_1.default.NOT_FOUND);
    }
    // Check authorization
    if (review.reviewer.toString() !== userId && userRole !== "admin") {
        throw new errors_1.ApiError("Unauthorized to update this review", http_status_1.default.FORBIDDEN);
    }
    const updatedReview = await review_model_1.Review.findByIdAndUpdate(reviewId, updateData, {
        new: true,
        runValidators: true,
    });
    return updatedReview;
};
exports.updateReview = updateReview;
/**
 * Delete a review (soft delete)
 */
const deleteReview = async (reviewId) => {
    const review = await review_model_1.Review.findById(reviewId);
    if (!review) {
        throw new errors_1.ApiError("No review found with that ID", http_status_1.default.NOT_FOUND);
    }
    const deletedReview = await review_model_1.Review.findByIdAndUpdate(reviewId, {
        isDeleted: true,
        deletedAt: new Date(),
    }, { new: true });
    return deletedReview;
};
exports.deleteReview = deleteReview;
/**
 * Hide/unhide a review
 */
const hideReview = async (reviewId, userId, userRole, hide) => {
    const review = await review_model_1.Review.findById(reviewId);
    if (!review) {
        throw new errors_1.ApiError("No review found with that ID", http_status_1.default.NOT_FOUND);
    }
    // Check authorization
    if (review.reviewer.toString() !== userId && userRole !== "admin") {
        throw new errors_1.ApiError("Unauthorized to hide this review", http_status_1.default.FORBIDDEN);
    }
    review.hide = hide;
    await review.save();
    return review;
};
exports.hideReview = hideReview;
