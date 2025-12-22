"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const createBooking = joi_1.default.object({
    serviceId: joi_1.default.string().required().messages({
        "string.empty": "serviceId is required",
        "any.required": "serviceId is required",
    }),
    checkIn: joi_1.default.date().required().messages({
        "date.base": "Valid check-in date is required",
        "any.required": "Check-in date is required",
    }),
    checkOut: joi_1.default.date().greater(joi_1.default.ref("checkIn")).required().messages({
        "date.base": "Valid check-out date is required",
        "date.greater": "Check-out date must be after check-in date",
        "any.required": "Check-out date is required",
    }),
    guests: joi_1.default.number().integer().min(1).required().messages({
        "number.base": "Guests must be a number",
        "number.min": "At least one guest is required",
        "any.required": "Number of guests is required",
    }),
    message: joi_1.default.string().optional().allow(""),
    timezone: joi_1.default.string().optional(),
    totalAmount: joi_1.default.number().min(0).required().messages({
        "number.base": "Total amount must be a number",
        "number.min": "Total amount must be positive",
        "any.required": "Total amount is required",
    }),
    packages: joi_1.default.array().items(joi_1.default.string()).optional(),
    type: joi_1.default.string().valid("private", "public").optional()
});
const updateBookingStatus = joi_1.default.object({
    status: joi_1.default.string().valid("booked", "rejected").required().messages({
        "any.only": "Status must be either booked or rejected",
        "any.required": "Status is required",
    }),
});
const cancelBooking = joi_1.default.object({
    cancelReason: joi_1.default.string().optional().allow(""),
});
const refundBooking = joi_1.default.object({
    amount: joi_1.default.number().min(0).optional(),
    refundType: joi_1.default.string().valid("Full", "Partial").optional(),
    cancelReason: joi_1.default.string().optional().allow(""),
});
const extendBooking = joi_1.default.object({
    startDate: joi_1.default.date().required().messages({
        "date.base": "Valid start date is required",
        "any.required": "Start date is required",
    }),
    endDate: joi_1.default.date().greater(joi_1.default.ref("startDate")).required().messages({
        "date.base": "Valid end date is required",
        "date.greater": "End date must be after start date",
        "any.required": "End date is required",
    }),
    addOnServices: joi_1.default.array()
        .items(joi_1.default.object({
        name: joi_1.default.string().optional(),
        price: joi_1.default.number().required(),
    }))
        .optional(),
    timezone: joi_1.default.string().optional(),
});
const extensionAction = joi_1.default.object({
    action: joi_1.default.string().valid("accept", "reject").required().messages({
        "any.only": "Action must be either accept or reject",
        "any.required": "Action is required",
    }),
});
const checkAvailability = joi_1.default.object({
    checkIn: joi_1.default.date().required().messages({
        "date.base": "Valid check-in date is required",
        "any.required": "Check-in date is required",
    }),
    checkOut: joi_1.default.date().greater(joi_1.default.ref("checkIn")).required().messages({
        "date.base": "Valid check-out date is required",
        "date.greater": "Check-out date must be after check-in date",
        "any.required": "Check-out date is required",
    }),
    timezone: joi_1.default.string().optional(),
});
const updateBooking = joi_1.default.object({
    checkIn: joi_1.default.date().optional(),
    checkOut: joi_1.default.date().greater(joi_1.default.ref("checkIn")).optional(),
    guests: joi_1.default.number().min(1).optional(),
    status: joi_1.default.string()
        .valid("pending", "booked", "canceled", "completed", "rejected")
        .optional(),
});
exports.bookingValidation = {
    createBooking,
    updateBooking,
    updateBookingStatus,
    cancelBooking,
    refundBooking,
    extendBooking,
    extensionAction,
    checkAvailability,
};
