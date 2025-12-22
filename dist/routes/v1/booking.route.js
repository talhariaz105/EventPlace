"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bookings_1 = require("../../modules/bookings");
const auth_1 = require("../../modules/auth");
const router = express_1.default.Router();
// Public routes
router.post("/check-availability", bookings_1.bookingController.checkAvailability);
// Customer routes
router.post("/", (0, auth_1.auth)("createBooking"), bookings_1.bookingController.createBooking);
router.get("/my-bookings", (0, auth_1.auth)("getCustomerBookings"), bookings_1.bookingController.getCustomerBookings);
router.patch("/:id/cancel", (0, auth_1.auth)("cancelBooking"), bookings_1.bookingController.cancelBooking);
router.post("/:id/extend", (0, auth_1.auth)("requestExtension"), bookings_1.bookingController.requestExtension);
router.get("/upcoming", (0, auth_1.auth)("getUpcomingBookings"), bookings_1.bookingController.getUpcomingBookings);
// Vendor routes
router.get("/vendor/bookings", (0, auth_1.auth)("getVendorBookings"), bookings_1.bookingController.getVendorBookings);
router.patch("/:id/status", (0, auth_1.auth)("updateBookingStatus"), bookings_1.bookingController.updateBookingStatus);
router.post("/:id/refund", (0, auth_1.auth)("refundBooking"), bookings_1.bookingController.refundBooking);
router.post("/:id/extension", (0, auth_1.auth)("handleExtension"), bookings_1.bookingController.handleExtension);
router.get("/vendor/stats", (0, auth_1.auth)("getBookingStats"), bookings_1.bookingController.getBookingStats);
// Admin routes
router.get("/", (0, auth_1.auth)("admin"), bookings_1.bookingController.getAllBookings);
router.get("/:id", (0, auth_1.auth)("getBooking"), bookings_1.bookingController.getBooking);
router.patch("/:id", (0, auth_1.auth)("updateBooking"), bookings_1.bookingController.updateBooking);
router.delete("/:id", (0, auth_1.auth)("deleteBooking"), bookings_1.bookingController.deleteBooking);
exports.default = router;
