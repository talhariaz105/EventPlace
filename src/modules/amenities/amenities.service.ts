import httpStatus from "http-status";
import mongoose from "mongoose";
import Amenities from "./amenities.model";
import ApiError from "../errors/ApiError";
import {
  IAmenitiesDoc,
  NewCreatedAmenities,
  UpdateAmenitiesBody,
} from "./amenities.interfaces";
import { QueryResult } from "../paginate/paginate";

/**
 * Create an amenities
 * @param {NewCreatedAmenities} amenitiesBody
 * @returns {Promise<IAmenitiesDoc>}
 */
export const createAmenities = async (
  amenitiesBody: NewCreatedAmenities
): Promise<IAmenitiesDoc> => {
  return Amenities.create(amenitiesBody);
};

/**
 * Query for amenities
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryAmenities = async (
  filter: Record<string, any>,
  options: Record<string, any>
): Promise<QueryResult> => {
  const amenities = await Amenities.paginate(filter, options);
  return amenities;
};

/**
 * Get amenities by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IAmenitiesDoc | null>}
 */
export const getAmenitiesById = async (
  id: mongoose.Types.ObjectId
): Promise<IAmenitiesDoc | null> => Amenities.findById(id);

/**
 * Update amenities by id
 * @param {mongoose.Types.ObjectId} amenitiesId
 * @param {UpdateAmenitiesBody} updateBody
 * @returns {Promise<IAmenitiesDoc | null>}
 */
export const updateAmenitiesById = async (
  amenitiesId: mongoose.Types.ObjectId,
  updateBody: UpdateAmenitiesBody
): Promise<IAmenitiesDoc | null> => {
  const amenities = await getAmenitiesById(amenitiesId);
  if (!amenities) {
    throw new ApiError("Amenities not found", httpStatus.NOT_FOUND);
  }
  Object.assign(amenities, updateBody);
  await amenities.save();
  return amenities;
};

/**
 * Delete amenities by id (soft delete)
 * @param {mongoose.Types.ObjectId} amenitiesId
 * @returns {Promise<IAmenitiesDoc | null>}
 */
export const deleteAmenitiesById = async (
  amenitiesId: mongoose.Types.ObjectId
): Promise<IAmenitiesDoc | null> => {
   await Amenities.findByIdAndDelete(amenitiesId);
   return null;
};

/**
 * Get all amenities names for dropdown
 * @returns {Promise<Array<{id: string, name: string}>>}
 */
export const getNamesForDropdown = async (): Promise<
  Array<{ id: string; name: string }>
> => {
  const amenities = await Amenities.find({},
    { name: 1 ,icon: 1}
  ).lean();
  return amenities.map((item) => ({
    id: item._id.toString(),
    name: item.name,
    icon: item.icon,
  }));
};
