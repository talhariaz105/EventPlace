import Joi from "joi";
import { objectId } from "../validate/custom.validation";
import { NewServiceCategory } from "./serviceCategory.interfaces";

const serviceCategoryBody: Record<keyof NewServiceCategory, any> = {
  name: Joi.string().required().trim().min(3),
  Icon: Joi.string().optional().trim(),
  Key: Joi.string().optional().trim(),
  isDeleted: Joi.boolean().optional().default(false),
};

export const createServiceCategory = {
  body: Joi.object().keys({
    name: serviceCategoryBody.name,
    Icon: serviceCategoryBody.Icon.required(),
    Key: serviceCategoryBody.Key.required(),
    isDeleted: serviceCategoryBody.isDeleted,
  }),
};

export const getServiceCategories = {
  query: Joi.object().keys({
    name: Joi.string(),
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getServiceCategory = {
  params: Joi.object().keys({
    serviceCategoryId: Joi.string().custom(objectId),
  }),
};

export const updateServiceCategory = {
  params: Joi.object().keys({
    serviceCategoryId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: serviceCategoryBody.name.optional(),
      Icon: serviceCategoryBody.Icon,
      Key: serviceCategoryBody.Key,
      isDeleted: serviceCategoryBody.isDeleted,
    })
    .min(1),
};

export const deleteServiceCategory = {
  params: Joi.object().keys({
    serviceCategoryId: Joi.string().custom(objectId),
  }),
};
