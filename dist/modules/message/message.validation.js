"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMessage = exports.createMessageBody = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createMessageBody = {
    chat: joi_1.default.string().required(),
    sender: joi_1.default.string().allow('', null),
    contentTitle: joi_1.default.string().allow('', null),
    content: joi_1.default.string().allow('', null),
    contentDescription: joi_1.default.string().allow('', null),
    contentDescriptionType: joi_1.default.string().allow('', null),
    contentType: joi_1.default.string().allow('', null),
    reactionsCount: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.number()).allow(null),
    userSettings: joi_1.default.array().items(joi_1.default.object({
        userId: joi_1.default.string().required(),
        readAt: joi_1.default.date().allow(null),
        deliveredAt: joi_1.default.date().allow(null),
        deletedAt: joi_1.default.date().allow(null)
    })).allow(null)
};
exports.createMessage = { body: joi_1.default.object().keys(exports.createMessageBody) };
