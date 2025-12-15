# Booking Module Migration Guide

## Overview

This guide helps you migrate the booking module from JavaScript to TypeScript.

## Completed Files

### ✅ bookings.interfaces.ts

- All TypeScript interfaces defined
- Includes IBooking, IServicePrice, and parameter interfaces
- Fully typed for type safety

### ✅ bookings.validations.ts

- Joi validation schemas for all booking operations
- Includes: createBooking, updateBookingStatus, cancelBooking, refundBooking, extendBooking, extensionAction, checkAvailability

### ✅ bookings.modal.ts

- Mongoose schema with proper TypeScript typing
- Indexes configured for performance
- Soft delete support

## To Complete

### 🔄 bookings.services.ts

Extract business logic from controllers into service functions. Example pattern:

\`\`\`typescript
import { Booking } from './bookings.modal';
import { ICreateBookingParams } from './bookings.interfaces';

export const createBooking = async (params: ICreateBookingParams, userId: string) => {
// Business logic here
const booking = await Booking.create({
user: userId,
service: params.service,
// ... other fields
});
return booking;
};
\`\`\`

### 🔄 bookings.controller.ts

Convert controllers to TypeScript. Example pattern:

\`\`\`typescript
import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import \* as bookingService from './bookings.services';
import { bookingValidation } from './bookings.validations';
import { ApiError } from '../errors';

export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
try {
const { error } = bookingValidation.createBooking.validate(req.body);
if (error) {
const errorFields = error.details.map(d => ({
field: d.path.join('.'),
message: d.message
}));
throw new ApiError('Validation failed', httpStatus.BAD_REQUEST, { errorFields });
}

    const booking = await bookingService.createBooking(req.body, (req as any).user._id);

    res.status(httpStatus.CREATED).json({
      status: 'success',
      message: 'Booking created successfully',
      booking
    });

} catch (error) {
next(error);
}
};
\`\`\`

## Required Dependencies

Ensure these are imported in your services/controllers:

\`\`\`typescript
// Stripe utilities
import { stripePayment, stripeCustomer, stripeCoupon } from '../stripe';

// Models (need to be TypeScript-ified)
import { Booking } from './bookings.modal';
import Listing from '../listings/listings.modal';
import User from '../user/user.model';

// Other utilities
import { ApiError } from '../errors';
import httpStatus from 'http-status';
\`\`\`

## Migration Steps

1. **Create Service Functions** (bookings.services.ts)

   - Extract each controller's business logic
   - Add proper TypeScript types
   - Handle errors consistently

2. **Update Controllers** (bookings.controller.ts)

   - Import services
   - Add Request, Response, NextFunction types
   - Use validation schemas
   - Call service functions

3. **Test Each Function**
   - Start with simple operations (getBookingById)
   - Move to complex ones (createBooking, extendBooking)
   - Test error scenarios

## Key Functions to Implement

- ✅ createBooking
- ✅ updateBookingRequestStatus
- ✅ getAllBookings
- ✅ getAllBookingsForVendorService
- ✅ getAllBookingsForCustomer
- ✅ getBookingById
- ✅ getBookingsWithMessagesByUser
- ✅ updateBooking
- ✅ deleteBooking
- ✅ cancelBooking
- ✅ paymentByadmintoVendor
- ✅ getRefundDataOfBooking
- ✅ refundAmount
- ✅ extendBooking
- ✅ acceptorRejectExtension
- ✅ extensionsRequestForVendor
- ✅ extensionsRequestForCustomer
- ✅ getBookingExtensionHistory
- ✅ getExtensionBooking
- ✅ checkServiceAvailability

## TypeScript Benefits

1. **Type Safety**: Catch errors at compile time
2. **IntelliSense**: Better code completion
3. **Refactoring**: Easier code maintenance
4. **Documentation**: Types serve as inline documentation
5. **Error Reduction**: Fewer runtime errors

## Next Steps

1. Start with `bookings.services.ts` - implement one service function at a time
2. Update `bookings.controller.ts` - convert one controller at a time
3. Create routes file: `bookings.route.ts`
4. Add to `src/routes/v1/index.ts`
5. Test thoroughly

## Notes

- Use the Stripe utilities from `src/modules/stripe`
- Follow the pattern established in the review module
- Ensure all async operations have proper error handling
- Use `res.locals['dataId']` for audit logging
