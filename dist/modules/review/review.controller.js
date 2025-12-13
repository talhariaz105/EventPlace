"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hideReview = exports.deleteReview = exports.editReview = exports.getReviewById = exports.getReviewsForService = exports.getAllReviews = exports.addReview = void 0;
const http_status_1 = __importDefault(require("http-status"));
const reviewService = __importStar(require("./review.service"));
const review_validation_1 = require("./review.validation");
const errors_1 = require("../errors");
/**
 * Add a new review
 */
const addReview = async (req, res, next) => {
    try {
        // Validate request body
        const { error } = review_validation_1.reviewValidation.createReview.validate(req.body, {
            abortEarly: false,
        });
        if (error) {
            const errorFields = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
            throw new errors_1.ApiError("Validation failed", http_status_1.default.BAD_REQUEST, {
                errorFields,
            });
        }
        const result = await reviewService.createReview(req.user._id, req.user.role, req.body);
        // Store review ID for potential audit logging
        res.locals["dataId"] = result.review._id;
        // Send notification (implement your notification logic)
        // await sendNotification({
        //   userId: result.notificationData.userId,
        //   title: 'New Review',
        //   message: `${req.user.firstName} ${req.user.lastName} has reviewed your service`,
        //   type: 'review',
        //   fortype: 'venue_feedback',
        //   permission: 'review'
        // });
        res.status(http_status_1.default.CREATED).json({
            status: "success",
            data: {
                review: result.review,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addReview = addReview;
/**
 * Get all reviews with filtering
 */
const getAllReviews = async (req, res, next) => {
    try {
        const result = await reviewService.getAllReviews(req.query);
        res.status(http_status_1.default.OK).json({
            status: "success",
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllReviews = getAllReviews;
/**
 * Get reviews for a specific service
 */
const getReviewsForService = async (req, res, next) => {
    try {
        const result = await reviewService.getReviewsForService(req.params["id"], req.query);
        res.status(http_status_1.default.OK).json({
            status: "success",
            ...result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewsForService = getReviewsForService;
/**
 * Get a review by ID
 */
const getReviewById = async (req, res, next) => {
    try {
        const review = await reviewService.getReviewById(req.params["id"]);
        res.status(http_status_1.default.OK).json({
            status: "success",
            data: {
                review,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getReviewById = getReviewById;
/**
 * Update a review
 */
const editReview = async (req, res, next) => {
    try {
        // Validate request body
        const { error } = review_validation_1.reviewValidation.updateReview.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
        });
        if (error) {
            const errorFields = error.details.map((detail) => ({
                field: detail.path.join("."),
                message: detail.message,
            }));
            throw new errors_1.ApiError("Validation failed", http_status_1.default.BAD_REQUEST, {
                errorFields,
            });
        }
        const updatedReview = await reviewService.updateReview(req.params["id"], req.user._id, req.user.role, req.body);
        res.locals["dataId"] = updatedReview?._id;
        res.status(http_status_1.default.OK).json({
            status: "success",
            data: {
                review: updatedReview,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.editReview = editReview;
/**
 * Delete a review (soft delete)
 */
const deleteReview = async (req, res, next) => {
    try {
        const deletedReview = await reviewService.deleteReview(req.params["id"]);
        res.locals["dataId"] = deletedReview?._id;
        res.status(http_status_1.default.OK).json({
            status: "success",
            data: {
                review: deletedReview,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteReview = deleteReview;
/**
 * Hide/unhide a review
 */
const hideReview = async (req, res, next) => {
    try {
        const { hide = false } = req.body;
        // Validate request body
        const { error } = review_validation_1.reviewValidation.hideReview.validate({ hide });
        if (error) {
            throw new errors_1.ApiError(error.details?.[0]?.message || "Validation failed", http_status_1.default.BAD_REQUEST);
        }
        const review = await reviewService.hideReview(req.params["id"], req.user._id, req.user.role, hide);
        res.status(http_status_1.default.OK).json({
            status: "success",
            data: {
                review,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.hideReview = hideReview;
