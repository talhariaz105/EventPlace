import Joi from "joi";

const createBooking = Joi.object({
  service: Joi.string().required().messages({
    "string.empty": "Service ID is required",
    "any.required": "Service ID is required",
  }),
  checkIn: Joi.date().required().messages({
    "date.base": "Valid check-in date is required",
    "any.required": "Check-in date is required",
  }),
  checkOut: Joi.date().greater(Joi.ref("checkIn")).required().messages({
    "date.base": "Valid check-out date is required",
    "date.greater": "Check-out date must be after check-in date",
    "any.required": "Check-out date is required",
  }),
  guests: Joi.number().integer().min(1).required().messages({
    "number.base": "Guests must be a number",
    "number.min": "At least one guest is required",
    "any.required": "Number of guests is required",
  }),
  paymentMethodid: Joi.string().required().messages({
    "string.empty": "Payment method is required",
    "any.required": "Payment method is required",
  }),
  message: Joi.string().optional().allow(""),
  couponCode: Joi.string().optional().allow(""),
  addOnServices: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        price: Joi.number().required(),
      })
    )
    .optional(),
  timezone: Joi.string().optional(),
});

const updateBookingStatus = Joi.object({
  status: Joi.string().valid("booked", "rejected").required().messages({
    "any.only": "Status must be either booked or rejected",
    "any.required": "Status is required",
  }),
});

const cancelBooking = Joi.object({
  cancelReason: Joi.string().optional().allow(""),
});

const refundBooking = Joi.object({
  amount: Joi.number().min(0).optional(),
  refundType: Joi.string().valid("Full", "Partial").optional(),
  cancelReason: Joi.string().optional().allow(""),
});

const extendBooking = Joi.object({
  startDate: Joi.date().required().messages({
    "date.base": "Valid start date is required",
    "any.required": "Start date is required",
  }),
  endDate: Joi.date().greater(Joi.ref("startDate")).required().messages({
    "date.base": "Valid end date is required",
    "date.greater": "End date must be after start date",
    "any.required": "End date is required",
  }),
  addOnServices: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().optional(),
        price: Joi.number().required(),
      })
    )
    .optional(),
  timezone: Joi.string().optional(),
});

const extensionAction = Joi.object({
  action: Joi.string().valid("accept", "reject").required().messages({
    "any.only": "Action must be either accept or reject",
    "any.required": "Action is required",
  }),
});

const checkAvailability = Joi.object({
  checkIn: Joi.date().required().messages({
    "date.base": "Valid check-in date is required",
    "any.required": "Check-in date is required",
  }),
  checkOut: Joi.date().greater(Joi.ref("checkIn")).required().messages({
    "date.base": "Valid check-out date is required",
    "date.greater": "Check-out date must be after check-in date",
    "any.required": "Check-out date is required",
  }),
  timezone: Joi.string().optional(),
});

const updateBooking = Joi.object({
  checkIn: Joi.date().optional(),
  checkOut: Joi.date().greater(Joi.ref("checkIn")).optional(),
  guests: Joi.number().min(1).optional(),
  status: Joi.string()
    .valid("pending", "booked", "canceled", "completed", "rejected")
    .optional(),
});

export const bookingValidation = {
  createBooking,
  updateBooking,
  updateBookingStatus,
  cancelBooking,
  refundBooking,
  extendBooking,
  extensionAction,
  checkAvailability,
};
