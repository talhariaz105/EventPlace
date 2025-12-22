import { Schema, model } from "mongoose";
import { IBooking } from "./bookings.interfaces";

const BookingSchema = new Schema<IBooking>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Index for faster lookup
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: "ServiceListing",
      required: true,
      index: true,
    },
    type:{
      type: String, 
      enum: ["private", "public"],
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
      min: [1, "At least one guest is required"], // Minimum 1 guest
      max: [20, "Maximum guest limit exceeded"], // Prevent unrealistic values
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price must be positive"],
    },
    totalAmount: {
      type: Number,
      min: [0, "Total amount must be positive"],
    },
    paymentStatus: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "booked", "canceled", "completed", "rejected"],
      default: "pending",
    },
    paymentIntentId: {
      type: String,
      trim: true,
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
      type: Schema.Types.ObjectId,
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
    message: {
      type: String,
      trim: true,
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
    packages: [
      String
    ],
  },
  { timestamps: true }
);

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

export const Booking = model<IBooking>("Booking", BookingSchema);
