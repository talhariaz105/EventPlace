import express, { Router } from "express";
import { validate } from "../../modules/validate";
import { auth } from "../../modules/auth";
import { listingsController, listingsValidation } from "../../modules/listings";

const router: Router = express.Router();

// Create listing (both venue and vendor)
router
  .route("/")
  .post(
    auth("Listings"),
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

// Admin - get all listings
router
  .route("/admin")
  .get(
    auth("manageUsers"),
    validate(listingsValidation.getAdminOrMyListings),
    listingsController.getAdminListings
  );

// Vendor - get my listings
router
  .route("/my-listings")
  .get(
    auth(),
    validate(listingsValidation.getAdminOrMyListings),
    listingsController.getMyListings
  );

// Get saved listings for current user
router
  .route("/saved")
  .get(
    auth(),
    validate(listingsValidation.getAdminOrMyListings),
    listingsController.getSavedListings
  );

// Toggle save/unsave listing
router
  .route("/:listingsId/save")
  .post(
    auth(),
    validate(listingsValidation.getListingsById),
    listingsController.toggleSaveListing
  );

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
    auth("Listings"),
    validate(listingsValidation.updateListings),
    listingsController.updateListing
  )
  .delete(
    auth("Listings"),
    validate(listingsValidation.deleteListings),
    listingsController.deleteListing
  );

export default router;
