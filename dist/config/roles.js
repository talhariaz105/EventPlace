"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleRights = exports.roles = void 0;
const allRoles = {
    admin: [
        "getUsers",
        "manageUsers",
        "EventType",
        "serviceCategory",
        "subCategory",
        "Amenities",
        "Listings",
        // Booking management
        "getBooking",
        "getAllBookings",
        "updateBooking",
        "deleteBooking",
        // Review management
        "manageReviews",
    ],
    vendor: ["getUsers", "Listings"
        // Booking management
        ,
        "getVendorBookings",
        "updateBookingStatus",
        "refundBooking",
        "handleExtension",
        "getBookingStats"
    ],
    customer: ["getUsers",
        // Booking management
        "createBooking",
        "getCustomerBookings",
        "cancelBooking",
        "requestExtension",
        "getUpcomingBookings"
    ],
};
exports.roles = Object.keys(allRoles);
// Normalize allRoles so that each role maps to a string[]
const normalizedRoleRights = [];
for (const [role, rights] of Object.entries(allRoles)) {
    if (Array.isArray(rights)) {
        normalizedRoleRights.push([role, rights]);
    }
}
exports.roleRights = new Map(normalizedRoleRights);
