import Joi from "joi";

const createReview = Joi.object({
  reviewOn: Joi.string().required().messages({
    "string.empty": "Booking ID is required",
    "any.required": "Booking ID is required",
  }),
  rating: Joi.number().min(1).max(5).required().messages({
    "number.base": "Rating must be a number",
    "number.min": "Rating must be at least 1",
    "number.max": "Rating cannot exceed 5",
    "any.required": "Rating is required",
  }),
  comment: Joi.string().trim().optional().allow(""),
  reviewType: Joi.string().valid("positive", "negative").required().messages({
    "any.only": "Review type must be either positive or negative",
    "any.required": "Review type is required",
  }),
});

const updateReview = Joi.object({
  rating: Joi.number().min(1).max(5).optional(),
  comment: Joi.string().trim().optional().allow(""),
  reviewType: Joi.string().valid("positive", "negative").optional(),
  hide: Joi.boolean().optional(),
});

const hideReview = Joi.object({
  hide: Joi.boolean().required().messages({
    "any.required": "Hide status is required",
  }),
});

export const reviewValidation = {
  createReview,
  updateReview,
  hideReview,
};
