"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../modules/validate");
const auth_1 = require("../../modules/auth");
const serviceCategory_1 = require("../../modules/serviceCategory");
const router = express_1.default.Router();
router
    .route("/")
    .post((0, auth_1.auth)("serviceCategory"), (0, validate_1.validate)(serviceCategory_1.serviceCategoryValidation.createServiceCategory), serviceCategory_1.serviceCategoryController.createServiceCategory)
    .get(serviceCategory_1.serviceCategoryController.getAllCategories);
router
    .route("/with-count")
    .get(serviceCategory_1.serviceCategoryController.getServiceCategoriesWithSubCategoryCount);
router
    .route("/:serviceCategoryId")
    .get((0, validate_1.validate)(serviceCategory_1.serviceCategoryValidation.getServiceCategory), serviceCategory_1.serviceCategoryController.getServiceCategory)
    .patch((0, auth_1.auth)("serviceCategory"), (0, validate_1.validate)(serviceCategory_1.serviceCategoryValidation.updateServiceCategory), serviceCategory_1.serviceCategoryController.updateServiceCategory)
    .delete((0, auth_1.auth)("serviceCategory"), (0, validate_1.validate)(serviceCategory_1.serviceCategoryValidation.deleteServiceCategory), serviceCategory_1.serviceCategoryController.deleteServiceCategory);
exports.default = router;
