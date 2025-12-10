import { Model, Document } from "mongoose";
import { QueryResult } from "../paginate/paginate";

export interface IServiceCategory {
  name: string;
  Icon?: string;
  Key?: string;
  isDeleted?: boolean;
}

export interface IServiceCategoryDoc extends IServiceCategory, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IServiceCategoryModel extends Model<IServiceCategoryDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
}

export type NewServiceCategory = IServiceCategory;

export type UpdateServiceCategoryBody = Partial<IServiceCategory>;
