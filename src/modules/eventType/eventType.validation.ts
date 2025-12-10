import Joi from "joi";
import { objectId } from "../validate/custom.validation";
import { NewEventType } from "./eventType.interfaces";

const eventTypeBody: Record<keyof NewEventType, any> = {
  name: Joi.string().required().trim().min(3),
};

export const createEventType = {
  body: Joi.object().keys(eventTypeBody),
};

export const getEventTypes = {
  query: Joi.object().keys({
    name: Joi.string(),
    search: Joi.string(),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getEventType = {
  params: Joi.object().keys({
    eventTypeId: Joi.string().custom(objectId),
  }),
};

export const updateEventType = {
  params: Joi.object().keys({
    eventTypeId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys(eventTypeBody).min(1),
};

export const deleteEventType = {
  params: Joi.object().keys({
    eventTypeId: Joi.string().custom(objectId),
  }),
};
