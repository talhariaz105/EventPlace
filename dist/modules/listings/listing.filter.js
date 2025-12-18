"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingFilter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const listingFilter = (filter) => {
    const query = {};
    if (filter["search"]) {
        const regex = { $regex: filter["search"], $options: "i" };
        query["$or"] = [
            { name: regex },
            { description: regex },
            { hostingCompany: regex },
            { "vendorData.name": regex },
            { shortSummary: regex },
            { "location.address": regex },
            { "location.city": regex },
            { "location.state": regex },
            { "location.country": regex },
            { "location.zipCode": regex },
            { "packeges.name": regex },
            { "packeges.description": regex },
        ];
    }
    if (filter["serviceTypeId"]) {
        query["serviceTypeId"] = new mongoose_1.default.Types.ObjectId(filter["serviceTypeId"]);
    }
    if (filter["status"]) {
        query["status"] = filter["status"];
    }
    if (filter["VerificationStatus"]) {
        query["VerificationStatus"] = filter["VerificationStatus"];
    }
    if (filter["listingtype"]) {
        query["listingtype"] = filter["listingtype"];
    }
    if (filter["vendorId"]) {
        query["vendorId"] = new mongoose_1.default.Types.ObjectId(filter["vendorId"]);
    }
    if (filter["eventTypeIds"]) {
        const ids = Array.isArray(filter["eventTypeIds"])
            ? filter["eventTypeIds"]
            : [filter["eventTypeIds"]];
        query["eventTypes"] = {
            $in: ids.map((id) => new mongoose_1.default.Types.ObjectId(id)),
        };
    }
    const { city, state, country, longitude, latitude, minPrice, maxPrice } = filter; // Destructure from filter
    if (city) {
        query["location.city"] = city;
    }
    if (state) {
        query["location.state"] = state;
    }
    if (country) {
        query["location.country"] = country;
    }
    if (minPrice && maxPrice) {
        query["basePriceRange"] = {
            $lte: maxPrice,
            $gte: minPrice,
        };
    }
    else if (minPrice) {
        query["basePriceRange"] = { $gte: minPrice };
    }
    else if (maxPrice) {
        query["basePriceRange"] = { $lte: maxPrice };
    }
    // Geospatial filter
    const radiusInMeters = 5000;
    const earthRadiusInMeters = 6378137;
    if (longitude && latitude) {
        query["location"] = {
            $geoWithin: {
                $centerSphere: [
                    [parseFloat(longitude), parseFloat(latitude)],
                    radiusInMeters / earthRadiusInMeters,
                ],
            },
        };
    }
    if (filter["amenities"]) {
        const amenities = Array.isArray(filter["amenities"])
            ? filter["amenities"]
            : [filter["amenities"]];
        query["amenties"] = {
            $all: amenities.map((id) => new mongoose_1.default.Types.ObjectId(id)),
        };
    }
    if (filter["venueStyles"]) {
        const venueStyles = Array.isArray(filter["venueStyles"])
            ? filter["venueStyles"]
            : [filter["venueStyles"]];
        query["venueStyle"] = {
            $in: venueStyles,
        };
    }
    if (filter["capacity"]) {
        query["capacity"] = { $gte: parseInt(filter["capacity"]) };
    }
    if (filter["layouts"]) {
        const layouts = Array.isArray(filter["layouts"])
            ? filter["layouts"]
            : [filter["layouts"]];
        query["layouts"] = {
            $in: layouts,
        };
    }
    if (filter["outsideFoodAllowed"] !== undefined) {
        query["outsideFoodAllowed"] = filter["outsideFoodAllowed"] === "true";
    }
    if (filter["alcoholAllowed"] !== undefined) {
        query["alcoholAllowed"] = filter["alcoholAllowed"] === "true";
    }
    if (filter["inhouseBar"] !== undefined) {
        query["inhouseBar"] = filter["inhouseBar"] === "true";
    }
    return query;
};
exports.listingFilter = listingFilter;
