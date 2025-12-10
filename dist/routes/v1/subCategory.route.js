"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../modules/validate");
const auth_1 = require("../../modules/auth");
const subCategory_1 = require("../../modules/subCategory");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("subCategory"), (0, validate_1.validate)(subCategory_1.subCategoryValidation.createSubCategory), subCategory_1.subCategoryController.createSubCategory)
    .get((0, validate_1.validate)(subCategory_1.subCategoryValidation.getSubCategories), subCategory_1.subCategoryController.getSubCategories);
router
    .route("/by-service-category/:serviceCategoryId")
    .get((0, validate_1.validate)(subCategory_1.subCategoryValidation.getSubCategoriesByServiceCategory), subCategory_1.subCategoryController.getSubCategoriesByServiceCategory);
router
    .route("/:subCategoryId")
    .get((0, validate_1.validate)(subCategory_1.subCategoryValidation.getSubCategory), subCategory_1.subCategoryController.getSubCategory)
    .patch((0, auth_1.auth)("subCategory"), (0, validate_1.validate)(subCategory_1.subCategoryValidation.updateSubCategory), subCategory_1.subCategoryController.updateSubCategory)
    .delete((0, auth_1.auth)("subCategory"), (0, validate_1.validate)(subCategory_1.subCategoryValidation.deleteSubCategory), subCategory_1.subCategoryController.deleteSubCategory);
exports.default = router;
