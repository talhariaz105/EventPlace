import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import {
  serviceCategoryController,
  serviceCategoryValidation,
} from "../../modules/serviceCategory";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("serviceCategory"),
    validate(serviceCategoryValidation.createServiceCategory),
    serviceCategoryController.createServiceCategory
  )
  .get(serviceCategoryController.getAllCategories);

router
  .route("/with-count")
  .get(serviceCategoryController.getServiceCategoriesWithSubCategoryCount);

router
  .route("/:serviceCategoryId")
  .get(
    validate(serviceCategoryValidation.getServiceCategory),
    serviceCategoryController.getServiceCategory
  )
  .patch(
    auth("serviceCategory"),
    validate(serviceCategoryValidation.updateServiceCategory),
    serviceCategoryController.updateServiceCategory
  )
  .delete(
    auth("serviceCategory"),
    validate(serviceCategoryValidation.deleteServiceCategory),
    serviceCategoryController.deleteServiceCategory
  );

export default router;
