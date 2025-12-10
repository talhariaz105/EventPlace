import httpStatus from "http-status";
import mongoose, { PipelineStage } from "mongoose";
import EventType from "./eventType.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  IEventTypeDoc,
  NewEventType,
  UpdateEventTypeBody,
} from "./eventType.interfaces";

/**
 * Create an event type
 * @param {NewEventType} eventTypeBody
 * @returns {Promise<IEventTypeDoc>}
 */
export const createEventType = async (
  eventTypeBody: NewEventType
): Promise<IEventTypeDoc> => {
  const eventType = await EventType.create(eventTypeBody);
  return eventType;
};

/**
 * Query for event types
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryEventTypes = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const eventTypes = await EventType.paginate(filter, options);
  return eventTypes;
};

/**
 * Get all event types with pagination and search
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
export const getEventTypes = async (queryParams: {
  page: number;
  limit: number;
  search?: string;
}): Promise<{
  eventTypes: IEventTypeDoc[];
  totalResults: number;
  currentPage: number;
  totalPages: number;
}> => {
  const { page = 1, limit = 10, search = "" } = queryParams;
  const skip = (page - 1) * limit;

  // Build match stage for search
  const matchStage: any = {};
  if (search) {
    matchStage.$or = [{ name: { $regex: search, $options: "i" } }];
  }

  const pipeline: PipelineStage[] = [
    { $match: matchStage },
    { $sort: { createdAt: -1 } },
    {
      $facet: {
        data: [
          { $skip: parseInt(skip.toString()) },
          { $limit: parseInt(limit.toString()) },
        ],
        totalCount: [{ $count: "count" }],
      },
    },
  ];

  const result = await EventType.aggregate(pipeline);
  const eventTypes = result[0].data;
  const totalResults = result[0].totalCount[0]?.count || 0;

  return {
    eventTypes,
    totalResults,
    currentPage: parseInt(page.toString()),
    totalPages: Math.ceil(totalResults / limit),
  };
};

/**
 * Get event type by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IEventTypeDoc | null>}
 */
export const getEventTypeById = async (
  id: mongoose.Types.ObjectId
): Promise<IEventTypeDoc | null> => {
  return EventType.findById(id);
};

/**
 * Update event type by id
 * @param {mongoose.Types.ObjectId} eventTypeId
 * @param {UpdateEventTypeBody} updateBody
 * @returns {Promise<IEventTypeDoc | null>}
 */
export const updateEventTypeById = async (
  eventTypeId: mongoose.Types.ObjectId,
  updateBody: UpdateEventTypeBody
): Promise<IEventTypeDoc | null> => {
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType) {
    throw new ApiError("Event type not found", httpStatus.NOT_FOUND);
  }
  Object.assign(eventType, updateBody);
  await eventType.save();
  return eventType;
};

/**
 * Delete event type by id
 * @param {mongoose.Types.ObjectId} eventTypeId
 * @returns {Promise<IEventTypeDoc | null>}
 */
export const deleteEventTypeById = async (
  eventTypeId: mongoose.Types.ObjectId
): Promise<IEventTypeDoc | null> => {
  const eventType = await getEventTypeById(eventTypeId);
  if (!eventType) {
    throw new ApiError("Event type not found", httpStatus.NOT_FOUND);
  }
  await eventType.deleteOne();
  return eventType;
};

/**
 * Get event type names for dropdown
 * @returns {Promise<Array<{_id: mongoose.Types.ObjectId, name: string}>>}
 */
export const getNamesForDropdown = async (): Promise<
  Array<{ _id: mongoose.Types.ObjectId; name: string }>
> => {
  const eventTypes = await EventType.find().select("name");
  return eventTypes;
};
