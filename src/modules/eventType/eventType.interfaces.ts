import { Model, Document } from "mongoose";
import { QueryResult } from "../paginate/paginate";

export interface IEventType {
  name: string;
}

export interface IEventTypeDoc extends IEventType, Document {
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventTypeModel extends Model<IEventTypeDoc> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<QueryResult>;
}

export type NewEventType = IEventType;

export type UpdateEventTypeBody = Partial<IEventType>;
