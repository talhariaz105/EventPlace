import { IMessageDoc } from "./message.interfaces";
import Joi from "joi";

export const createMessageBody: Partial<Record<keyof IMessageDoc, Joi.Schema>> = {
  chat: Joi.string().required(),
  sender: Joi.string().allow('', null),
  contentTitle: Joi.string().allow('', null),
  content: Joi.string().allow('', null),
  contentDescription: Joi.string().allow('', null),
  contentDescriptionType: Joi.string().allow('', null),
  contentType: Joi.string().allow('', null),
  reactionsCount: Joi.object().pattern(Joi.string(), Joi.number()).allow(null),
  userSettings: Joi.array().items(Joi.object({
    userId: Joi.string().required(),
    readAt: Joi.date().allow(null),
    deliveredAt: Joi.date().allow(null),
    deletedAt: Joi.date().allow(null)
  })).allow(null)
};
export const createMessage = { body: Joi.object().keys(createMessageBody) };