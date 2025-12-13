"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Review = void 0;
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    reviewer: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    reviewOn: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Booking",
        required: true,
        index: true,
    },
    reviewType: {
        type: String,
        enum: ["positive", "negative"],
        default: "positive",
    },
    rating: {
        type: Number,
        required: true,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
    },
    comment: {
        type: String,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    deletedAt: {
        type: Date,
    },
    hide: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
// Compound indexes for efficient queries
reviewSchema.index({ reviewer: 1, reviewOn: 1 });
reviewSchema.index({ reviewOn: 1, isDeleted: 1, hide: 1 });
reviewSchema.index({ createdAt: -1 });
exports.Review = (0, mongoose_1.model)("Review", reviewSchema);
