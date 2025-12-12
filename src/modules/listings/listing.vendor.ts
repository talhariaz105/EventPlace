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
      ref: "SubCategory",
    },
  ],
  foundedYear: {
    type: Number
  },
  teamSize: {
    type: Number
  },
  website: {
    type: String
  },
  instagram: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  Vendorrolesandterms: {
    travelfee: {
      type: Boolean
    },
    accommodation: {
      type: Boolean
    },
    cancelationPolicy: {
      type: Boolean
    },
    cancelationFiles: [
      {
        url: {
          type: String
        },
        type: {
          type: String
        },
        key: {
          type: String
        },
      },
    ],
    refundPolicy: {
      type: Boolean,
    },
    refundFiles: [
      {
        url: {
          type: String,
        },
        type: {
          type: String,
        },
        key: {
          type: String,
        },
      },
    ],
  },
});

const VendorListing = ServiceListing.discriminator(
  "vendor",
  vendorSchema
);

export default VendorListing;
