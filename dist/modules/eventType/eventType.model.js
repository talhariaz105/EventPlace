"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const toJSON_1 = __importDefault(require("../toJSON/toJSON"));
const paginate_1 = __importDefault(require("../paginate/paginate"));
const eventTypeSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});
// add plugin that converts mongoose to json
eventTypeSchema.plugin(toJSON_1.default);
eventTypeSchema.plugin(paginate_1.default);
const EventType = mongoose_1.default.model("EventType", eventTypeSchema);
exports.default = EventType;
