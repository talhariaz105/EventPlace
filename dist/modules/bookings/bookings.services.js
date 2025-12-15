"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingBookings = exports.getBookingStats = exports.checkAvailability = exports.extensionAction = exports.extendBooking = exports.refundAmount = exports.cancelBooking = exports.updateBookingRequestStatus = exports.createBooking = exports.deleteBooking = exports.updateBooking = exports.getAllBookingsForCustomer = exports.getAllBookingsForVendor = exports.getAllBookings = exports.getBookingById = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const bookings_modal_1 = require("./bookings.modal");
const errors_1 = require("../errors");
const stripe_1 = require("../stripe");
/**
 * Filter builder for booking queries
 */
const buildFilterQuery = (params) => {
    const { status, startDate, endDate, cancelRequest } = params;
    const query = [];
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        query.push({
            $match: {
                $and: [{ checkIn: { $gte: start } }, { checkOut: { $lte: end } }],
            },
        });
    }
    else {
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
const getBookingById = async (bookingId) => {
    const booking = await bookings_modal_1.Booking.findOne({ _id: bookingId, isDeleted: false })
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
        throw new errors_1.ApiError("Booking not found", http_status_1.default.NOT_FOUND);
    }
    return booking;
};
exports.getBookingById = getBookingById;
/**
 * Get all bookings with filtering
 */
const getAllBookings = async (queryParams) => {
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
    const query = [
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
                "service.serviceTypeId": new mongoose_1.default.Types.ObjectId(queryParams.serviceTypeId),
            },
        });
    }
    const [total, bookings] = await Promise.all([
        bookings_modal_1.Booking.aggregate([...query, { $count: "total" }]),
        bookings_modal_1.Booking.aggregate([
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
exports.getAllBookings = getAllBookings;
/**
 * Get bookings for vendor
 */
const getAllBookingsForVendor = async (vendorId, queryParams) => {
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
    const query = [
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
                "service.vendorId": new mongoose_1.default.Types.ObjectId(vendorId),
                ...searchQuery,
            },
        },
    ];
    if (queryParams.serviceTypeId) {
        query.push({
            $match: {
                "service.serviceTypeId": new mongoose_1.default.Types.ObjectId(queryParams.serviceTypeId),
            },
        });
    }
    const [total, bookings] = await Promise.all([
        bookings_modal_1.Booking.aggregate([...query, { $count: "total" }]),
        bookings_modal_1.Booking.aggregate([
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
exports.getAllBookingsForVendor = getAllBookingsForVendor;
/**
 * Get bookings for customer
 */
const getAllBookingsForCustomer = async (customerId, queryParams) => {
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
    const query = [
        { $match: { user: new mongoose_1.default.Types.ObjectId(customerId), isDeleted } },
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
                "service.serviceTypeId": new mongoose_1.default.Types.ObjectId(queryParams.serviceTypeId),
            },
        });
    }
    const [total, bookings] = await Promise.all([
        bookings_modal_1.Booking.aggregate([...query, { $count: "total" }]),
        bookings_modal_1.Booking.aggregate([
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
exports.getAllBookingsForCustomer = getAllBookingsForCustomer;
/**
 * Update booking
 */
const updateBooking = async (bookingId, updates) => {
    const allowedUpdates = ["checkIn", "checkOut", "guests", "status"];
    const filteredUpdates = {};
    for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
            filteredUpdates[key] = updates[key];
        }
    }
    const booking = await bookings_modal_1.Booking.findOneAndUpdate({ _id: bookingId, isDeleted: false }, filteredUpdates, { new: true, runValidators: true });
    if (!booking) {
        throw new errors_1.ApiError("Booking not found", http_status_1.default.NOT_FOUND);
    }
    return booking;
};
exports.updateBooking = updateBooking;
/**
 * Soft delete booking
 */
const deleteBooking = async (bookingId) => {
    const booking = await bookings_modal_1.Booking.findOneAndUpdate({ _id: bookingId }, { isDeleted: true }, { new: true });
    if (!booking) {
        throw new errors_1.ApiError("Booking not found", http_status_1.default.NOT_FOUND);
    }
    return booking;
};
exports.deleteBooking = deleteBooking;
/**
 * Create new booking with payment
 */
const createBooking = async (params) => {
    const { customerId, serviceId, checkIn, checkOut, guests, couponCode, paymentMethodId, } = params;
    // Check availability
    const isAvailable = await (0, exports.checkAvailability)({
        serviceId,
        checkIn,
        checkOut,
    });
    if (!isAvailable) {
        throw new errors_1.ApiError("Service is not available for the selected dates", http_status_1.default.BAD_REQUEST);
    }
    // Calculate total amount
    let totalAmount = params.totalAmount;
    let discountAmount = 0;
    let couponId;
    if (couponCode) {
        const coupon = await stripe_1.stripeCoupon.verifyCoupon({ couponCode });
        if (coupon && coupon.valid) {
            if (coupon.percent_off) {
                discountAmount = (totalAmount * coupon.percent_off) / 100;
            }
            else if (coupon.amount_off) {
                discountAmount = coupon.amount_off / 100; // Stripe amounts are in cents
            }
            totalAmount -= discountAmount;
            couponId = coupon.id;
        }
    }
    // Create payment intent
    const paymentIntent = await stripe_1.stripePayment.createPaymentIntent({
        amount: Math.round(totalAmount * 100),
        currency: "usd",
        customerId,
        paymentMethodId,
    });
    // Create booking
    const booking = await bookings_modal_1.Booking.create({
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
exports.createBooking = createBooking;
/**
 * Update booking request status (accept/reject)
 */
const updateBookingRequestStatus = async (params) => {
    const { bookingId, status } = params;
    const booking = await (0, exports.getBookingById)(bookingId);
    if (booking.status !== "pending") {
        throw new errors_1.ApiError("Can only update pending bookings", http_status_1.default.BAD_REQUEST);
    }
    if (status === "booked") {
        // Capture payment
        await stripe_1.stripePayment.capturePaymentIntent({
            paymentIntentId: booking.paymentIntentId,
        });
    }
    else if (status === "rejected") {
        // Cancel payment intent
        await stripe_1.stripePayment.cancelPaymentIntent({
            paymentIntentId: booking.paymentIntentId,
        });
    }
    booking.status = status;
    await booking.save();
    return booking;
};
exports.updateBookingRequestStatus = updateBookingRequestStatus;
/**
 * Cancel booking (by customer)
 */
const cancelBooking = async (params) => {
    const { bookingId, userId } = params;
    const booking = await (0, exports.getBookingById)(bookingId);
    // Verify ownership
    if (booking.user.toString() !== userId) {
        throw new errors_1.ApiError("Not authorized to cancel this booking", http_status_1.default.FORBIDDEN);
    }
    if (booking.status === "canceled") {
        throw new errors_1.ApiError("Booking is already cancelled", http_status_1.default.BAD_REQUEST);
    }
    if (booking.status === "completed") {
        throw new errors_1.ApiError("Cannot cancel completed booking", http_status_1.default.BAD_REQUEST);
    }
    booking.cancelRequest = true;
    booking.cancelRequestBy = new mongoose_1.default.Types.ObjectId(userId);
    booking.cancelRequestDate = new Date();
    await booking.save();
    return booking;
};
exports.cancelBooking = cancelBooking;
/**
 * Process refund
 */
const refundAmount = async (params) => {
    const { bookingId, refundType, customAmount } = params;
    const booking = await (0, exports.getBookingById)(bookingId);
    if (!booking.cancelRequest) {
        throw new errors_1.ApiError("No cancel request found for this booking", http_status_1.default.BAD_REQUEST);
    }
    if (booking.refunded) {
        throw new errors_1.ApiError("Booking is already refunded", http_status_1.default.BAD_REQUEST);
    }
    let refundAmount;
    if (refundType === "Full") {
        refundAmount = booking.totalAmount;
    }
    else if (refundType === "Partial" && customAmount) {
        if (customAmount > booking.totalAmount) {
            throw new errors_1.ApiError("Refund amount cannot exceed total amount", http_status_1.default.BAD_REQUEST);
        }
        refundAmount = customAmount;
    }
    else {
        throw new errors_1.ApiError("Invalid refund parameters", http_status_1.default.BAD_REQUEST);
    }
    // Process Stripe refund
    const refund = await stripe_1.stripePayment.refundPaymentIntent({
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
exports.refundAmount = refundAmount;
/**
 * Extend booking (request by customer)
 */
const extendBooking = async (params) => {
    const { bookingId, newCheckOut, userId } = params;
    const booking = await (0, exports.getBookingById)(bookingId);
    // Verify ownership
    if (booking.user.toString() !== userId) {
        throw new errors_1.ApiError("Not authorized to extend this booking", http_status_1.default.FORBIDDEN);
    }
    if (booking.status !== "booked") {
        throw new errors_1.ApiError("Can only extend confirmed bookings", http_status_1.default.BAD_REQUEST);
    }
    if (newCheckOut <= booking.checkOut) {
        throw new errors_1.ApiError("New checkout date must be after current checkout date", http_status_1.default.BAD_REQUEST);
    }
    // Check availability for extended period
    const isAvailable = await (0, exports.checkAvailability)({
        serviceId: booking.service.toString(),
        checkIn: booking.checkOut,
        checkOut: newCheckOut,
        excludeBookingId: bookingId,
    });
    if (!isAvailable) {
        throw new errors_1.ApiError("Service is not available for the extended dates", http_status_1.default.BAD_REQUEST);
    }
    // Calculate additional amount
    const originalDays = Math.ceil((booking.checkOut.getTime() - booking.checkIn.getTime()) /
        (1000 * 60 * 60 * 24));
    const newDays = Math.ceil((newCheckOut.getTime() - booking.checkIn.getTime()) / (1000 * 60 * 60 * 24));
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
exports.extendBooking = extendBooking;
/**
 * Handle extension action (accept/reject by vendor)
 */
const extensionAction = async (params) => {
    const { bookingId, action, paymentMethodId } = params;
    const booking = await (0, exports.getBookingById)(bookingId);
    if (!booking.extensionRequest || !booking.extensionDetails) {
        throw new errors_1.ApiError("No extension request found for this booking", http_status_1.default.BAD_REQUEST);
    }
    if (booking.extensionDetails.status !== "pending") {
        throw new errors_1.ApiError("Extension request has already been processed", http_status_1.default.BAD_REQUEST);
    }
    if (action === "accepted") {
        // Create payment intent for additional amount
        const paymentIntent = await stripe_1.stripePayment.createPaymentIntent({
            amount: Math.round(booking.extensionDetails.additionalAmount * 100),
            currency: "usd",
            customerId: booking.user.toString(),
            paymentMethodId: paymentMethodId,
        });
        // Capture payment immediately
        await stripe_1.stripePayment.capturePaymentIntent({
            paymentIntentId: paymentIntent.id,
        });
        booking.checkOut = booking.extensionDetails.requestedCheckOut;
        booking.totalAmount += booking.extensionDetails.additionalAmount;
        booking.extensionDetails.status = "accepted";
        booking.extensionDetails.paymentIntentId = paymentIntent.id;
    }
    else if (action === "rejected") {
        booking.extensionDetails.status = "rejected";
    }
    booking.extensionRequest = false;
    await booking.save();
    return booking;
};
exports.extensionAction = extensionAction;
/**
 * Check availability
 */
const checkAvailability = async (params) => {
    const { serviceId, checkIn, checkOut, excludeBookingId } = params;
    const query = {
        service: serviceId,
        isDeleted: false,
        status: { $in: ["pending", "confirmed"] },
        $or: [{ checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } }],
    };
    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }
    const conflictingBookings = await bookings_modal_1.Booking.find(query);
    return conflictingBookings.length === 0;
};
exports.checkAvailability = checkAvailability;
/**
 * Get booking statistics for vendor
 */
const getBookingStats = async (vendorId) => {
    const stats = await bookings_modal_1.Booking.aggregate([
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
                "service.vendorId": new mongoose_1.default.Types.ObjectId(vendorId),
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
exports.getBookingStats = getBookingStats;
/**
 * Get upcoming bookings
 */
const getUpcomingBookings = async (userId, userRole) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let query = [
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
                user: new mongoose_1.default.Types.ObjectId(userId),
            },
        });
    }
    else if (userRole === "vendor") {
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
                    "service.vendorId": new mongoose_1.default.Types.ObjectId(userId),
                    checkIn: { $gte: today },
                    status: "booked",
                    isDeleted: false,
                },
            },
        ];
    }
    query.push({
        $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
        },
    }, { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }, {
        $lookup: {
            from: "servicelistings",
            localField: "service",
            foreignField: "_id",
            as: "service",
        },
    }, { $unwind: { path: "$service", preserveNullAndEmptyArrays: true } }, { $sort: { checkIn: 1 } }, { $limit: 10 });
    const bookings = await bookings_modal_1.Booking.aggregate(query);
    return bookings;
};
exports.getUpcomingBookings = getUpcomingBookings;
