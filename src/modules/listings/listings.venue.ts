import mongoose from "mongoose";
import ServiceListing from "./listings.modal";

const venueSchema = new mongoose.Schema({
  capacity: {
    type: Number,
  },
  rooms: {
    type: Number,
  },
  amenties: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Amenty",
    },
  ],
  cleaning: {
    type: String,
    enum: ["include", "exclude"],
    required: true,
  },
  catering: {
    type: String,
    enum: ["include", "exclude"],
    required: true,
  },
  outsideFoodAllowed: {
    type: Boolean,
    required: true,
  },
  alcoholAllowed: {
    type: Boolean,
    required: true,
  },
  inhouseBar: {
    type: Boolean,
    required: true,
  },
  venueStyle: {
    type: String,
    enumer: ["modern", "classic", "industrial", "rustic", "other"],
  },
  layouts: [
    {
      type: String,
      enyum: [
        "banquet",
        "theater",
        "classroom",
        "u-shape",
        "cocktail",
        "other",
      ],
    },
  ],
  area: {
    value: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
  },
  Venuerolesandterms: {
    noise: {
      type: Boolean,
      required: true,
    },
    curfew: {
      type: Boolean,
      required: true,
    },
    cancelationPolicy: {
      type: Boolean,
      required: true,
    },
    cancelationFiles: [
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
    refundPolicy: {
      type: Boolean,
      required: true,
    },
    refundFiles: [
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
  },
});

const VenueListing = ServiceListing.discriminator("VenueListing", venueSchema);

export default VenueListing;
