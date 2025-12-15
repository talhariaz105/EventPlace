"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUpcomingBookings = exports.getBookingStats = exports.deleteBooking = exports.updateBooking = exports.checkAvailability = exports.handleExtension = exports.requestExtension = exports.refundBooking = exports.cancelBooking = exports.updateBookingStatus = exports.createBooking = exports.getCustomerBookings = exports.getVendorBookings = exports.getAllBookings = exports.getBooking = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const bookingService = __importStar(require("./bookings.services"));
const bookings_validations_1 = require("./bookings.validations");
const errors_1 = require("../errors");
/**
 * Get booking by ID
 */
const getBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        const booking = await bookingService.getBookingById(id);
        res.status(http_status_1.default.OK).json(booking);
    }
    catch (error) {
        next(error);
    }
};
exports.getBooking = getBooking;
/**
 * Get all bookings (Admin)
 */
const getAllBookings = async (req, res, next) => {
    try {
        const result = await bookingService.getAllBookings(req.query);
        res.status(http_status_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getAllBookings = getAllBookings;
/**
 * Get bookings for vendor
 */
const getVendorBookings = async (req, res, next) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            throw new errors_1.ApiError("Vendor not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const result = await bookingService.getAllBookingsForVendor(vendorId, req.query);
        res.status(http_status_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getVendorBookings = getVendorBookings;
/**
 * Get bookings for customer
 */
const getCustomerBookings = async (req, res, next) => {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            throw new errors_1.ApiError("Customer not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const result = await bookingService.getAllBookingsForCustomer(customerId, req.query);
        res.status(http_status_1.default.OK).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerBookings = getCustomerBookings;
/**
 * Create new booking
 */
const createBooking = async (req, res, next) => {
    try {
        const customerId = req.user?.id;
        if (!customerId) {
            throw new errors_1.ApiError("Customer not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const { error, value } = bookings_validations_1.bookingValidation.createBooking.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        const booking = await bookingService.createBooking({
            ...value,
            customerId,
            checkIn: new Date(value.checkIn),
            checkOut: new Date(value.checkOut),
        });
        res.locals["dataId"] = booking._id;
        res.status(http_status_1.default.CREATED).json(booking);
    }
    catch (error) {
        next(error);
    }
};
exports.createBooking = createBooking;
/**
 * Update booking status (vendor accepts/rejects)
 */
const updateBookingStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorId = req.user?.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        const { error, value } = bookings_validations_1.bookingValidation.updateBookingStatus.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        // Verify vendor owns the service
        const booking = await bookingService.getBookingById(id);
        const service = booking.service;
        if (service.vendorId?.toString() !== vendorId) {
            throw new errors_1.ApiError("Not authorized to update this booking", http_status_1.default.FORBIDDEN);
        }
        const updatedBooking = await bookingService.updateBookingRequestStatus({
            bookingId: id,
            status: value.status,
        });
        res.locals["dataId"] = updatedBooking._id;
        res.status(http_status_1.default.OK).json(updatedBooking);
    }
    catch (error) {
        next(error);
    }
};
exports.updateBookingStatus = updateBookingStatus;
/**
 * Cancel booking (customer)
 */
const cancelBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        if (!userId) {
            throw new errors_1.ApiError("User not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const booking = await bookingService.cancelBooking({
            bookingId: id,
            userId,
        });
        res.locals["dataId"] = booking._id;
        res.status(http_status_1.default.OK).json(booking);
    }
    catch (error) {
        next(error);
    }
};
exports.cancelBooking = cancelBooking;
/**
 * Process refund
 */
const refundBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorId = req.user?.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        const { error, value } = bookings_validations_1.bookingValidation.refundBooking.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        // Verify vendor owns the service
        const booking = await bookingService.getBookingById(id);
        const service = booking.service;
        if (service.vendorId?.toString() !== vendorId) {
            throw new errors_1.ApiError("Not authorized to refund this booking", http_status_1.default.FORBIDDEN);
        }
        const refundedBooking = await bookingService.refundAmount({
            bookingId: id,
            refundType: value.refundType,
            customAmount: value.customAmount,
        });
        res.locals["dataId"] = refundedBooking._id;
        res.status(http_status_1.default.OK).json(refundedBooking);
    }
    catch (error) {
        next(error);
    }
};
exports.refundBooking = refundBooking;
/**
 * Request booking extension (customer)
 */
const requestExtension = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        if (!userId) {
            throw new errors_1.ApiError("User not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const { error, value } = bookings_validations_1.bookingValidation.extendBooking.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        const booking = await bookingService.extendBooking({
            bookingId: id,
            newCheckOut: new Date(value.newCheckOut),
            userId,
        });
        res.locals["dataId"] = booking._id;
        res.status(http_status_1.default.OK).json(booking);
    }
    catch (error) {
        next(error);
    }
};
exports.requestExtension = requestExtension;
/**
 * Accept/reject extension (vendor)
 */
const handleExtension = async (req, res, next) => {
    try {
        const { id } = req.params;
        const vendorId = req.user?.id;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        const { error, value } = bookings_validations_1.bookingValidation.extensionAction.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        // Verify vendor owns the service
        const booking = await bookingService.getBookingById(id);
        const service = booking.service;
        if (service.vendorId?.toString() !== vendorId) {
            throw new errors_1.ApiError("Not authorized to handle this extension", http_status_1.default.FORBIDDEN);
        }
        const updatedBooking = await bookingService.extensionAction({
            bookingId: id,
            action: value.action,
            paymentMethodId: value.paymentMethodId,
        });
        res.locals["dataId"] = updatedBooking._id;
        res.status(http_status_1.default.OK).json(updatedBooking);
    }
    catch (error) {
        next(error);
    }
};
exports.handleExtension = handleExtension;
/**
 * Check availability
 */
const checkAvailability = async (req, res, next) => {
    try {
        const { error, value } = bookings_validations_1.bookingValidation.checkAvailability.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        const isAvailable = await bookingService.checkAvailability({
            serviceId: value.serviceId,
            checkIn: new Date(value.checkIn),
            checkOut: new Date(value.checkOut),
        });
        res.status(http_status_1.default.OK).json({ available: isAvailable });
    }
    catch (error) {
        next(error);
    }
};
exports.checkAvailability = checkAvailability;
/**
 * Update booking
 */
const updateBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        const { error, value } = bookings_validations_1.bookingValidation.updateBooking.validate(req.body);
        if (error) {
            throw new errors_1.ApiError(error.details[0].message, http_status_1.default.BAD_REQUEST);
        }
        const booking = await bookingService.updateBooking(id, value);
        res.locals["dataId"] = booking._id;
        res.status(http_status_1.default.OK).json(booking);
    }
    catch (error) {
        next(error);
    }
};
exports.updateBooking = updateBooking;
/**
 * Delete booking (soft delete)
 */
const deleteBooking = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            throw new errors_1.ApiError("Invalid booking ID", http_status_1.default.BAD_REQUEST);
        }
        const booking = await bookingService.deleteBooking(id);
        res.locals["dataId"] = booking._id;
        res.status(http_status_1.default.OK).json({ message: "Booking deleted successfully" });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBooking = deleteBooking;
/**
 * Get booking statistics for vendor
 */
const getBookingStats = async (req, res, next) => {
    try {
        const vendorId = req.user?.id;
        if (!vendorId) {
            throw new errors_1.ApiError("Vendor not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const stats = await bookingService.getBookingStats(vendorId);
        res.status(http_status_1.default.OK).json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getBookingStats = getBookingStats;
/**
 * Get upcoming bookings
 */
const getUpcomingBookings = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const userRole = req.user?.role;
        if (!userId || !userRole) {
            throw new errors_1.ApiError("User not authenticated", http_status_1.default.UNAUTHORIZED);
        }
        const bookings = await bookingService.getUpcomingBookings(userId, userRole);
        res.status(http_status_1.default.OK).json(bookings);
    }
    catch (error) {
        next(error);
    }
};
exports.getUpcomingBookings = getUpcomingBookings;
