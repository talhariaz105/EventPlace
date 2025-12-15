import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import * as bookingService from "./bookings.services";
import { bookingValidation } from "./bookings.validations";
import { ApiError } from "../errors";

/**
 * Get booking by ID
 */
export const getBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    const booking = await bookingService.getBookingById(id);
    res.status(httpStatus.OK).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all bookings (Admin)
 */
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await bookingService.getAllBookings(req.query);
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings for vendor
 */
export const getVendorBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.user?.id;

    if (!vendorId) {
      throw new ApiError("Vendor not authenticated", httpStatus.UNAUTHORIZED);
    }

    const result = await bookingService.getAllBookingsForVendor(
      vendorId,
      req.query
    );
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings for customer
 */
export const getCustomerBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      throw new ApiError("Customer not authenticated", httpStatus.UNAUTHORIZED);
    }

    const result = await bookingService.getAllBookingsForCustomer(
      customerId,
      req.query
    );
    res.status(httpStatus.OK).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Create new booking
 */
export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const customerId = req.user?.id;

    if (!customerId) {
      throw new ApiError("Customer not authenticated", httpStatus.UNAUTHORIZED);
    }

    const { error, value } = bookingValidation.createBooking.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    const booking = await bookingService.createBooking({
      ...value,
      customerId,
      checkIn: new Date(value.checkIn),
      checkOut: new Date(value.checkOut),
    });

    res.locals["dataId"] = booking._id;
    res.status(httpStatus.CREATED).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status (vendor accepts/rejects)
 */
export const updateBookingStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    const { error, value } = bookingValidation.updateBookingStatus.validate(
      req.body
    );
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    // Verify vendor owns the service
    const booking = await bookingService.getBookingById(id);
    const service: any = booking.service;
    if (service.vendorId?.toString() !== vendorId) {
      throw new ApiError(
        "Not authorized to update this booking",
        httpStatus.FORBIDDEN
      );
    }

    const updatedBooking = await bookingService.updateBookingRequestStatus({
      bookingId: id,
      status: value.status,
    });

    res.locals["dataId"] = updatedBooking._id;
    res.status(httpStatus.OK).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel booking (customer)
 */
export const cancelBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    if (!userId) {
      throw new ApiError("User not authenticated", httpStatus.UNAUTHORIZED);
    }

    const booking = await bookingService.cancelBooking({
      bookingId: id,
      userId,
    });

    res.locals["dataId"] = booking._id;
    res.status(httpStatus.OK).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Process refund
 */
export const refundBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    const { error, value } = bookingValidation.refundBooking.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    // Verify vendor owns the service
    const booking = await bookingService.getBookingById(id);
    const service: any = booking.service;
    if (service.vendorId?.toString() !== vendorId) {
      throw new ApiError(
        "Not authorized to refund this booking",
        httpStatus.FORBIDDEN
      );
    }

    const refundedBooking = await bookingService.refundAmount({
      bookingId: id,
      refundType: value.refundType,
      customAmount: value.customAmount,
    });

    res.locals["dataId"] = refundedBooking._id;
    res.status(httpStatus.OK).json(refundedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Request booking extension (customer)
 */
export const requestExtension = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    if (!userId) {
      throw new ApiError("User not authenticated", httpStatus.UNAUTHORIZED);
    }

    const { error, value } = bookingValidation.extendBooking.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    const booking = await bookingService.extendBooking({
      bookingId: id,
      newCheckOut: new Date(value.newCheckOut),
      userId,
    });

    res.locals["dataId"] = booking._id;
    res.status(httpStatus.OK).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Accept/reject extension (vendor)
 */
export const handleExtension = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const vendorId = req.user?.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    const { error, value } = bookingValidation.extensionAction.validate(
      req.body
    );
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    // Verify vendor owns the service
    const booking = await bookingService.getBookingById(id);
    const service: any = booking.service;
    if (service.vendorId?.toString() !== vendorId) {
      throw new ApiError(
        "Not authorized to handle this extension",
        httpStatus.FORBIDDEN
      );
    }

    const updatedBooking = await bookingService.extensionAction({
      bookingId: id,
      action: value.action,
      paymentMethodId: value.paymentMethodId,
    });

    res.locals["dataId"] = updatedBooking._id;
    res.status(httpStatus.OK).json(updatedBooking);
  } catch (error) {
    next(error);
  }
};

/**
 * Check availability
 */
export const checkAvailability = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error, value } = bookingValidation.checkAvailability.validate(
      req.body
    );
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    const isAvailable = await bookingService.checkAvailability({
      serviceId: value.serviceId,
      checkIn: new Date(value.checkIn),
      checkOut: new Date(value.checkOut),
    });

    res.status(httpStatus.OK).json({ available: isAvailable });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking
 */
export const updateBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    const { error, value } = bookingValidation.updateBooking.validate(req.body);
    if (error) {
      throw new ApiError(error.details[0]!.message, httpStatus.BAD_REQUEST);
    }

    const booking = await bookingService.updateBooking(id, value);

    res.locals["dataId"] = booking._id;
    res.status(httpStatus.OK).json(booking);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete booking (soft delete)
 */
export const deleteBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError("Invalid booking ID", httpStatus.BAD_REQUEST);
    }

    const booking = await bookingService.deleteBooking(id);

    res.locals["dataId"] = booking._id;
    res.status(httpStatus.OK).json({ message: "Booking deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking statistics for vendor
 */
export const getBookingStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const vendorId = req.user?.id;

    if (!vendorId) {
      throw new ApiError("Vendor not authenticated", httpStatus.UNAUTHORIZED);
    }

    const stats = await bookingService.getBookingStats(vendorId);
    res.status(httpStatus.OK).json(stats);
  } catch (error) {
    next(error);
  }
};

/**
 * Get upcoming bookings
 */
export const getUpcomingBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || !userRole) {
      throw new ApiError("User not authenticated", httpStatus.UNAUTHORIZED);
    }

    const bookings = await bookingService.getUpcomingBookings(userId, userRole);
    res.status(httpStatus.OK).json(bookings);
  } catch (error) {
    next(error);
  }
};
