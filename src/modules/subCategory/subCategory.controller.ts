import httpStatus from "http-status";
import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as subCategoryService from "./subCategory.service";

export const createSubCategory = catchAsync(
  async (req: Request, res: Response) => {
    const subCategory = await subCategoryService.createSubCategory(req.body);
    res.status(httpStatus.CREATED).send({
      status: "success",
      data: subCategory,
    });
  }
);

export const getSubCategories = catchAsync(
  async (req: Request, res: Response) => {
    const filter = pick(req.query, ["name", "serviceCategory", "isDeleted"]);
    const options: IOptions = pick(req.query, [
      "sortBy",
      "limit",
      "page",
      "projectBy",
    ]);
    const result = await subCategoryService.querySubCategories(filter, options);
    res.send(result);
  }
);

export const getSubCategoriesByServiceCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
      const isDeleted = req.query["isDeleted"] === "true";
      const subCategories =
        await subCategoryService.getSubCategoriesByServiceCategoryId(
          new mongoose.Types.ObjectId(req.params["serviceCategoryId"]),
          isDeleted
        );
      res.status(httpStatus.OK).send({
        status: "success",
        results: subCategories.length,
        data: subCategories,
      });
    }
  }
);

export const getSubCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["subCategoryId"] === "string") {
      const subCategory = await subCategoryService.getSubCategoryById(
        new mongoose.Types.ObjectId(req.params["subCategoryId"])
      );
      if (!subCategory) {
        throw new ApiError("Sub category not found", httpStatus.NOT_FOUND);
      }
      res.send({
        status: "success",
        data: subCategory,
      });
    }
  }
);

export const updateSubCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["subCategoryId"] === "string") {
      const subCategory = await subCategoryService.updateSubCategoryById(
        new mongoose.Types.ObjectId(req.params["subCategoryId"]),
        req.body
      );
      res.send({
        status: "success",
        data: subCategory,
      });
    }
  }
);

export const deleteSubCategory = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["subCategoryId"] === "string") {
      const subCategory = await subCategoryService.deleteSubCategoryById(
        new mongoose.Types.ObjectId(req.params["subCategoryId"])
      );
      res.status(httpStatus.OK).send({
        status: "success",
        data: subCategory,
      });
    }
  }
);
