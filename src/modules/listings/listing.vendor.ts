import mongoose from "mongoose";
import ServiceListing from "./listings.modal";

const vendorSchema = new mongoose.Schema({
  serviceTypeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceCategory",
  },
  subcategories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceSubCategory",
    },
  ],
  foundedYear: {
    type: Number,
  },
  teamSize: {
    type: Number,
  },
  website: {
    type: String,
  },
  instagram: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  Vendorrolesandterms: {
    travelfee: {
      type: Boolean,
      required: true,
    },
    accommodation: {
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

const VendorListing = ServiceListing.discriminator(
  "VendorListing",
  vendorSchema
);

export default VendorListing;
