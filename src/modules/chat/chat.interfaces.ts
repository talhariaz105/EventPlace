import mongoose, { Document } from "mongoose";

 
 export interface IChatDoc extends  Document {
   obj?: mongoose.Schema.Types.ObjectId;
   chatOf?:string;
    workspace?: mongoose.Schema.Types.ObjectId;
    createdAt?: Date;
 }

 export interface ICreateChat  {
   obj?: string;
   chatOf?:string;
   workspace?: string;
   
 }

 export interface DeliveredMessage {
 chatIds: string[];
 userId: string;
}

export interface IGetMessages {
  chatId: string;
  userId: string;
  page?: number;
  limit?: number;
}
export interface IMessageIds {
  chatId: string;
  userId: string;
  messageIds: string[];
}

export interface IReactionParams {
  messageId: string;
  userId: string;
  emoji: string;
}