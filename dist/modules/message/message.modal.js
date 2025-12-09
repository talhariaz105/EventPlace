"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const messageSchema = new mongoose_1.default.Schema({
    chat: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' },
    contentTitle: { type: String },
    content: { type: String, required: true },
    contentDescription: { type: String },
    contentDescriptionType: { type: String, enum: ['text', 'link'], default: 'text' },
    reply: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Message' },
    contentType: {
        type: String,
        enum: ['text', 'image', 'video', 'file', 'audio', 'contact', 'link'],
    },
    reactionsCount: { type: Map, of: Number, default: {} },
    editedAt: { type: Date },
    userSettings: [
        {
            userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
            deliveredAt: { type: Date },
            readAt: { type: Date },
        },
    ],
}, { timestamps: true });
const Message = mongoose_1.default.model('Message', messageSchema);
exports.default = Message;
