"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const toJSON_1 = __importDefault(require("../toJSON/toJSON"));
const paginate_1 = __importDefault(require("../paginate/paginate"));
const serviceCategorySchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    Icon: {
        type: String,
        trim: true,
    },
    Key: {
        type: String,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
// add plugin that converts mongoose to json
serviceCategorySchema.plugin(toJSON_1.default);
serviceCategorySchema.plugin(paginate_1.default);
const ServiceCategory = mongoose_1.default.model("ServiceCategory", serviceCategorySchema);
exports.default = ServiceCategory;
