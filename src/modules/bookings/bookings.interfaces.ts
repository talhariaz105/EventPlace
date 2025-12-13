import { Document, Types } from "mongoose";

export interface IServicePrice {
  name?: string;
  price: number;
}

export interface IBooking extends Document {
  user: Types.ObjectId;
  service: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  paymentStatus: boolean;
  paymentIntentId: string;
  status: "pending" | "booked" | "canceled" | "completed" | "rejected";
  isDeleted: boolean;
  bookingResponseTime: Date | null;
  cancelRequest: boolean;
  cancelReason?: string;
  servicePrice: IServicePrice[];
  createdAt: Date;
  updatedAt: Date;
}
