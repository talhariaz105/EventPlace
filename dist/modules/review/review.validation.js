"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const createReview = joi_1.default.object({
    reviewOn: joi_1.default.string().required().messages({
        "string.empty": "Booking ID is required",
        "any.required": "Booking ID is required",
    }),
    rating: joi_1.default.number().min(1).max(5).required().messages({
        "number.base": "Rating must be a number",
        "number.min": "Rating must be at least 1",
        "number.max": "Rating cannot exceed 5",
        "any.required": "Rating is required",
    }),
    comment: joi_1.default.string().trim().optional().allow(""),
    reviewType: joi_1.default.string().valid("positive", "negative").required().messages({
        "any.only": "Review type must be either positive or negative",
        "any.required": "Review type is required",
    }),
});
const updateReview = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).optional(),
    comment: joi_1.default.string().trim().optional().allow(""),
    reviewType: joi_1.default.string().valid("positive", "negative").optional(),
    hide: joi_1.default.boolean().optional(),
});
const hideReview = joi_1.default.object({
    hide: joi_1.default.boolean().required().messages({
        "any.required": "Hide status is required",
    }),
});
exports.reviewValidation = {
    createReview,
    updateReview,
    hideReview,
};
