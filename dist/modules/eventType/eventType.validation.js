"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEventType = exports.updateEventType = exports.getEventType = exports.getEventTypes = exports.createEventType = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("../validate/custom.validation");
const eventTypeBody = {
    name: joi_1.default.string().required().trim().min(3),
};
exports.createEventType = {
    body: joi_1.default.object().keys(eventTypeBody),
};
exports.getEventTypes = {
    query: joi_1.default.object().keys({
        name: joi_1.default.string(),
        search: joi_1.default.string(),
        sortBy: joi_1.default.string(),
        projectBy: joi_1.default.string(),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
exports.getEventType = {
    params: joi_1.default.object().keys({
        eventTypeId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
exports.updateEventType = {
    params: joi_1.default.object().keys({
        eventTypeId: joi_1.default.required().custom(custom_validation_1.objectId),
    }),
    body: joi_1.default.object().keys(eventTypeBody).min(1),
};
exports.deleteEventType = {
    params: joi_1.default.object().keys({
        eventTypeId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
