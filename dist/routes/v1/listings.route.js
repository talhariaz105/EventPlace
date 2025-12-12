"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../../modules/validate");
const auth_1 = require("../../modules/auth");
const listings_1 = require("../../modules/listings");
const router = express_1.default.Router();
// Create listing (both venue and vendor)
router
    .route("/")
    .post((0, auth_1.auth)("Listings"), (0, validate_1.validate)(listings_1.listingsValidation.createListings), listings_1.listingsController.createListing);
// Get all venues with aggregation
router
    .route("/venues")
    .get((0, validate_1.validate)(listings_1.listingsValidation.getListings), listings_1.listingsController.getVenues);
// Get all vendors with aggregation
router
    .route("/vendors")
    .get((0, validate_1.validate)(listings_1.listingsValidation.getListings), listings_1.listingsController.getVendors);
// Admin - get all listings
router
    .route("/admin")
    .get((0, auth_1.auth)("manageUsers"), (0, validate_1.validate)(listings_1.listingsValidation.getAdminOrMyListings), listings_1.listingsController.getAdminListings);
// Vendor - get my listings
router
    .route("/my-listings")
    .get((0, auth_1.auth)(), (0, validate_1.validate)(listings_1.listingsValidation.getAdminOrMyListings), listings_1.listingsController.getMyListings);
// Get listings by vendor user ID
router
    .route("/vendor/:vendorId")
    .get((0, validate_1.validate)(listings_1.listingsValidation.getListingsByVendorId), listings_1.listingsController.getListingsByVendorId);
// Get, update, delete single listing (venue or vendor)
router
    .route("/:listingsId")
    .get((0, validate_1.validate)(listings_1.listingsValidation.getListingsById), listings_1.listingsController.getListingById)
    .patch((0, auth_1.auth)("Listings"), (0, validate_1.validate)(listings_1.listingsValidation.updateListings), listings_1.listingsController.updateListing)
    .delete((0, auth_1.auth)("Listings"), (0, validate_1.validate)(listings_1.listingsValidation.deleteListings), listings_1.listingsController.deleteListing);
exports.default = router;
