import { IMessageDoc } from './message.interfaces';
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chat: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    contentTitle: { type: String },
    content: { type: String, required: true },
    contentDescription: { type: String },
    contentDescriptionType: { type: String, enum: ['text', 'link'], default: 'text' },
    reply: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    contentType: {
      type: String,
      enum: ['text', 'image', 'video', 'file', 'audio', 'contact', 'link'],
    },
    reactionsCount: { type: Map, of: Number, default: {} },
    editedAt: { type: Date },
    userSettings: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        deliveredAt: { type: Date },
        readAt: { type: Date },
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model<IMessageDoc>('Message', messageSchema);

export default Message;
