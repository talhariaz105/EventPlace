import mongoose from "mongoose";
import httpStatus from "http-status";
import { Booking } from "./bookings.modal";
import {
  ICreateBookingParams,
  IUpdateBookingStatusParams,
  ICancelBookingParams,
  IRefundParams,
  IExtendBookingParams,
  IExtensionActionParams,
  IBookingQueryParams,
  ICheckAvailabilityParams,
} from "./bookings.interfaces";
import { ApiError } from "../errors";
import { stripePayment, stripeCoupon } from "../stripe";

/**
 * Filter builder for booking queries
 */
const buildFilterQuery = (params: IBookingQueryParams) => {
  const { status, startDate, endDate, cancelRequest } = params;
  const query: any[] = [];

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    query.push({
      $match: {
        $and: [{ checkIn: { $gte: start } }, { checkOut: { $lte: end } }],
      },
    });
  } else {
    if (startDate) {
      const start = new Date(startDate);
      query.push({
        $match: {
          checkIn: { $gte: start },
        },
      });
    }
    if (endDate) {
      const end = new Date(endDate);
      query.push({
        $match: {
          checkOut: { $lte: end },
        },
      });
    }
  }

  if (status) {
    query.push({ $match: { status } });
  }

  if (cancelRequest === "true" || cancelRequest === true) {
    query.push({ $match: { cancelRequest: true } });
  }

  return query;
};

/**
 * Get booking by ID
 */
export const getBookingById = async (bookingId: string) => {
  const booking = await Booking.findOne({ _id: bookingId, isDeleted: false })
    .populate("user")
    .populate({
      path: "service",
      populate: [
        { path: "serviceTypeId" },
        { path: "filters.filterId" },
        { path: "vendorId", select: "profilePicture email lastName firstName" },
        { path: "faqs" },
        { path: "eventTypes" },
      ],
    });

  if (!booking) {
    throw new ApiError("Booking not found", httpStatus.NOT_FOUND);
  }

  return booking;
};

/**
 * Get all bookings with filtering
 */
export const getAllBookings = async (queryParams: IBookingQueryParams) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const filterQuery = buildFilterQuery(queryParams);

  const searchQuery = queryParams.search
    ? {
        $or: [
          { "service.title": { $regex: queryParams.search, $options: "i" } },
          { "user.fullName": { $regex: queryParams.search, $options: "i" } },
        ],
      }
    : {};

  const query: any[] = [
    ...filterQuery,
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "servicelistings",
        localField: "service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $match: searchQuery,
    },
  ];

  if (queryParams.serviceTypeId) {
    query.push({
      $match: {
        "service.serviceTypeId": new mongoose.Types.ObjectId(
          queryParams.serviceTypeId
        ),
      },
    });
  }

  const [total, bookings] = await Promise.all([
    Booking.aggregate([...query, { $count: "total" }]),
    Booking.aggregate([
      ...query,
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ]),
  ]);

  return {
    total: total[0]?.total || 0,
    page,
    totalPages: Math.ceil((total[0]?.total || 0) / limit),
    bookings,
  };
};

/**
 * Get bookings for vendor
 */
export const getAllBookingsForVendor = async (
  vendorId: string,
  queryParams: IBookingQueryParams
) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const filterQuery = buildFilterQuery(queryParams);

  const searchQuery = queryParams.search
    ? {
        $or: [
          { "service.title": { $regex: queryParams.search, $options: "i" } },
          { "user.fullName": { $regex: queryParams.search, $options: "i" } },
        ],
      }
    : {};

  const query: any[] = [
    ...filterQuery,
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "servicelistings",
        localField: "service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $match: {
        "service.vendorId": new mongoose.Types.ObjectId(vendorId),
        ...searchQuery,
      },
    },
  ];

  if (queryParams.serviceTypeId) {
    query.push({
      $match: {
        "service.serviceTypeId": new mongoose.Types.ObjectId(
          queryParams.serviceTypeId
        ),
      },
    });
  }

  const [total, bookings] = await Promise.all([
    Booking.aggregate([...query, { $count: "total" }]),
    Booking.aggregate([
      ...query,
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ]),
  ]);

  return {
    total: total[0]?.total || 0,
    page,
    totalPages: Math.ceil((total[0]?.total || 0) / limit),
    bookings,
  };
};

/**
 * Get bookings for customer
 */
export const getAllBookingsForCustomer = async (
  customerId: string,
  queryParams: IBookingQueryParams
) => {
  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const isDeleted = queryParams.isDeleted === true;
  const filterQuery = buildFilterQuery(queryParams);

  const searchQuery = queryParams.search
    ? {
        $or: [
          { "service.title": { $regex: queryParams.search, $options: "i" } },
          {
            "service.description": {
              $regex: queryParams.search,
              $options: "i",
            },
          },
          { "vendor.fullName": { $regex: queryParams.search, $options: "i" } },
        ],
      }
    : {};

  const query: any[] = [
    { $match: { user: new mongoose.Types.ObjectId(customerId), isDeleted } },
    ...filterQuery,
    {
      $lookup: {
        from: "servicelistings",
        localField: "service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "users",
        localField: "service.vendorId",
        foreignField: "_id",
        as: "vendor",
      },
    },
    { $unwind: { path: "$vendor", preserveNullAndEmptyArrays: true } },
    {
      $match: searchQuery,
    },
  ];

  if (queryParams.serviceTypeId) {
    query.push({
      $match: {
        "service.serviceTypeId": new mongoose.Types.ObjectId(
          queryParams.serviceTypeId
        ),
      },
    });
  }

  const [total, bookings] = await Promise.all([
    Booking.aggregate([...query, { $count: "total" }]),
    Booking.aggregate([
      ...query,
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $sort: { createdAt: -1 } },
    ]),
  ]);

  return {
    total: total[0]?.total || 0,
    page,
    totalPages: Math.ceil((total[0]?.total || 0) / limit),
    bookings,
  };
};

/**
 * Update booking
 */
export const updateBooking = async (bookingId: string, updates: any) => {
  const allowedUpdates = ["checkIn", "checkOut", "guests", "status"];
  const filteredUpdates: any = {};

  for (const key of allowedUpdates) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, isDeleted: false },
    filteredUpdates,
    { new: true, runValidators: true }
  );

  if (!booking) {
    throw new ApiError("Booking not found", httpStatus.NOT_FOUND);
  }

  return booking;
};

/**
 * Soft delete booking
 */
export const deleteBooking = async (bookingId: string) => {
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId },
    { isDeleted: true },
    { new: true }
  );

  if (!booking) {
    throw new ApiError("Booking not found", httpStatus.NOT_FOUND);
  }

  return booking;
};

/**
 * Create new booking with payment
 */
export const createBooking = async (params: ICreateBookingParams) => {
  const {
    customerId,
    serviceId,
    checkIn,
    checkOut,
    guests,
    couponCode,
    paymentMethodId,
  } = params;

  // Check availability
  const isAvailable = await checkAvailability({
    serviceId,
    checkIn,
    checkOut,
  });

  if (!isAvailable) {
    throw new ApiError(
      "Service is not available for the selected dates",
      httpStatus.BAD_REQUEST
    );
  }

  // Calculate total amount
  let totalAmount = params.totalAmount;
  let discountAmount = 0;
  let couponId;

  if (couponCode) {
    const coupon = await stripeCoupon.verifyCoupon({ couponCode });
    if (coupon && coupon.valid) {
      if (coupon.percent_off) {
        discountAmount = (totalAmount * coupon.percent_off) / 100;
      } else if (coupon.amount_off) {
        discountAmount = coupon.amount_off / 100; // Stripe amounts are in cents
      }
      totalAmount -= discountAmount;
      couponId = coupon.id;
    }
  }

  // Create payment intent
  const paymentIntent = await stripePayment.createPaymentIntent({
    amount: Math.round(totalAmount * 100), // Convert to cents
    currency: "usd",
    customerId,
    paymentMethodId,
  });

  // Create booking
  const booking = await Booking.create({
    user: customerId,
    service: serviceId,
    checkIn,
    checkOut,
    guests,
    totalAmount,
    discountAmount,
    couponCode: couponId,
    paymentIntentId: paymentIntent.id,
    status: "pending",
  });

  return booking;
};

/**
 * Update booking request status (accept/reject)
 */
export const updateBookingRequestStatus = async (
  params: IUpdateBookingStatusParams
) => {
  const { bookingId, status } = params;

  const booking = await getBookingById(bookingId);

  if (booking.status !== "pending") {
    throw new ApiError(
      "Can only update pending bookings",
      httpStatus.BAD_REQUEST
    );
  }

  if (status === "booked") {
    // Capture payment
    await stripePayment.capturePaymentIntent({
      paymentIntentId: booking.paymentIntentId,
    });
  } else if (status === "rejected") {
    // Cancel payment intent
    await stripePayment.cancelPaymentIntent({
      paymentIntentId: booking.paymentIntentId,
    });
  }

  booking.status = status;
  await booking.save();

  return booking;
};

/**
 * Cancel booking (by customer)
 */
export const cancelBooking = async (params: ICancelBookingParams) => {
  const { bookingId, userId } = params;

  const booking = await getBookingById(bookingId);

  // Verify ownership
  if (booking.user.toString() !== userId) {
    throw new ApiError(
      "Not authorized to cancel this booking",
      httpStatus.FORBIDDEN
    );
  }

  if (booking.status === "canceled") {
    throw new ApiError("Booking is already cancelled", httpStatus.BAD_REQUEST);
  }

  if (booking.status === "completed") {
    throw new ApiError(
      "Cannot cancel completed booking",
      httpStatus.BAD_REQUEST
    );
  }

  booking.cancelRequest = true;
  booking.cancelRequestBy = new mongoose.Types.ObjectId(userId);
  booking.cancelRequestDate = new Date();
  await booking.save();

  return booking;
};

/**
 * Process refund
 */
export const refundAmount = async (params: IRefundParams) => {
  const { bookingId, refundType, customAmount } = params;

  const booking = await getBookingById(bookingId);

  if (!booking.cancelRequest) {
    throw new ApiError(
      "No cancel request found for this booking",
      httpStatus.BAD_REQUEST
    );
  }

  if (booking.refunded) {
    throw new ApiError("Booking is already refunded", httpStatus.BAD_REQUEST);
  }

  let refundAmount: number;

  if (refundType === "Full") {
    refundAmount = booking.totalAmount;
  } else if (refundType === "Partial" && customAmount) {
    if (customAmount > booking.totalAmount) {
      throw new ApiError(
        "Refund amount cannot exceed total amount",
        httpStatus.BAD_REQUEST
      );
    }
    refundAmount = customAmount;
  } else {
    throw new ApiError("Invalid refund parameters", httpStatus.BAD_REQUEST);
  }

  // Process Stripe refund
  const refund = await stripePayment.refundPaymentIntent({
    paymentIntentId: booking.paymentIntentId,
    amount: Math.round(refundAmount * 100), // Convert to cents
  });

  booking.refunded = true;
  booking.refundAmount = refundAmount;
  booking.refundType = refundType;
  booking.refundId = refund.id;
  booking.status = "canceled";
  await booking.save();

  return booking;
};

/**
 * Extend booking (request by customer)
 */
export const extendBooking = async (params: IExtendBookingParams) => {
  const { bookingId, newCheckOut, userId } = params;

  const booking = await getBookingById(bookingId);

  // Verify ownership
  if (booking.user.toString() !== userId) {
    throw new ApiError(
      "Not authorized to extend this booking",
      httpStatus.FORBIDDEN
    );
  }

  if (booking.status !== "booked") {
    throw new ApiError(
      "Can only extend confirmed bookings",
      httpStatus.BAD_REQUEST
    );
  }

  if (newCheckOut <= booking.checkOut) {
    throw new ApiError(
      "New checkout date must be after current checkout date",
      httpStatus.BAD_REQUEST
    );
  }

  // Check availability for extended period
  const isAvailable = await checkAvailability({
    serviceId: booking.service.toString(),
    checkIn: booking.checkOut,
    checkOut: newCheckOut,
    excludeBookingId: bookingId,
  });

  if (!isAvailable) {
    throw new ApiError(
      "Service is not available for the extended dates",
      httpStatus.BAD_REQUEST
    );
  }

  // Calculate additional amount
  const originalDays = Math.ceil(
    (booking.checkOut.getTime() - booking.checkIn.getTime()) /
      (1000 * 60 * 60 * 24)
  );
  const newDays = Math.ceil(
    (newCheckOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24)
  );
  const additionalDays = newDays - originalDays;
  const dailyRate = booking.totalAmount / originalDays;
  const additionalAmount = dailyRate * additionalDays;

  booking.extensionRequest = true;
  booking.extensionDetails = {
    requestedCheckOut: newCheckOut,
    additionalAmount,
    status: "pending",
  };
  await booking.save();

  return booking;
};

/**
 * Handle extension action (accept/reject by vendor)
 */
export const extensionAction = async (params: IExtensionActionParams) => {
  const { bookingId, action, paymentMethodId } = params;

  const booking = await getBookingById(bookingId);

  if (!booking.extensionRequest || !booking.extensionDetails) {
    throw new ApiError(
      "No extension request found for this booking",
      httpStatus.BAD_REQUEST
    );
  }

  if (booking.extensionDetails.status !== "pending") {
    throw new ApiError(
      "Extension request has already been processed",
      httpStatus.BAD_REQUEST
    );
  }

  if (action === "accepted") {
    // Create payment intent for additional amount
    const paymentIntent = await stripePayment.createPaymentIntent({
      amount: Math.round(booking.extensionDetails.additionalAmount * 100),
      currency: "usd",
      customerId: booking.user.toString(),
      paymentMethodId: paymentMethodId!,
    });

    // Capture payment immediately
    await stripePayment.capturePaymentIntent({
      paymentIntentId: paymentIntent.id,
    });

    booking.checkOut = booking.extensionDetails.requestedCheckOut;
    booking.totalAmount += booking.extensionDetails.additionalAmount;
    booking.extensionDetails.status = "accepted";
    booking.extensionDetails.paymentIntentId = paymentIntent.id;
  } else if (action === "rejected") {
    booking.extensionDetails.status = "rejected";
  }

  booking.extensionRequest = false;
  await booking.save();

  return booking;
};

/**
 * Check availability
 */
export const checkAvailability = async (
  params: ICheckAvailabilityParams
): Promise<boolean> => {
  const { serviceId, checkIn, checkOut, excludeBookingId } = params;

  const query: any = {
    service: serviceId,
    isDeleted: false,
    status: { $in: ["pending", "confirmed"] },
    $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
  };

  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }

  const conflictingBookings = await Booking.find(query);

  return conflictingBookings.length === 0;
};

/**
 * Get booking statistics for vendor
 */
export const getBookingStats = async (vendorId: string) => {
  const stats = await Booking.aggregate([
    {
      $lookup: {
        from: "servicelistings",
        localField: "service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: "$service" },
    {
      $match: {
        "service.vendorId": new mongoose.Types.ObjectId(vendorId),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        totalRevenue: { $sum: "$totalAmount" },
      },
    },
  ]);

  return stats;
};

/**
 * Get upcoming bookings
 */
export const getUpcomingBookings = async (userId: string, userRole: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let query: any[] = [
    {
      $match: {
        checkIn: { $gte: today },
        status: "booked",
        isDeleted: false,
      },
    },
  ];

  if (userRole === "customer") {
    query.unshift({
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    });
  } else if (userRole === "vendor") {
    query = [
      {
        $lookup: {
          from: "servicelistings",
          localField: "service",
          foreignField: "_id",
          as: "service",
        },
      },
      { $unwind: "$service" },
      {
        $match: {
          "service.vendorId": new mongoose.Types.ObjectId(userId),
          checkIn: { $gte: today },
          status: "booked",
          isDeleted: false,
        },
      },
    ];
  }

  query.push(
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "servicelistings",
        localField: "service",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } },
    { $sort: { checkIn: 1 } },
    { $limit: 10 }
  );

  const bookings = await Booking.aggregate(query);
  return bookings;
};
