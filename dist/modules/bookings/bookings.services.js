"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingBookings = exports.getBookingStats = exports.checkAvailability = exports.extensionAction = exports.extendBooking = exports.refundAmount = exports.cancelBooking = exports.updateBookingRequestStatus = exports.createBooking = exports.deleteBooking = exports.updateBooking = exports.getAllBookingsForCustomer = exports.getAllBookingsForVendor = exports.getAllBookings = exports.getBookingById = exports.checkBufferTimeAvailability = exports.calculateBookingPrice = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const http_status_1 = __importDefault(require("http-status"));
const dayjs_1 = __importDefault(require("dayjs"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const timezone_1 = __importDefault(require("dayjs/plugin/timezone"));
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
const isSameOrBefore_1 = __importDefault(require("dayjs/plugin/isSameOrBefore"));
const bookings_modal_1 = require("./bookings.modal");
const errors_1 = require("../errors");
const stripe_1 = require("../stripe");
const listings_1 = require("../listings");
dayjs_1.default.extend(utc_1.default);
dayjs_1.default.extend(timezone_1.default);
dayjs_1.default.extend(duration_1.default);
dayjs_1.default.extend(isSameOrBefore_1.default);
/**
 * Calculate booking price based on pricing model (hourly/daily) and service days
 */
const calculateBookingPrice = (pricingModel, checkInTime, checkOutTime, serviceDays, packages = [], serviceTimezone = "UTC") => {
    if (!pricingModel ||
        !checkInTime ||
        !checkOutTime ||
        !Array.isArray(serviceDays) ||
        serviceDays.length === 0) {
        return 0;
    }
    console.log("TimeZone", serviceTimezone);
    const start = dayjs_1.default.utc(checkInTime).tz(serviceTimezone);
    const end = dayjs_1.default.utc(checkOutTime).tz(serviceTimezone);
    if (!end.isAfter(start))
        return 0;
    let totalPrice = 0;
    let current = start.startOf("day");
    const endDay = end.endOf("day");
    // Calculate service days price
    while (current.isSameOrBefore(endDay)) {
        const dayName = current.format("dddd").toLowerCase();
        const dayInfo = serviceDays.find((sd) => sd.day === dayName);
        if (dayInfo && dayInfo.price) {
            const dayPrice = Number(dayInfo.price) || 0;
            const dayDateStr = current.format("YYYY-MM-DD");
            let serviceStart = dayjs_1.default.tz(`${dayDateStr} ${dayInfo.startTime}`, serviceTimezone);
            let serviceEnd = dayjs_1.default.tz(`${dayDateStr} ${dayInfo.endTime}`, serviceTimezone);
            if (serviceEnd.isBefore(serviceStart)) {
                serviceEnd = serviceEnd.add(1, "day"); // overnight
            }
            const checkInLocal = start;
            const checkOutLocal = end;
            if (pricingModel === "hourly") {
                if (checkOutLocal.isAfter(serviceStart) &&
                    checkInLocal.isBefore(serviceEnd)) {
                    const actualStart = checkInLocal.isAfter(serviceStart)
                        ? checkInLocal
                        : serviceStart;
                    const actualEnd = checkOutLocal.isBefore(serviceEnd)
                        ? checkOutLocal
                        : serviceEnd;
                    if (actualEnd.isAfter(actualStart)) {
                        const hours = dayjs_1.default.duration(actualEnd.diff(actualStart)).asHours();
                        totalPrice += hours * dayPrice;
                    }
                }
            }
            else if (pricingModel === "daily") {
                if (checkInLocal.isBefore(serviceEnd) &&
                    checkOutLocal.isAfter(serviceStart)) {
                    totalPrice += dayPrice;
                }
            }
        }
        current = current.add(1, "day");
    }
    // Calculate packages price based on their priceUnit and service days
    let packagesTotalPrice = 0;
    packages.forEach((pkg) => {
        const packagePrice = Number(pkg.price) || 0;
        if (pkg.priceUnit === "fixed") {
            // Fixed price - add once
            packagesTotalPrice += packagePrice;
        }
        else if (pkg.priceUnit === "hourly" || pkg.priceUnit === "daily") {
            // Calculate based on service days availability
            let packageCurrent = start.startOf("day");
            let packageHours = 0;
            let packageDays = 0;
            while (packageCurrent.isSameOrBefore(endDay)) {
                const dayName = packageCurrent.format("dddd").toLowerCase();
                const dayInfo = serviceDays.find((sd) => sd.day === dayName);
                if (dayInfo && dayInfo.price) {
                    const dayDateStr = packageCurrent.format("YYYY-MM-DD");
                    let serviceStart = dayjs_1.default.tz(`${dayDateStr} ${dayInfo.startTime}`, serviceTimezone);
                    let serviceEnd = dayjs_1.default.tz(`${dayDateStr} ${dayInfo.endTime}`, serviceTimezone);
                    if (serviceEnd.isBefore(serviceStart)) {
                        serviceEnd = serviceEnd.add(1, "day");
                    }
                    const checkInLocal = start;
                    const checkOutLocal = end;
                    // Check if booking overlaps with this service day
                    if (checkOutLocal.isAfter(serviceStart) &&
                        checkInLocal.isBefore(serviceEnd)) {
                        const actualStart = checkInLocal.isAfter(serviceStart)
                            ? checkInLocal
                            : serviceStart;
                        const actualEnd = checkOutLocal.isBefore(serviceEnd)
                            ? checkOutLocal
                            : serviceEnd;
                        if (actualEnd.isAfter(actualStart)) {
                            if (pkg.priceUnit === "hourly") {
                                const hours = dayjs_1.default
                                    .duration(actualEnd.diff(actualStart))
                                    .asHours();
                                packageHours += hours;
                            }
                            else if (pkg.priceUnit === "daily") {
                                packageDays += 1;
                            }
                        }
                    }
                }
                packageCurrent = packageCurrent.add(1, "day");
            }
            if (pkg.priceUnit === "hourly") {
                packagesTotalPrice += packagePrice * packageHours;
            }
            else if (pkg.priceUnit === "daily") {
                packagesTotalPrice += packagePrice * packageDays;
            }
        }
    });
    return parseFloat((totalPrice + packagesTotalPrice).toFixed(2));
};
exports.calculateBookingPrice = calculateBookingPrice;
/**
 * Check buffer time availability for bookings
 */
const checkBufferTimeAvailability = async (checkInTime, checkOutTime, serviceId, bufferTime = 0, bufferTimeUnit = "minutes", durationUnit = "hours", minimumDuration = 0, timezone = "UTC", bookingId) => {
    try {
        // Convert buffer time to minutes for consistent calculation
        let bufferInMinutes = bufferTime;
        if (bufferTimeUnit === "hours") {
            bufferInMinutes = bufferTime * 60;
        }
        // Convert minimum duration to minutes based on unit
        let minDurationInMinutes = minimumDuration;
        if (durationUnit === "days") {
            minDurationInMinutes = minimumDuration * 24 * 60;
        }
        else if (durationUnit === "hours") {
            minDurationInMinutes = minimumDuration * 60;
        }
        const checkIn = new Date(checkInTime);
        const checkOut = new Date(checkOutTime);
        // Check if proposed booking duration meets minimum requirement
        const bookingDurationMinutes = (checkOut.getTime() - checkIn.getTime()) / (1000 * 60);
        if (minimumDuration > 0 && bookingDurationMinutes < minDurationInMinutes) {
            return {
                available: false,
                conflictingBooking: null,
                reason: `Booking duration must be at least ${minimumDuration} ${durationUnit}`,
            };
        }
        // Find only overlapping bookings for this service with the proposed dates
        const query = {
            service: serviceId,
            status: { $in: ["booked", "pending"] },
            isDeleted: false,
            checkIn: {
                $lt: new Date(checkOut.getTime() + bufferInMinutes * 60 * 1000),
            },
            checkOut: {
                $gt: new Date(checkIn.getTime() - bufferInMinutes * 60 * 1000),
            },
        };
        if (bookingId) {
            query._id = { $ne: bookingId }; // Exclude current booking if checking for extension
        }
        const conflictingBookings = await bookings_modal_1.Booking.findOne(query);
        console.log("conflictingBookings", conflictingBookings, "checkIn", new Date(checkIn.getTime() - bufferInMinutes * 60 * 1000));
        if (!conflictingBookings) {
            return { available: true, conflictingBooking: null, reason: null };
        }
        // Apply buffer time to check if new booking fits with existing booking
        const existingCheckOut = new Date(conflictingBookings.checkOut);
        const bufferEndTime = new Date(existingCheckOut.getTime() + bufferInMinutes * 60 * 1000);
        const existingCheckIn = new Date(conflictingBookings.checkIn);
        const bufferStartTime = new Date(existingCheckIn.getTime() - bufferInMinutes * 60 * 1000);
        // Convert times to local timezone for user-friendly messages
        const bufferEndTimeLocal = (0, dayjs_1.default)(bufferEndTime)
            .tz(timezone)
            .format("YYYY-MM-DD HH:mm:ss");
        // Check if new booking overlaps with buffer zones
        if (checkOut > bufferStartTime && checkIn < bufferEndTime) {
            return {
                available: false,
                conflictingBooking: {
                    checkIn: conflictingBookings.checkIn,
                    checkOut: conflictingBookings.checkOut,
                    bufferStartTime,
                    bufferEndTime,
                },
                reason: `Service is not available. Previous booking ends at ${bufferEndTimeLocal} (${timezone}). Next available time after buffer: ${bufferEndTimeLocal} (${timezone})`,
            };
        }
        return { available: true, conflictingBooking: null, reason: null };
    }
    catch (error) {
        throw new Error(`Buffer time availability check failed: ${error.message}`);
    }
};
exports.checkBufferTimeAvailability = checkBufferTimeAvailability;
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
    const { customerId, serviceId, checkIn, checkOut, guests, message, type, packages, } = params;
    // Check availability
    const isAvailable = await (0, exports.checkAvailability)({
        serviceId,
        checkIn,
        checkOut,
    });
    if (!isAvailable) {
        throw new errors_1.ApiError("Service is not available for the selected dates", http_status_1.default.BAD_REQUEST);
    }
    const findService = await listings_1.ServiceListing.findById(serviceId);
    if (!findService) {
        throw new errors_1.ApiError("Service not found", http_status_1.default.NOT_FOUND);
    }
    const filterPakages = findService.packeges
        ?.filter((pkg) => packages?.includes(pkg._id.toString()))
        .map((pkg) => ({
        name: pkg.name.toString(),
        price: Number(pkg.price) || 0,
        priceUnit: pkg.priceUnit || "fixed",
    })) || [];
    const calculatedPrice = (0, exports.calculateBookingPrice)("daily", // Assuming daily pricing model; adjust as needed
    checkIn, checkOut, findService.serviceDays, filterPakages, findService.timeZone);
    // Calculate total amount
    let totalAmount = calculatedPrice;
    // let discountAmount = 0;
    // let couponId;
    // // Create payment intent
    // const paymentIntent = await stripePayment.createPaymentIntent({
    //   amount: Math.round(totalAmount * 100), // Convert to cents
    //   currency: "usd",
    //   customerId,
    //   paymentMethodId,
    // });
    // Create booking
    const booking = await bookings_modal_1.Booking.create({
        user: customerId,
        service: serviceId,
        checkIn,
        checkOut,
        guests,
        totalAmount,
        status: "pending",
        message,
        packages: packages,
        type,
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
