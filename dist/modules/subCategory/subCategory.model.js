"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const toJSON_1 = __importDefault(require("../toJSON/toJSON"));
const paginate_1 = __importDefault(require("../paginate/paginate"));
const subCategorySchema = new mongoose_1.default.Schema({
    serviceCategory: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "ServiceCategory",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: { getters: true },
});
// add plugin that converts mongoose to json
subCategorySchema.plugin(toJSON_1.default);
subCategorySchema.plugin(paginate_1.default);
const SubCategory = mongoose_1.default.model("SubCategory", subCategorySchema);
exports.default = SubCategory;
