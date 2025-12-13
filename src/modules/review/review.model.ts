import { Schema, model } from "mongoose";
import { IReview } from "./review.interfaces";

const reviewSchema = new Schema<IReview>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    reviewOn: {
      type: Schema.Types.ObjectId,
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
  },
  { timestamps: true }
);

// Compound indexes for efficient queries
reviewSchema.index({ reviewer: 1, reviewOn: 1 });
reviewSchema.index({ reviewOn: 1, isDeleted: 1, hide: 1 });
reviewSchema.index({ createdAt: -1 });

export const Review = model<IReview>("Review", reviewSchema);
