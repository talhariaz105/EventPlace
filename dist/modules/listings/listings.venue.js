"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const listings_modal_1 = __importDefault(require("./listings.modal"));
const venueSchema = new mongoose_1.default.Schema({
    capacity: {
        type: Number,
    },
    rooms: {
        type: Number,
    },
    amenties: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: "Amenities",
        },
    ],
    cleaning: {
        type: String,
        enum: ["include", "exclude"],
    },
    catering: {
        type: String,
        enum: ["include", "exclude"],
    },
    outsideFoodAllowed: {
        type: Boolean,
    },
    alcoholAllowed: {
        type: Boolean,
    },
    inhouseBar: {
        type: Boolean,
    },
    venueStyle: {
        type: String,
        enumer: ["modern", "classic", "industrial", "rustic", "other"],
    },
    layouts: [
        {
            type: String,
            enum: ["banquet", "theater", "classroom", "u-shape", "cocktail"],
        },
    ],
    area: {
        value: {
            type: Number,
        },
        unit: {
            type: String,
        },
    },
    Venuerolesandterms: {
        noise: {
            type: Boolean,
        },
        curfew: {
            type: Boolean,
        },
        cancelationPolicy: {
            type: Boolean,
        },
        cancelationFiles: [
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
const VenueListing = listings_modal_1.default.discriminator("venue", venueSchema);
exports.default = VenueListing;
