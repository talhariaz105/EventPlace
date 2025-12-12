import mongoose from "mongoose";

export const listingFilter = (filter: Record<string, any>) => {
  const query: Record<string, any> = {};

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
    query["serviceTypeId"] = new mongoose.Types.ObjectId(
      filter["serviceTypeId"]
    );
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
    query["vendorId"] = new mongoose.Types.ObjectId(filter["vendorId"]);
  }
  if (filter["eventTypeIds"]) {
    const ids = Array.isArray(filter["eventTypeIds"])
      ? filter["eventTypeIds"]
      : [filter["eventTypeIds"]];
    query["eventTypes"] = {
      $in: ids.map((id: string) => new mongoose.Types.ObjectId(id)),
    };
  }

  const { city, state, country, longitude, latitude, minPrice, maxPrice } =
    filter; // Destructure from filter

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
      $all: amenities.map((id: string) => new mongoose.Types.ObjectId(id)),
    };
  }
  if (filter["venueStyles"]) {
    const venueStyles = Array.isArray(filter["venueStyles"])
      ? filter["venueStyles"]
      : [filter["venueStyles"]];
    query["venueStyles"] = {
      $in: venueStyles.map((id: string) => new mongoose.Types.ObjectId(id)),
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
      $all: layouts,
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
