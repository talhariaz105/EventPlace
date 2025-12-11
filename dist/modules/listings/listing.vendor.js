"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const listings_modal_1 = __importDefault(require("./listings.modal"));
const vendorSchema = new mongoose_1.default.Schema({
    serviceTypeId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ServiceCategory",
    },
    subcategories: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
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
const VendorListing = listings_modal_1.default.discriminator("VendorListing", vendorSchema);
exports.default = VendorListing;
