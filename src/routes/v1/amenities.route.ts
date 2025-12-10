import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import {
  amenitiesController,
  amenitiesValidation,
} from "../../modules/amenities";

const router: Router = express.Router();

router
  .route("/")
  .post(
    auth("Amenities"),
    validate(amenitiesValidation.createAmenities),
    amenitiesController.createAmenities
  )
  .get(
    validate(amenitiesValidation.getAmenities),
    amenitiesController.getAmenities
  );

router.route("/dropdown").get(amenitiesController.getNamesForDropdown);

router
  .route("/:amenitiesId")
  .get(
    validate(amenitiesValidation.getAmenitiesById),
    amenitiesController.getAmenitiesById
  )
  .patch(
    auth("Amenities"),
    validate(amenitiesValidation.updateAmenities),
    amenitiesController.updateAmenities
  )
  .delete(
    auth("Amenities"),
    validate(amenitiesValidation.deleteAmenities),
    amenitiesController.deleteAmenities
  );

export default router;
