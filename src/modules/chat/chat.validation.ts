import {ICreateChat} from "./chat.interfaces";  
import Joi from "joi";

const createChatBody: Record<keyof ICreateChat, Joi.Schema> = {
  obj: Joi.string().required(),
  chatOf: Joi.string().required(),
  workspace: Joi.string().required()
};

export const createChat = { body: Joi.object().keys(createChatBody) };