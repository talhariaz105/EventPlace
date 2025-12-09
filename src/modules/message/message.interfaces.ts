import mongoose, { Document } from 'mongoose';
import { IUserDoc } from '../user/user.interfaces';

export interface IMessageDoc extends Document {
  chat: mongoose.Schema.Types.ObjectId;
  sender?: mongoose.Schema.Types.ObjectId;
  contentTitle?: string;
  content: string;
  contentDescription?: string;
  contentDescriptionType?: string;
  contentType?: string;
  reactionsCount?: Map<string, number>;
  reply?: mongoose.Schema.Types.ObjectId;
  userSettings?: Array<{
    userId: mongoose.Schema.Types.ObjectId;
    readAt?: Date;
    deliveredAt?: Date;
    deletedAt?: Date;
  }>;
  createdAt?: Date;
  updatedAt?: Date;
  editedAt?: Date;
}

export interface IgetMessageResponse extends Omit<IMessageDoc, 'sender' | 'reply'> {
  sender: IUserDoc;
  reply?: IMessageDoc | null;
}


export interface ICreateMessage {
  chat: string;
  sender?: string;
  contentTitle?: string;
  content?: string;
  contentDescription?: string;
  contentDescriptionType?: string;
  contentType?: string;
  reactionsCount?: Map<string, number>;
  reply?: string;
  userSettings?: Array<{
    userId: string;
    readAt?: Date;
    deliveredAt?: Date;
    deletedAt?: Date;
  }>;
  editedAt?: Date;
}