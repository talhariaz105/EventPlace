"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyListings = exports.getAdminListings = exports.deleteListing = exports.updateListing = exports.getListingsByVendorId = exports.getListingById = exports.getVendors = exports.getVenues = exports.createListing = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const pick_1 = __importDefault(require("../utils/pick"));
const listingsService = __importStar(require("./listings.service"));
/**
 * Create a listing (venue or vendor)
 */
exports.createListing = (0, catchAsync_1.default)(async (req, res) => {
    const listing = await listingsService.createListing({
        vendorId: req.user._id,
        ...req.body,
    });
    res.status(http_status_1.default.CREATED).send(listing);
});
/**
 * Get all venues with aggregation and pagination
 */
exports.getVenues = (0, catchAsync_1.default)(async (req, res) => {
    const options = (0, pick_1.default)(req.query, ["sortBy", "limit", "page"]);
    const result = await listingsService.queryVenuesandVendor(req.query, options);
    res.send(result);
});
/**
 * Get all vendors with aggregation and pagination
 */
exports.getVendors = (0, catchAsync_1.default)(async (req, res) => {
    const options = (0, pick_1.default)(req.query, ["sortBy", "limit", "page"]);
    const result = await listingsService.queryVenuesandVendor(req.query, options);
    res.send(result);
});
/**
 * Get listing by ID (venue or vendor)
 */
exports.getListingById = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["listingsId"] === "string") {
        const listing = await listingsService.getListingById(new mongoose_1.default.Types.ObjectId(req.params["listingsId"]));
        res.send(listing);
    }
});
/**
 * Get listings by vendor user ID
 */
exports.getListingsByVendorId = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["vendorId"] === "string") {
        const options = (0, pick_1.default)(req.query, ["type", "limit", "page"]);
        const result = await listingsService.getListingsByVendorId(new mongoose_1.default.Types.ObjectId(req.params["vendorId"]), options);
        res.send(result);
    }
});
/**
 * Update listing (venue or vendor)
 */
exports.updateListing = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["listingsId"] === "string") {
        const listing = await listingsService.updateListingById(new mongoose_1.default.Types.ObjectId(req.params["listingsId"]), req.body);
        res.send(listing);
    }
});
/**
 * Delete listing (soft delete)
 */
exports.deleteListing = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["listingsId"] === "string") {
        await listingsService.deleteListingById(new mongoose_1.default.Types.ObjectId(req.params["listingsId"]));
        res.status(http_status_1.default.NO_CONTENT).send();
    }
});
/**
 * Get all listings for admin
 */
exports.getAdminListings = (0, catchAsync_1.default)(async (req, res) => {
    const options = (0, pick_1.default)(req.query, ["limit", "page", "type"]);
    const result = await listingsService.getAdminListings(options);
    res.send(result);
});
/**
 * Get my listings for logged-in vendor user
 */
exports.getMyListings = (0, catchAsync_1.default)(async (req, res) => {
    const vendorId = req.user?.id; // Assuming user ID is available from auth middleware
    if (!vendorId) {
        res.status(http_status_1.default.UNAUTHORIZED).send({ message: "Unauthorized" });
        return;
    }
    const options = (0, pick_1.default)(req.query, ["limit", "page", "type"]);
    const result = await listingsService.getMyListings(new mongoose_1.default.Types.ObjectId(vendorId), options);
    res.send(result);
});
