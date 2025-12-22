import express from "express";
import { bookingController } from "../../modules/bookings";
import { auth } from "../../modules/auth";

const router = express.Router();

// Public routes
router.post("/check-availability", bookingController.checkAvailability);

// Customer routes
router.post("/", auth("createBooking"), bookingController.createBooking);
router.get(
  "/my-bookings",
  auth("getCustomerBookings"),
  bookingController.getCustomerBookings
);
router.patch("/:id/cancel", auth("cancelBooking"), bookingController.cancelBooking);
router.post(
  "/:id/extend",
  auth("requestExtension"),
  bookingController.requestExtension
);
router.get(
  "/upcoming",
  auth("getUpcomingBookings"),
  bookingController.getUpcomingBookings
);

// Vendor routes
router.get(
  "/vendor/bookings",
  auth("getVendorBookings"),
  bookingController.getVendorBookings
);
router.patch(
  "/:id/status",
  auth("updateBookingStatus"),
  bookingController.updateBookingStatus
);
router.post("/:id/refund", auth("refundBooking"), bookingController.refundBooking);
router.post(
  "/:id/extension",
  auth("handleExtension"),
  bookingController.handleExtension
);
router.get("/vendor/stats", auth("getBookingStats"), bookingController.getBookingStats);

// Admin routes
router.get("/", auth("admin"), bookingController.getAllBookings);
router.get(
  "/:id",
  auth("getBooking"),
  bookingController.getBooking
);
router.patch("/:id", auth("updateBooking"), bookingController.updateBooking);
router.delete("/:id", auth("deleteBooking"), bookingController.deleteBooking);

export default router;
