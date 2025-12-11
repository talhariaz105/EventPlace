"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getListingsByVendorId = exports.deleteListings = exports.updateListings = exports.getListingsById = exports.getListings = exports.createListings = void 0;
const joi_1 = __importDefault(require("joi"));
const custom_validation_1 = require("../validate/custom.validation");
const createListingsBody = {
    name: joi_1.default.string().trim().min(3),
    hostingCompany: joi_1.default.string().trim(),
    shortSummary: joi_1.default.string().trim(),
    descrption: joi_1.default.string().trim(),
    location: joi_1.default.object().keys({
        address: joi_1.default.string().trim(),
        city: joi_1.default.string().trim(),
        state: joi_1.default.string().trim(),
        country: joi_1.default.string().trim(),
        zipCode: joi_1.default.string().trim(),
        coordinates: joi_1.default.array().items(joi_1.default.number()).length(2),
        radius: joi_1.default.number().optional(),
        latitude: joi_1.default.number().optional(),
        longitude: joi_1.default.number().optional(),
    }),
    media: joi_1.default.array()
        .items(joi_1.default.object().keys({
        url: joi_1.default.string().trim(),
        key: joi_1.default.string().optional(),
        type: joi_1.default.string().trim(),
    }))
        .min(1)
        .required(),
    serviceDays: joi_1.default.array()
        .items(joi_1.default.object().keys({
        day: joi_1.default.string().trim(),
        startTime: joi_1.default.string().trim(),
        endTime: joi_1.default.string().trim(),
        price: joi_1.default.number(),
    }))
        .min(1),
    vendorId: joi_1.default.string().custom(custom_validation_1.objectId),
    cleaning: joi_1.default.string().valid("include", "exclude"),
    catering: joi_1.default.string().valid("include", "exclude"),
    outsideFoodAllowed: joi_1.default.boolean(),
    alcoholAllowed: joi_1.default.boolean(),
    inhouseBar: joi_1.default.boolean(),
    Venuerolesandterms: joi_1.default.object().keys({
        noise: joi_1.default.boolean().required(),
        curfew: joi_1.default.boolean().required(),
        cancelationPolicy: joi_1.default.boolean().required(),
        cancelationFiles: joi_1.default.array().items(joi_1.default.object().keys({
            url: joi_1.default.string().required(),
            type: joi_1.default.string().required(),
            key: joi_1.default.string().optional(),
        })),
        refundPolicy: joi_1.default.boolean().required(),
        refundFiles: joi_1.default.array().items(joi_1.default.object().keys({
            url: joi_1.default.string().required(),
            type: joi_1.default.string().required(),
            key: joi_1.default.string().optional(),
        })),
    }),
    area: joi_1.default.object().keys({
        value: joi_1.default.number().required(),
        unit: joi_1.default.string().required(),
    }),
    maxSeatingCapacity: joi_1.default.number().optional(),
    maxStandingCapacity: joi_1.default.number().optional(),
    rooms: joi_1.default.number().optional(),
    amenties: joi_1.default.array().items(joi_1.default.string().custom(custom_validation_1.objectId)).optional(),
    timeZone: joi_1.default.string(),
    basePriceRange: joi_1.default.string(),
    packeges: joi_1.default.array()
        .items(joi_1.default.object().keys({
        name: joi_1.default.string().required(),
        description: joi_1.default.string().required(),
        price: joi_1.default.number().required(),
        thumbnail: joi_1.default.string().optional(),
        thumbnailKey: joi_1.default.string().optional(),
        priceUnit: joi_1.default.string().valid("fixed", "hourly", "daily").optional(),
        amenties: joi_1.default.array().items(joi_1.default.string().custom(custom_validation_1.objectId)).optional(),
    }))
        .optional(),
    serviceTypeId: joi_1.default.string().custom(custom_validation_1.objectId).optional(),
    instagram: joi_1.default.string().optional(),
    website: joi_1.default.string().optional(),
    foundedYear: joi_1.default.number().optional(),
    teamSize: joi_1.default.number().optional(),
    minimumTimeForBooking: joi_1.default.number().optional(),
    minimumTimeForBookingUnit: joi_1.default.string().optional(),
    status: joi_1.default.string().valid("pending", "approved", "rejected").optional(),
    VerificationStatus: joi_1.default.string()
        .valid("pending", "verified", "unverified")
        .optional(),
    isDeleted: joi_1.default.boolean().optional().default(false),
    logo: joi_1.default.string().optional(),
    logoKey: joi_1.default.string().optional(),
    venueStyle: joi_1.default.string().optional(),
    layouts: joi_1.default.array().items(joi_1.default.string()).optional(),
    subcategories: joi_1.default.array().items(joi_1.default.string().custom(custom_validation_1.objectId)).optional(),
    type: joi_1.default.string().valid("venue", "vendor"),
    ispublished: joi_1.default.boolean().optional().default(false),
    Vendorrolesandterms: joi_1.default.object().keys({
        travelfee: joi_1.default.boolean().required(),
        accommodation: joi_1.default.boolean().required(),
        cancelationPolicy: joi_1.default.boolean().required(),
        cancelationFiles: joi_1.default.array().items(joi_1.default.object().keys({
            url: joi_1.default.string().required(),
            type: joi_1.default.string().required(),
            key: joi_1.default.string().optional(),
        })),
        refundPolicy: joi_1.default.boolean().required(),
        refundFiles: joi_1.default.array().items(joi_1.default.object().keys({
            url: joi_1.default.string().required(),
            type: joi_1.default.string().required(),
            key: joi_1.default.string().optional(),
        })),
        eventTypes: joi_1.default.array().items(joi_1.default.string().custom(custom_validation_1.objectId)).optional(),
    }),
};
exports.createListings = {
    body: joi_1.default.object()
        .keys(createListingsBody)
        .fork(["type", "name", "hostingCompany", "shortSummary", "location"], (schema) => schema.required()),
};
exports.getListings = {
    query: joi_1.default.object().keys({
        search: joi_1.default.string(),
        name: joi_1.default.string(),
        vendorId: joi_1.default.string().custom(custom_validation_1.objectId),
        status: joi_1.default.string().valid("pending", "approved", "rejected"),
        VerificationStatus: joi_1.default.string().valid("pending", "verified", "unverified"),
        isDeleted: joi_1.default.boolean(),
        serviceTypeId: joi_1.default.string().custom(custom_validation_1.objectId),
        type: joi_1.default.string().valid("venue", "vendor"),
        eventTypeIds: joi_1.default.alternatives().try(joi_1.default.string().custom(custom_validation_1.objectId), joi_1.default.array().items(joi_1.default.string().custom(custom_validation_1.objectId))),
        city: joi_1.default.string(),
        state: joi_1.default.string(),
        country: joi_1.default.string(),
        longitude: joi_1.default.number(),
        latitude: joi_1.default.number(),
        minPrice: joi_1.default.number(),
        maxPrice: joi_1.default.number(),
        amenities: joi_1.default.alternatives().try(joi_1.default.string().custom(custom_validation_1.objectId), joi_1.default.array().items(joi_1.default.string().custom(custom_validation_1.objectId))),
        venueStyles: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.array().items(joi_1.default.string())),
        capacity: joi_1.default.number().integer(),
        layouts: joi_1.default.alternatives().try(joi_1.default.string(), joi_1.default.array().items(joi_1.default.string())),
        outsideFoodAllowed: joi_1.default.string().valid("true", "false"),
        alcoholAllowed: joi_1.default.string().valid("true", "false"),
        inhouseBar: joi_1.default.string().valid("true", "false"),
        sortBy: joi_1.default.string(),
        projectBy: joi_1.default.string(),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
exports.getListingsById = {
    params: joi_1.default.object().keys({
        listingsId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
exports.updateListings = {
    params: joi_1.default.object().keys({
        listingsId: joi_1.default.required().custom(custom_validation_1.objectId),
    }),
    body: joi_1.default.object().keys(createListingsBody).min(1),
};
exports.deleteListings = {
    params: joi_1.default.object().keys({
        listingsId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
};
exports.getListingsByVendorId = {
    params: joi_1.default.object().keys({
        vendorId: joi_1.default.string().custom(custom_validation_1.objectId),
    }),
    query: joi_1.default.object().keys({
        type: joi_1.default.string().valid("venue", "vendor"),
        limit: joi_1.default.number().integer(),
        page: joi_1.default.number().integer(),
    }),
};
