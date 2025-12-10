"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteServiceCategory = exports.updateServiceCategory = exports.getServiceCategory = exports.getServiceCategories = exports.createServiceCategory = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("../validate/custom.validation");
const serviceCategoryBody = {
    name: joi_1.default.string().required().trim().min(3),
    Icon: joi_1.default.string().optional().trim(),
    Key: joi_1.default.string().optional().trim(),
    isDeleted: joi_1.default.boolean().optional().default(false),
};
exports.createServiceCategory = {
    body: joi_1.default.object().keys({
        name: serviceCategoryBody.name,
        Icon: serviceCategoryBody.Icon.required(),
        Key: serviceCategoryBody.Key.required(),
        isDeleted: serviceCategoryBody.isDeleted,
    }),
};
exports.getServiceCategories = {
    query: joi_1.default.object().keys({
        name: joi_1.default.string(),
        search: joi_1.default.string(),
        sortBy: joi_1.default.string(),
        projectBy: joi_1.default.string(),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
exports.getServiceCategory = {
    params: joi_1.default.object().keys({
        serviceCategoryId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
exports.updateServiceCategory = {
    params: joi_1.default.object().keys({
        serviceCategoryId: joi_1.default.required().custom(custom_validation_1.objectId),
    }),
    body: joi_1.default.object()
        .keys({
        name: serviceCategoryBody.name.optional(),
        Icon: serviceCategoryBody.Icon,
        Key: serviceCategoryBody.Key,
        isDeleted: serviceCategoryBody.isDeleted,
    })
        .min(1),
};
exports.deleteServiceCategory = {
    params: joi_1.default.object().keys({
        serviceCategoryId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
