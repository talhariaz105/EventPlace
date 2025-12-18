import httpStatus from "http-status";
import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import * as amenitiesService from "./amenities.service";

export const createAmenities = catchAsync(
  async (req: Request, res: Response) => {
    const amenities = await amenitiesService.createAmenities(req.body);
    res.status(httpStatus.CREATED).send(amenities);
  }
);

export const getAmenities = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["name"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "projectBy"]);

  // Add search functionality
  if (req.query["search"]) {
    filter.name = { $regex: req.query["search"], $options: "i" };
  }

  const result = await amenitiesService.queryAmenities(filter, options);
  res.send(result);
});

export const getAmenitiesById = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["amenitiesId"] === "string") {
      const amenities = await amenitiesService.getAmenitiesById(
        new mongoose.Types.ObjectId(req.params["amenitiesId"])
      );
      if (!amenities) {
        throw new ApiError("Amenities not found", httpStatus.NOT_FOUND);
      }
      res.send(amenities);
    }
  }
);

export const getNamesForDropdown = catchAsync(
  async (_req: Request, res: Response) => {
    const amenities = await amenitiesService.getNamesForDropdown();
    res.send(amenities);
  }
);

export const updateAmenities = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["amenitiesId"] === "string") {
      const amenities = await amenitiesService.updateAmenitiesById(
        new mongoose.Types.ObjectId(req.params["amenitiesId"]),
        req.body
      );
      res.send(amenities);
    }
  }
);

export const deleteAmenities = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["amenitiesId"] === "string") {
      await amenitiesService.deleteAmenitiesById(
        new mongoose.Types.ObjectId(req.params["amenitiesId"])
      );
      res.status(httpStatus.NO_CONTENT).send();
    }
  }
);
