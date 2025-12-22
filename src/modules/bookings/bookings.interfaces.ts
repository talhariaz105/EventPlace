import { Document, Types } from "mongoose";

export interface IServicePrice {
  name?: string;
  price: number;
}

export interface IExtensionDetails {
  requestedCheckOut: Date;
  additionalAmount: number;
  status: "pending" | "accepted" | "rejected";
  paymentIntentId?: string;
}

export interface IBooking extends Document {
  user: Types.ObjectId;
  service: Types.ObjectId;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalPrice: number;
  totalAmount: number;
  paymentStatus: boolean;
  paymentIntentId: string;
  status: "pending" | "booked" | "canceled" | "completed" | "rejected";
  isDeleted: boolean;
  bookingResponseTime: Date | null;
  cancelRequest: boolean;
  cancelRequestBy?: Types.ObjectId;
  cancelRequestDate?: Date;
  cancelReason?: string;
  refunded?: boolean;
  refundAmount?: number;
  refundType?: "Full" | "Partial";
  refundId?: string;
  extensionRequest?: boolean;
  extensionDetails?: IExtensionDetails;
  servicePrice: IServicePrice[];
  message?: string;
  type?: "private" | "public";
  packages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateBookingParams {
  customerId: string;
  serviceId: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  totalAmount: number;
  message?: string;
  addOnServices?: IServicePrice[];
  timezone?: string;
  type?: "private" | "public";
  packages?: string[];
}

export interface IUpdateBookingStatusParams {
  bookingId: string;
  status: "booked" | "rejected";
}

export interface ICancelBookingParams {
  bookingId: string;
  userId: string;
  cancelReason?: string;
}

export interface IRefundParams {
  bookingId: string;
  refundType: "Full" | "Partial";
  customAmount?: number;
  cancelReason?: string;
}

export interface IExtendBookingParams {
  bookingId: string;
  newCheckOut: Date;
  userId: string;
  addOnServices?: IServicePrice[];
  timezone?: string;
}

export interface IExtensionActionParams {
  bookingId: string;
  action: "accepted" | "rejected";
  paymentMethodId?: string;
}

export interface IBookingQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  cancelRequest?: string | boolean;
  search?: string;
  serviceTypeId?: string;
  isDeleted?: boolean;
}

export interface ICheckAvailabilityParams {
  serviceId: string;
  checkIn: Date;
  checkOut: Date;
  excludeBookingId?: string;
  timezone?: string;
}
