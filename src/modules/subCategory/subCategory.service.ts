import httpStatus from "http-status";
import mongoose from "mongoose";
import SubCategory from "./subCategory.model";
import ApiError from "../errors/ApiError";
import { IOptions, QueryResult } from "../paginate/paginate";
import {
  ISubCategoryDoc,
  NewSubCategory,
  UpdateSubCategoryBody,
} from "./subCategory.interfaces";

/**
 * Create a sub category
 * @param {NewSubCategory} subCategoryBody
 * @returns {Promise<ISubCategoryDoc>}
 */
export const createSubCategory = async (
  subCategoryBody: NewSubCategory
): Promise<ISubCategoryDoc> => {
  const subCategory = await SubCategory.create(subCategoryBody);
  return subCategory;
};

/**
 * Query for sub categories
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
export const querySubCategories = async (
  filter: Record<string, any>,
  options: IOptions
): Promise<QueryResult> => {
  const subCategories = await SubCategory.paginate(filter, options);
  return subCategories;
};

/**
 * Get all sub categories by service category ID
 * @param {mongoose.Types.ObjectId} serviceCategoryId
 * @param {boolean} isDeleted
 * @returns {Promise<ISubCategoryDoc[]>}
 */
export const getSubCategoriesByServiceCategoryId = async (
  serviceCategoryId: mongoose.Types.ObjectId,
  isDeleted: boolean = false
): Promise<ISubCategoryDoc[]> => {
  const subCategories = await SubCategory.find({
    serviceCategory: serviceCategoryId,
    isDeleted,
  });
  return subCategories;
};

/**
 * Get sub category by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<ISubCategoryDoc | null>}
 */
export const getSubCategoryById = async (
  id: mongoose.Types.ObjectId
): Promise<ISubCategoryDoc | null> => {
  return SubCategory.findById(id);
};

/**
 * Update sub category by id
 * @param {mongoose.Types.ObjectId} subCategoryId
 * @param {UpdateSubCategoryBody} updateBody
 * @returns {Promise<ISubCategoryDoc | null>}
 */
export const updateSubCategoryById = async (
  subCategoryId: mongoose.Types.ObjectId,
  updateBody: UpdateSubCategoryBody
): Promise<ISubCategoryDoc | null> => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError("Sub category not found", httpStatus.NOT_FOUND);
  }

  // Update fields
  if (updateBody.name !== undefined) {
    subCategory.name = updateBody.name;
  }
  if (updateBody.serviceCategory !== undefined) {
    subCategory.serviceCategory = updateBody.serviceCategory;
  }
  if (updateBody.isDeleted !== undefined) {
    subCategory.isDeleted = updateBody.isDeleted;
  }

  await subCategory.save();
  return subCategory;
};

/**
 * Delete sub category by id
 * @param {mongoose.Types.ObjectId} subCategoryId
 * @returns {Promise<ISubCategoryDoc | null>}
 */
export const deleteSubCategoryById = async (
  subCategoryId: mongoose.Types.ObjectId
): Promise<ISubCategoryDoc | null> => {
  const subCategory = await getSubCategoryById(subCategoryId);
  if (!subCategory) {
    throw new ApiError("Sub category not found", httpStatus.NOT_FOUND);
  }
  await subCategory.deleteOne();
  return subCategory;
};
