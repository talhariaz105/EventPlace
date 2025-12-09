import { Document, ObjectId } from "mongoose";


export interface IReactionModal extends Document {
    messageId: string;
    userId: ObjectId
    emoji: string;
}