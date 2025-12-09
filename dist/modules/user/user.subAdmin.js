"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("./user.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const subAdminSchema = new mongoose_1.default.Schema({
    createdBy: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    adminOF: [{
            method: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: "Subscription"
            },
            workspacePermissions: [{
                    type: mongoose_1.default.Schema.Types.ObjectId,
                    refPath: "adminOF.type"
                }]
        }],
    subAdminRole: {
        type: String,
        enum: ["subAdmin", "standardUser"],
        default: "subAdmin"
    },
    permissions: {
        type: [String],
        default: []
    }
});
const subAdmin = user_model_1.default.discriminator("subAdmin", subAdminSchema);
exports.default = subAdmin;
