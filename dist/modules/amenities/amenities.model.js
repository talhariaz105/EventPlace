"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const toJSON_1 = __importDefault(require("../toJSON/toJSON"));
const paginate_1 = __importDefault(require("../paginate/paginate"));
const amenitiesSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    icon: {
        type: String,
    },
    iconKey: {
        type: String,
    },
}, {
    timestamps: true,
});
// add plugin that converts mongoose to json
amenitiesSchema.plugin(toJSON_1.default);
amenitiesSchema.plugin(paginate_1.default);
const Amenities = mongoose_1.default.model("Amenities", amenitiesSchema);
exports.default = Amenities;
