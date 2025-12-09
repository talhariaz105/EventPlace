import {IChatDoc} from './chat.interfaces';
import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema(
  {
    chatOf: { type: String , required: true},
    obj: { type: mongoose.Schema.Types.ObjectId, refPath: 'chatOf' },
  },
  { timestamps: true }
);

const ChatModel = mongoose.model<IChatDoc>('Chat', chatSchema);

export default ChatModel;
