import Joi from "joi";
import { objectId } from "../validate/custom.validation";
import { NewSubCategory } from "./subCategory.interfaces";

const subCategoryBody: Record<keyof NewSubCategory, any> = {
  serviceCategory: Joi.string().custom(objectId).required(),
  name: Joi.string().required().trim().min(3),
  isDeleted: Joi.boolean().optional().default(false),
};

export const createSubCategory = {
  body: Joi.object().keys({
    serviceCategory: subCategoryBody.serviceCategory,
    name: subCategoryBody.name,
    isDeleted: subCategoryBody.isDeleted,
  }),
};

export const getSubCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    serviceCategory: Joi.string().custom(objectId),
    isDeleted: Joi.boolean(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getSubCategoriesByServiceCategory = {
  params: Joi.object().keys({
    serviceCategoryId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    isDeleted: Joi.boolean().optional().default(false),
  }),
};

export const getSubCategory = {
  params: Joi.object().keys({
    subCategoryId: Joi.string().custom(objectId),
  }),
};

export const updateSubCategory = {
  params: Joi.object().keys({
    subCategoryId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      serviceCategory: subCategoryBody.serviceCategory.optional(),
      name: subCategoryBody.name.optional(),
      isDeleted: subCategoryBody.isDeleted,
    })
    .min(1),
};

export const deleteSubCategory = {
  params: Joi.object().keys({
    subCategoryId: Joi.string().custom(objectId),
  }),
};
