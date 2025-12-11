import Joi from "joi";
import { objectId } from "../validate/custom.validation";

const createListingsBody = {
  name: Joi.string().trim().min(3),
  hostingCompany: Joi.string().trim(),
  shortSummary: Joi.string().trim(),
  descrption: Joi.string().trim(),
  location: Joi.object().keys({
    address: Joi.string().trim(),
    city: Joi.string().trim(),
    state: Joi.string().trim(),
    country: Joi.string().trim(),
    zipCode: Joi.string().trim(),
    coordinates: Joi.array().items(Joi.number()).length(2),
    radius: Joi.number().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
  }),
  media: Joi.array()
    .items(
      Joi.object().keys({
        url: Joi.string().trim(),
        key: Joi.string().optional(),
        type: Joi.string().trim(),
      })
    )
    .min(1)
    .required(),
  serviceDays: Joi.array()
    .items(
      Joi.object().keys({
        day: Joi.string().trim(),
        startTime: Joi.string().trim(),
        endTime: Joi.string().trim(),
        price: Joi.number(),
      })
    )
    .min(1),
  vendorId: Joi.string().custom(objectId),
  cleaning: Joi.string().valid("include", "exclude"),
  catering: Joi.string().valid("include", "exclude"),
  outsideFoodAllowed: Joi.boolean(),
  alcoholAllowed: Joi.boolean(),
  inhouseBar: Joi.boolean(),
  Venuerolesandterms: Joi.object().keys({
    noise: Joi.boolean().required(),
    curfew: Joi.boolean().required(),
    cancelationPolicy: Joi.boolean().required(),
    cancelationFiles: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        type: Joi.string().required(),
        key: Joi.string().optional(),
      })
    ),
    refundPolicy: Joi.boolean().required(),
    refundFiles: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        type: Joi.string().required(),
        key: Joi.string().optional(),
      })
    ),
  }),
  area: Joi.object().keys({
    value: Joi.number().required(),
    unit: Joi.string().required(),
  }),
  maxSeatingCapacity: Joi.number().optional(),
  maxStandingCapacity: Joi.number().optional(),
  rooms: Joi.number().optional(),
  amenties: Joi.array().items(Joi.string().custom(objectId)).optional(),
  timeZone: Joi.string(),
  basePriceRange: Joi.string(),
  packeges: Joi.array()
    .items(
      Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required(),
        price: Joi.number().required(),
        thumbnail: Joi.string().optional(),
        thumbnailKey: Joi.string().optional(),
        priceUnit: Joi.string().valid("fixed", "hourly", "daily").optional(),
        amenties: Joi.array().items(Joi.string().custom(objectId)).optional(),
      })
    )
    .optional(),
  serviceTypeId: Joi.string().custom(objectId).optional(),
  instagram: Joi.string().optional(),
  website: Joi.string().optional(),
  foundedYear: Joi.number().optional(),
  teamSize: Joi.number().optional(),
  minimumTimeForBooking: Joi.number().optional(),
  minimumTimeForBookingUnit: Joi.string().optional(),
  status: Joi.string().valid("pending", "approved", "rejected").optional(),
  VerificationStatus: Joi.string()
    .valid("pending", "verified", "unverified")
    .optional(),
  isDeleted: Joi.boolean().optional().default(false),
  logo: Joi.string().optional(),
  logoKey: Joi.string().optional(),
  venueStyle: Joi.string().optional(),
  layouts: Joi.array().items(Joi.string()).optional(),
  subcategories: Joi.array().items(Joi.string().custom(objectId)).optional(),
  type: Joi.string().valid("venue", "vendor"),
  ispublished: Joi.boolean().optional().default(false),
  Vendorrolesandterms: Joi.object().keys({
    travelfee: Joi.boolean().required(),
    accommodation: Joi.boolean().required(),
    cancelationPolicy: Joi.boolean().required(),
    cancelationFiles: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        type: Joi.string().required(),
        key: Joi.string().optional(),
      })
    ),
    refundPolicy: Joi.boolean().required(),
    refundFiles: Joi.array().items(
      Joi.object().keys({
        url: Joi.string().required(),
        type: Joi.string().required(),
        key: Joi.string().optional(),
      })
    ),
    eventTypes: Joi.array().items(Joi.string().custom(objectId)).optional(),
  }),
};

export const createListings = {
  body: Joi.object()
    .keys(createListingsBody)
    .fork(
      ["type", "name", "hostingCompany", "shortSummary", "location"],
      (schema) => schema.required()
    ),
};

export const getListings = {
  query: Joi.object().keys({
    search: Joi.string(),
    name: Joi.string(),
    vendorId: Joi.string().custom(objectId),
    status: Joi.string().valid("pending", "approved", "rejected"),
    VerificationStatus: Joi.string().valid("pending", "verified", "unverified"),
    isDeleted: Joi.boolean(),
    serviceTypeId: Joi.string().custom(objectId),
    type: Joi.string().valid("venue", "vendor"),
    eventTypeIds: Joi.alternatives().try(
      Joi.string().custom(objectId),
      Joi.array().items(Joi.string().custom(objectId))
    ),
    city: Joi.string(),
    state: Joi.string(),
    country: Joi.string(),
    longitude: Joi.number(),
    latitude: Joi.number(),
    minPrice: Joi.number(),
    maxPrice: Joi.number(),
    amenities: Joi.alternatives().try(
      Joi.string().custom(objectId),
      Joi.array().items(Joi.string().custom(objectId))
    ),
    venueStyles: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    capacity: Joi.number().integer(),
    layouts: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    outsideFoodAllowed: Joi.string().valid("true", "false"),
    alcoholAllowed: Joi.string().valid("true", "false"),
    inhouseBar: Joi.string().valid("true", "false"),
    sortBy: Joi.string(),
    projectBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

export const getListingsById = {
  params: Joi.object().keys({
    listingsId: Joi.string().custom(objectId),
  }),
};

export const updateListings = {
  params: Joi.object().keys({
    listingsId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys(createListingsBody).min(1),
};

export const deleteListings = {
  params: Joi.object().keys({
    listingsId: Joi.string().custom(objectId),
  }),
};

export const getListingsByVendorId = {
  params: Joi.object().keys({
    vendorId: Joi.string().custom(objectId),
  }),
  query: Joi.object().keys({
    type: Joi.string().valid("venue", "vendor"),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};
