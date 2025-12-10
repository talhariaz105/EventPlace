"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubCategory = exports.updateSubCategory = exports.getSubCategory = exports.getSubCategoriesByServiceCategory = exports.getSubCategories = exports.createSubCategory = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("../validate/custom.validation");
const subCategoryBody = {
    serviceCategory: joi_1.default.string().custom(custom_validation_1.objectId).required(),
    name: joi_1.default.string().required().trim().min(3),
    isDeleted: joi_1.default.boolean().optional().default(false),
};
exports.createSubCategory = {
    body: joi_1.default.object().keys({
        serviceCategory: subCategoryBody.serviceCategory,
        name: subCategoryBody.name,
        isDeleted: subCategoryBody.isDeleted,
    }),
};
exports.getSubCategories = {
    query: joi_1.default.object().keys({
        name: joi_1.default.string(),
        serviceCategory: joi_1.default.string().custom(custom_validation_1.objectId),
        isDeleted: joi_1.default.boolean(),
        sortBy: joi_1.default.string(),
        projectBy: joi_1.default.string(),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
exports.getSubCategoriesByServiceCategory = {
    params: joi_1.default.object().keys({
        serviceCategoryId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
    query: joi_1.default.object().keys({
        isDeleted: joi_1.default.boolean().optional().default(false),
    }),
};
exports.getSubCategory = {
    params: joi_1.default.object().keys({
        subCategoryId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
exports.updateSubCategory = {
    params: joi_1.default.object().keys({
        subCategoryId: joi_1.default.required().custom(custom_validation_1.objectId),
    }),
    body: joi_1.default.object()
        .keys({
        serviceCategory: subCategoryBody.serviceCategory.optional(),
        name: subCategoryBody.name.optional(),
        isDeleted: subCategoryBody.isDeleted,
    })
        .min(1),
};
exports.deleteSubCategory = {
    params: joi_1.default.object().keys({
        subCategoryId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
