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
const VendorListing = listings_modal_1.default.discriminator("vendor", vendorSchema);
exports.default = VendorListing;
