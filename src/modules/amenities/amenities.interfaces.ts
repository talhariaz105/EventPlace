import { Document, Model } from "mongoose";
import { QueryResult } from "../paginate/paginate";

export interface IAmenities {
  name: string;
  isDeleted: boolean;
  deletedAt?: Date;
}

export interface IAmenitiesDoc extends IAmenities, Document {
  id: string;
}

export interface IAmenitiesModel extends Model<IAmenitiesDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
}

export type UpdateAmenitiesBody = Partial<IAmenities>;

export type NewCreatedAmenities = Omit<IAmenities, "isDeleted" | "deletedAt">;
