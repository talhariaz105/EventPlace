"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAmenities = exports.updateAmenities = exports.getAmenitiesById = exports.getAmenities = exports.createAmenities = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("../validate/custom.validation");
const createAmenitiesBody = {
    name: joi_1.default.string().required().trim(),
};
exports.createAmenities = {
    body: joi_1.default.object().keys(createAmenitiesBody),
};
exports.getAmenities = {
    query: joi_1.default.object().keys({
        name: joi_1.default.string(),
        isDeleted: joi_1.default.boolean(),
        sortBy: joi_1.default.string(),
        projectBy: joi_1.default.string(),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
exports.getAmenitiesById = {
    params: joi_1.default.object().keys({
        amenitiesId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
exports.updateAmenities = {
    params: joi_1.default.object().keys({
        amenitiesId: joi_1.default.required().custom(custom_validation_1.objectId),
    }),
    body: joi_1.default.object()
        .keys({
        name: joi_1.default.string().trim(),
    })
        .min(1),
};
exports.deleteAmenities = {
    params: joi_1.default.object().keys({
        amenitiesId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
