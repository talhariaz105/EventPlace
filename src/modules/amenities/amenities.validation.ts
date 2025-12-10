import Joi from "joi";
import { objectId } from "../validate/custom.validation";
import { NewCreatedAmenities } from "./amenities.interfaces";

const createAmenitiesBody: Record<keyof NewCreatedAmenities, any> = {
  name: Joi.string().required().trim(),
};

export const createAmenities = {
  body: Joi.object().keys(createAmenitiesBody),
};

export const getAmenities = {
  query: Joi.object().keys({
    name: Joi.string(),
    isDeleted: Joi.boolean(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getAmenitiesById = {
  params: Joi.object().keys({
    amenitiesId: Joi.string().custom(objectId),
  }),
};

export const updateAmenities = {
  params: Joi.object().keys({
    amenitiesId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().trim(),
    })
    .min(1),
};

export const deleteAmenities = {
  params: Joi.object().keys({
    amenitiesId: Joi.string().custom(objectId),
  }),
};
