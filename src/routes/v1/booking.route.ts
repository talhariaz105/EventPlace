import express from "express";
import { bookingController } from "../../modules/bookings";
import { auth } from "../../modules/auth";

const router = express.Router();

// Public routes
router.post("/check-availability", bookingController.checkAvailability);

// Customer routes
router.post("/", auth("customer"), bookingController.createBooking);
router.get(
  "/my-bookings",
  auth("customer"),
  bookingController.getCustomerBookings
);
router.patch("/:id/cancel", auth("customer"), bookingController.cancelBooking);
router.post(
  "/:id/extend",
  auth("customer"),
  bookingController.requestExtension
);
router.get(
  "/upcoming",
  auth("customer", "vendor"),
  bookingController.getUpcomingBookings
);

// Vendor routes
router.get(
  "/vendor/bookings",
  auth("vendor"),
  bookingController.getVendorBookings
);
router.patch(
  "/:id/status",
  auth("vendor"),
  bookingController.updateBookingStatus
);
router.post("/:id/refund", auth("vendor"), bookingController.refundBooking);
router.post(
  "/:id/extension",
  auth("vendor"),
  bookingController.handleExtension
);
router.get("/vendor/stats", auth("vendor"), bookingController.getBookingStats);

// Admin routes
router.get("/", auth("admin"), bookingController.getAllBookings);
router.get(
  "/:id",
  auth("admin", "vendor", "customer"),
  bookingController.getBooking
);
router.patch("/:id", auth("admin"), bookingController.updateBooking);
router.delete("/:id", auth("admin"), bookingController.deleteBooking);

export default router;
