import httpStatus from "http-status";
import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as serviceCategoryService from "./serviceCategory.service";
import { deleteMedia } from "../upload/upload.middleware";

export const createServiceCategory = catchAsync(
  async (req: Request, res: Response) => {
    const serviceCategory = await serviceCategoryService.createServiceCategory(
      req.body
    );
    res.status(httpStatus.CREATED).send({
      status: "success",
      data: serviceCategory,
    });
  }
);

export const getServiceCategories = catchAsync(
  async (req: Request, res: Response) => {
    const filter = pick(req.query, ["name"]);
    const options: IOptions = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "projectBy",
    ]);
    const result = await serviceCategoryService.queryServiceCategories(
      filter,
      options
    );
    res.send(result);
  }
);

export const getAllCategories = catchAsync(
  async (_req: Request, res: Response) => {
    const categories = await serviceCategoryService.getAllCategories();
    res.status(httpStatus.OK).send({
      status: "success",
      results: categories.length,
      data: categories,
    });
  }
);

export const getServiceCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
      const serviceCategory =
        await serviceCategoryService.getServiceCategoryById(
          new mongoose.Types.ObjectId(req.params["serviceCategoryId"])
        );
      if (!serviceCategory) {
        throw new ApiError("Service category not found", httpStatus.NOT_FOUND);
      }
      res.send({
        status: "success",
        data: serviceCategory,
      });
    }
  }
);

export const updateServiceCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
      const serviceCategory =
        await serviceCategoryService.updateServiceCategoryById(
          new mongoose.Types.ObjectId(req.params["serviceCategoryId"]),
          req.body,
          deleteMedia
        );
      res.send({
        status: "success",
        data: serviceCategory,
      });
    }
  }
);

export const deleteServiceCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
      await serviceCategoryService.deleteServiceCategoryById(
        new mongoose.Types.ObjectId(req.params["serviceCategoryId"])
      );
      res.status(httpStatus.OK).send({
        status: "success",
        data: null,
      });
    }
  }
);
