"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Booking = void 0;
const mongoose_1 = require("mongoose");
const BookingSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true, // Index for faster lookup
    },
    service: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "ServiceListing",
        required: true,
        index: true,
    },
    checkIn: {
        type: Date,
        required: true,
    },
    checkOut: {
        type: Date,
        required: true,
    },
    guests: {
        type: Number,
        required: true,
        min: [1, "At least one guest is required"],
        max: [20, "Maximum guest limit exceeded"], // Prevent unrealistic values
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, "Total price must be positive"],
    },
    totalAmount: {
        type: Number,
        required: true,
        min: [0, "Total amount must be positive"],
    },
    discountAmount: {
        type: Number,
        default: 0,
    },
    couponCode: {
        type: String,
        trim: true,
    },
    paymentStatus: {
        type: Boolean,
        default: false,
    },
    paymentIntentId: {
        type: String,
        trim: true,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "booked", "canceled", "completed", "rejected"],
        default: "pending",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    bookingResponseTime: {
        type: Date,
        default: null,
    },
    cancelRequest: {
        type: Boolean,
        default: false,
    },
    cancelRequestBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    cancelRequestDate: {
        type: Date,
    },
    cancelReason: {
        type: String,
        trim: true,
    },
    refunded: {
        type: Boolean,
        default: false,
    },
    refundAmount: {
        type: Number,
    },
    refundType: {
        type: String,
        enum: ["Full", "Partial"],
    },
    refundId: {
        type: String,
        trim: true,
    },
    extensionRequest: {
        type: Boolean,
        default: false,
    },
    extensionDetails: {
        requestedCheckOut: Date,
        additionalAmount: Number,
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
        },
        paymentIntentId: String,
    },
    servicePrice: [
        {
            name: {
                type: String,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
}, { timestamps: true });
// Index for sorting and filtering bookings efficiently
BookingSchema.index({
    user: 1,
    service: 1,
    status: 1,
    guests: 1,
    checkIn: 1,
    checkOut: 1,
    totalPrice: 1,
});
BookingSchema.index({ createdAt: -1 }); // Index for sorting by creation date
exports.Booking = (0, mongoose_1.model)("Booking", BookingSchema);
