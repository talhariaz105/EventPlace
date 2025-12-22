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
    , "getVendorBookings",
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

export const roles: string[] = Object.keys(allRoles);

// Normalize allRoles so that each role maps to a string[]
const normalizedRoleRights: [string, string[]][] = [];

for (const [role, rights] of Object.entries(allRoles)) {
  if (Array.isArray(rights)) {
    normalizedRoleRights.push([role, rights]);
  }
}

export const roleRights: Map<string, string[]> = new Map(normalizedRoleRights);
