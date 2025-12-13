import { Schema, model} from "mongoose";
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
    cancelReason: {
      type: String,
      trim: true,
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
