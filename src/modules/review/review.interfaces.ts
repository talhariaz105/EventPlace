import { Document, Types } from "mongoose";

export interface IReview extends Document {
  reviewer: Types.ObjectId;
  reviewOn: Types.ObjectId;
  reviewType: "positive" | "negative";
  rating: number;
  comment?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  hide: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewQueryParams {
  page?: number;
  limit?: number;
  serviceCategories?: string | string[];
  reviewType?: "positive" | "negative";
  owners?: string | string[];
  ratings?: number | number[];
  search?: string;
  isDeleted?: boolean;
  reviewerRole?: string;
}

export interface IReviewServiceParams {
  page?: number;
  limit?: number;
  reviewType?: "positive" | "negative";
  isDeleted?: boolean;
}
