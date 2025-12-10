import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import {
  subCategoryController,
  subCategoryValidation,
} from "../../modules/subCategory";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("subCategory"),
    validate(subCategoryValidation.createSubCategory),
    subCategoryController.createSubCategory
  )
  .get(
    validate(subCategoryValidation.getSubCategories),
    subCategoryController.getSubCategories
  );

router
  .route("/by-service-category/:serviceCategoryId")
  .get(
    validate(subCategoryValidation.getSubCategoriesByServiceCategory),
    subCategoryController.getSubCategoriesByServiceCategory
  );

router
  .route("/:subCategoryId")
  .get(
    validate(subCategoryValidation.getSubCategory),
    subCategoryController.getSubCategory
  )
  .patch(
    auth("subCategory"),
    validate(subCategoryValidation.updateSubCategory),
    subCategoryController.updateSubCategory
  )
  .delete(
    auth("subCategory"),
    validate(subCategoryValidation.deleteSubCategory),
    subCategoryController.deleteSubCategory
  );

export default router;
