import httpStatus from "http-status";
import mongoose from "mongoose";
import ServiceCategory from "./serviceCategory.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  IServiceCategoryDoc,
  NewServiceCategory,
  UpdateServiceCategoryBody,
} from "./serviceCategory.interfaces";

/**
 * Create a service category
 * @param {NewServiceCategory} serviceCategoryBody
 * @returns {Promise<IServiceCategoryDoc>}
 */
export const createServiceCategory = async (
  serviceCategoryBody: NewServiceCategory
): Promise<IServiceCategoryDoc> => {
  const serviceCategory = await ServiceCategory.create(serviceCategoryBody);
  return serviceCategory;
};

/**
 * Query for service categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const queryServiceCategories = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const serviceCategories = await ServiceCategory.paginate(filter, options);
  return serviceCategories;
};

/**
 * Get all service categories (non-deleted only)
 * @returns {Promise<IServiceCategoryDoc[]>}
 */
export const getAllCategories = async (): Promise<IServiceCategoryDoc[]> => {
  const categories = await ServiceCategory.find({
    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
  });
  return categories;
};

/**
 * Get service category by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IServiceCategoryDoc | null>}
 */
export const getServiceCategoryById = async (
  id: mongoose.Types.ObjectId
): Promise<IServiceCategoryDoc | null> => {
  const category = await ServiceCategory.findOne({
    _id: id,
    $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
  });
  return category;
};

/**
 * Update service category by id
 * @param {mongoose.Types.ObjectId} serviceCategoryId
 * @param {UpdateServiceCategoryBody} updateBody
 * @param {Function} deleteMediaFn - Optional function to delete old media from storage
 * @returns {Promise<IServiceCategoryDoc | null>}
 */
export const updateServiceCategoryById = async (
  serviceCategoryId: mongoose.Types.ObjectId,
  updateBody: UpdateServiceCategoryBody,
  deleteMediaFn?: (key: string) => Promise<any>
): Promise<IServiceCategoryDoc | null> => {
  const serviceCategory = await getServiceCategoryById(serviceCategoryId);
  if (!serviceCategory) {
    throw new ApiError("Service category not found", httpStatus.NOT_FOUND);
  }

  // Handle icon update - delete old icon if new one is provided
  if (
    updateBody.Icon !== undefined &&
    serviceCategory.Icon !== updateBody.Icon
  ) {
    if (serviceCategory.Key && deleteMediaFn) {
      await deleteMediaFn(serviceCategory.Key);
    }
    serviceCategory.Icon = updateBody.Icon;
    serviceCategory.Key = updateBody.Key || "";
  }

  // Update name
  if (updateBody.name !== undefined) {
    serviceCategory.name = updateBody.name;
  }

  await serviceCategory.save();
  return serviceCategory;
};

/**
 * Soft delete service category by id
 * @param {mongoose.Types.ObjectId} serviceCategoryId
 * @returns {Promise<IServiceCategoryDoc | null>}
 */
export const deleteServiceCategoryById = async (
  serviceCategoryId: mongoose.Types.ObjectId
): Promise<IServiceCategoryDoc | null> => {
  const serviceCategory = await ServiceCategory.findOneAndUpdate(
    {
      _id: serviceCategoryId,
      $or: [{ isDeleted: { $exists: false } }, { isDeleted: false }],
    },
    { isDeleted: true },
    { new: true }
  );

  if (!serviceCategory) {
    throw new ApiError("Service category not found", httpStatus.NOT_FOUND);
  }

  return serviceCategory;
};
