import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import * as reviewService from "./review.service";
import { reviewValidation } from "./review.validation";
import { ApiError } from "../errors";

/**
 * Add a new review
 */
export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { error } = reviewValidation.createReview.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errorFields = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      throw new ApiError("Validation failed", httpStatus.BAD_REQUEST, {
        errorFields,
      });
    }

    const result = await reviewService.createReview(
      (req as any).user._id,
      (req as any).user.role,
      req.body
    );

    // Store review ID for potential audit logging
    res.locals["dataId"] = result.review._id;

    // Send notification (implement your notification logic)
    // await sendNotification({
    //   userId: result.notificationData.userId,
    //   title: 'New Review',
    //   message: `${req.user.firstName} ${req.user.lastName} has reviewed your service`,
    //   type: 'review',
    //   fortype: 'venue_feedback',
    //   permission: 'review'
    // });

    res.status(httpStatus.CREATED).json({
      status: "success",
      data: {
        review: result.review,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all reviews with filtering
 */
export const getAllReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await reviewService.getAllReviews(req.query);

    res.status(httpStatus.OK).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews for a specific service
 */
export const getReviewsForService = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await reviewService.getReviewsForService(
      req.params["id"]!,
      req.query
    );

    res.status(httpStatus.OK).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a review by ID
 */
export const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await reviewService.getReviewById(req.params["id"]!);

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 */
export const editReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate request body
    const { error } = reviewValidation.updateReview.validate(req.body, {
      abortEarly: false,
      allowUnknown: true,
    });

    if (error) {
      const errorFields = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));
      throw new ApiError("Validation failed", httpStatus.BAD_REQUEST, {
        errorFields,
      });
    }

    const updatedReview = await reviewService.updateReview(
      req.params["id"]!,
      (req as any).user._id,
      (req as any).user.role,
      req.body
    );

    res.locals["dataId"] = updatedReview?._id;

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        review: updatedReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review (soft delete)
 */
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedReview = await reviewService.deleteReview(req.params["id"]!);

    res.locals["dataId"] = deletedReview?._id;

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        review: deletedReview,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Hide/unhide a review
 */
export const hideReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { hide = false } = req.body;

    // Validate request body
    const { error } = reviewValidation.hideReview.validate({ hide });

    if (error) {
      throw new ApiError(
        error.details?.[0]?.message || "Validation failed",
        httpStatus.BAD_REQUEST
      );
    }

    const review = await reviewService.hideReview(
      req.params["id"]!,
      (req as any).user._id,
      (req as any).user.role,
      hide
    );

    res.status(httpStatus.OK).json({
      status: "success",
      data: {
        review,
      },
    });
  } catch (error) {
    next(error);
  }
};
