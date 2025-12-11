import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import { listingsController, listingsValidation } from "../../modules/listings";

const router: Router = express.Router();

// Create listing (both venue and vendor)
router
  .route("/")
  .post(
    auth("manageUsers"),
    validate(listingsValidation.createListings),
    listingsController.createListing
  );

// Get all venues with aggregation
router
  .route("/venues")
  .get(validate(listingsValidation.getListings), listingsController.getVenues);

// Get all vendors with aggregation
router
  .route("/vendors")
  .get(validate(listingsValidation.getListings), listingsController.getVendors);

// Get listings by vendor user ID
router
  .route("/vendor/:vendorId")
  .get(
    validate(listingsValidation.getListingsByVendorId),
    listingsController.getListingsByVendorId
  );

// Get, update, delete single listing (venue or vendor)
router
  .route("/:listingsId")
  .get(
    validate(listingsValidation.getListingsById),
    listingsController.getListingById
  )
  .patch(
    auth("manageUsers"),
    validate(listingsValidation.updateListings),
    listingsController.updateListing
  )
  .delete(
    auth("manageUsers"),
    validate(listingsValidation.deleteListings),
    listingsController.deleteListing
  );

export default router;
