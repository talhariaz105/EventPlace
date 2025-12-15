import httpStatus from "http-status";
import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import pick from "../utils/pick";
import * as listingsService from "./listings.service";

/**
 * Create a listing (venue or vendor)
 */
export const createListing = catchAsync(async (req: Request, res: Response) => {
  const listing = await listingsService.createListing({
    vendorId: req.user._id,
    ...req.body,
  });
  res.status(httpStatus.CREATED).send(listing);
});

/**
 * Get all venues with aggregation and pagination
 */
export const getVenues = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await listingsService.queryVenuesandVendor(req.query, options);
  res.send(result);
});

/**
 * Get all vendors with aggregation and pagination
 */
export const getVendors = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["sortBy", "limit", "page"]);
  const result = await listingsService.queryVenuesandVendor(req.query, options);
  res.send(result);
});

/**
 * Get listing by ID (venue or vendor)
 */
export const getListingById = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["listingsId"] === "string") {
      const listing = await listingsService.getListingById(
        new mongoose.Types.ObjectId(req.params["listingsId"])
      );
      res.send(listing);
    }
  }
);

/**
 * Get listings by vendor user ID
 */
export const getListingsByVendorId = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["vendorId"] === "string") {
      const options = pick(req.query, ["listingtype", "limit", "page"]);
      const result = await listingsService.getListingsByVendorId(
        new mongoose.Types.ObjectId(req.params["vendorId"]),
        options
      );
      res.send(result);
    }
  }
);

/**
 * Update listing (venue or vendor)
 */
export const updateListing = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params["listingsId"] === "string") {
    const listing = await listingsService.updateListingById(
      new mongoose.Types.ObjectId(req.params["listingsId"]),
      req.body
    );
    res.send(listing);
  }
});

/**
 * Delete listing (soft delete)
 */
export const deleteListing = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params["listingsId"] === "string") {
    await listingsService.deleteListingById(
      new mongoose.Types.ObjectId(req.params["listingsId"])
    );
    res.status(httpStatus.NO_CONTENT).send();
  }
});

/**
 * Get all listings for admin
 */
export const getAdminListings = catchAsync(
  async (req: Request, res: Response) => {
    const options = pick(req.query, ["limit", "page", "type"]);
    const result = await listingsService.getAdminListings(options);
    res.send(result);
  }
);

/**
 * Get my listings for logged-in vendor user
 */
export const getMyListings = catchAsync(async (req: Request, res: Response) => {
  const vendorId = req.user?.id; // Assuming user ID is available from auth middleware
  if (!vendorId) {
    res.status(httpStatus.UNAUTHORIZED).send({ message: "Unauthorized" });
    return;
  }
  const options = pick(req.query, ["limit", "page", "listingtype"]);
  const result = await listingsService.getMyListings(
    new mongoose.Types.ObjectId(vendorId),
    options
  );
  res.send(result);
});
