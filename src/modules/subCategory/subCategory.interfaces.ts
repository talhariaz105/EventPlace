import mongoose, { Model, Document } from "mongoose";
import { QueryResult } from "../paginate/paginate";

export interface ISubCategory {
  serviceCategory: mongoose.Types.ObjectId;
  name: string;
  isDeleted?: boolean;
}

export interface ISubCategoryDoc extends ISubCategory, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubCategoryModel extends Model<ISubCategoryDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
}

export type NewSubCategory = ISubCategory;

export type UpdateSubCategoryBody = Partial<ISubCategory>;
