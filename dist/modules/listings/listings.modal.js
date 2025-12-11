"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const listingsSchema = new mongoose_1.default.Schema({
    type: {
        type: String,
        enum: ["venue", "vendor"],
    },
    name: {
        type: String,
    },
    hostingCompany: {
        type: String,
    },
    shortSummary: {
        type: String,
    },
    descrption: {
        type: String,
    },
    location: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
        },
        state: {
            type: String,
        },
        zipCode: {
            type: String,
            required: true,
        },
        country: {
            type: String,
        },
        coordinates: {
            type: [Number],
        },
        radius: {
            type: Number,
        },
        latitude: {
            type: Number,
        },
        longitude: {
            type: Number,
        },
        type: {
            type: String,
            default: "Point",
        },
    },
    media: [
        {
            url: {
                type: String,
                required: true,
            },
            type: {
                type: String,
                required: true,
            },
            key: {
                type: String,
            },
        },
    ],
    logo: {
        type: String,
    },
    logoKey: {
        type: String,
    },
    vendorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "Vendor",
        required: true,
    },
    basePriceRange: {
        type: String,
    },
    timeZone: {
        type: String,
    },
    packeges: [
        {
            name: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            thumbnail: {
                type: String,
            },
            thumbnailKey: {
                type: String,
            },
            amenties: [
                {
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    ref: "Amenty",
                },
            ],
            priceUnit: {
                type: String,
                enum: ["fixed", "hourly", "daily"],
            },
        },
    ],
    serviceDays: [
        {
            day: {
                type: String,
                required: true,
            },
            startTime: {
                type: String,
                required: true,
            },
            endTime: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
        },
    ],
    status: {
        type: String,
    },
    VerificationStatus: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    businessHourDisabled: {
        type: Boolean,
        default: false,
    },
    ispublished: {
        type: Boolean,
        default: false,
    },
    eventTypes: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "EventType",
        },
    ],
}, {
    timestamps: true,
    discriminatorKey: "type",
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
});
listingsSchema.pre("findOneAndUpdate", function (next) {
    const update = this.getUpdate();
    // Handle location updates with coordinate conversion
    if (update?.location) {
        console.log("Update location data:", update.location);
        let lat, lng, radius;
        // Handle case where latitude and longitude are provided
        if (update.location.latitude !== undefined &&
            update.location.longitude !== undefined) {
            lat = parseFloat(update.location.latitude);
            lng = parseFloat(update.location.longitude);
            radius = parseFloat(update.location.radius) || 0;
        }
        // Handle case where coordinates array is provided but might contain strings
        else if (update.location.coordinates &&
            Array.isArray(update.location.coordinates)) {
            lng = parseFloat(update.location.coordinates[0]);
            lat = parseFloat(update.location.coordinates[1]);
            radius = parseFloat(update.location.radius) || 0;
        }
        // If we have valid coordinates, ensure they are properly formatted
        if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
            // Ensure coordinates are valid numbers
            if (isFinite(lat) &&
                isFinite(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180) {
                update.location = {
                    ...update.location,
                    coordinates: [lng, lat],
                    longitude: lng,
                    latitude: lat,
                    radius: radius,
                    type: "Point",
                };
                console.log("Converted coordinates:", update.location.coordinates);
            }
            else {
                console.error("Invalid coordinates detected:", { lat, lng });
                return next(new Error("Invalid coordinates provided"));
            }
        }
    }
    next();
});
listingsSchema.pre("save", function (next) {
    // Handle location coordinates conversion for save operations
    if (this.location) {
        let lat, lng, radius;
        // Handle case where latitude and longitude are provided
        if (this.location.latitude !== undefined &&
            this.location.longitude !== undefined) {
            lat =
                typeof this.location.latitude === "number"
                    ? this.location.latitude
                    : parseFloat(String(this.location.latitude));
            lng =
                typeof this.location.longitude === "number"
                    ? this.location.longitude
                    : parseFloat(String(this.location.longitude));
            radius =
                this.location.radius !== undefined
                    ? typeof this.location.radius === "number"
                        ? this.location.radius
                        : parseFloat(String(this.location.radius))
                    : 0;
        }
        // Handle case where coordinates array is provided but might contain strings
        else if (this.location.coordinates &&
            Array.isArray(this.location.coordinates)) {
            lng =
                typeof this.location.coordinates[0] === "number"
                    ? this.location.coordinates[0]
                    : parseFloat(String(this.location.coordinates[0]));
            lat =
                typeof this.location.coordinates[1] === "number"
                    ? this.location.coordinates[1]
                    : parseFloat(String(this.location.coordinates[1]));
            radius =
                this.location.radius !== undefined
                    ? typeof this.location.radius === "number"
                        ? this.location.radius
                        : parseFloat(String(this.location.radius))
                    : 0;
        }
        // If we have valid coordinates, ensure they are properly formatted
        if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
            // Ensure coordinates are valid numbers
            if (isFinite(lat) &&
                isFinite(lng) &&
                lat >= -90 &&
                lat <= 90 &&
                lng >= -180 &&
                lng <= 180) {
                this.location = {
                    ...this.location,
                    coordinates: [lng, lat],
                    longitude: lng,
                    latitude: lat,
                    ...(radius !== undefined && { radius }),
                };
            }
            else {
                console.error("Invalid coordinates detected:", { lat, lng });
                return next(new Error("Invalid coordinates provided"));
            }
        }
    }
    next();
});
listingsSchema.index({ location: "2dsphere" });
const ServiceListing = mongoose_1.default.model("ServiceListing", listingsSchema);
exports.default = ServiceListing;
