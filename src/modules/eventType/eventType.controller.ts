import httpStatus from "http-status";
import { Request, Response } from "express";
import mongoose from "mongoose";
import catchAsync from "../utils/catchAsync";
import ApiError from "../errors/ApiError";
import pick from "../utils/pick";
import { IOptions } from "../paginate/paginate";
import * as eventTypeService from "./eventType.service";

export const createEventType = catchAsync(
  async (req: Request, res: Response) => {
    const eventType = await eventTypeService.createEventType(req.body);
    res.status(httpStatus.CREATED).send({
      status: "success",
      data: {
        eventType,
      },
    });
  }
);

export const getEventTypes = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["name"]);
  const options: IOptions = pick(req.query, [
    "sortBy",
    "limit",
    "page",
    "projectBy",
  ]);
  const result = await eventTypeService.queryEventTypes(filter, options);
  res.send(result);
});

export const getAllEventTypes = catchAsync(
  async (req: Request, res: Response) => {
    const { page, limit, search } = req.query;

    const queryParams: {
      page: number;
      limit: number;
      search?: string;
    } = {
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      search: search as string,
    };

    const data = await eventTypeService.getEventTypes(queryParams);

    res.status(httpStatus.OK).send({
      status: "success",
      results: data.eventTypes.length,
      totalResults: data.totalResults,
      currentPage: data.currentPage,
      totalPages: data.totalPages,
      data: {
        eventTypes: data.eventTypes,
      },
    });
  }
);

export const getEventType = catchAsync(async (req: Request, res: Response) => {
  if (typeof req.params["eventTypeId"] === "string") {
    const eventType = await eventTypeService.getEventTypeById(
      new mongoose.Types.ObjectId(req.params["eventTypeId"])
    );
    if (!eventType) {
      throw new ApiError("Event type not found", httpStatus.NOT_FOUND);
    }
    res.send({
      status: "success",
      data: {
        eventType,
      },
    });
  }
});

export const updateEventType = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["eventTypeId"] === "string") {
      const eventType = await eventTypeService.updateEventTypeById(
        new mongoose.Types.ObjectId(req.params["eventTypeId"]),
        req.body
      );
      res.send({
        status: "success",
        data: {
          eventType,
        },
      });
    }
  }
);

export const deleteEventType = catchAsync(
  async (req: Request, res: Response) => {
    if (typeof req.params["eventTypeId"] === "string") {
      await eventTypeService.deleteEventTypeById(
        new mongoose.Types.ObjectId(req.params["eventTypeId"])
      );
      res.status(httpStatus.NO_CONTENT).send();
    }
  }
);

export const getNamesForDropdown = catchAsync(
  async (_req: Request, res: Response) => {
    const eventTypes = await eventTypeService.getNamesForDropdown();
    res.status(httpStatus.OK).send({
      status: "success",
      data: {
        eventTypes,
      },
    });
  }
);
