import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'serviceListing' | 'booking' | 'user' | 'review' | 'message' | 'payout';
  isRead: boolean;
  isDelivered: boolean;
  createdAt: Date;
  accountId?: mongoose.Types.ObjectId;
  notificationFor?: string;
  forId?: mongoose.Types.ObjectId;  
  link?: string;
  subId?: mongoose.Types.ObjectId;
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  notificationFor: {
    type: String,
  },
  forId: {
    type: Schema.Types.ObjectId,
    refPath: 'notificationFor',
  },
  accountId: {
    type: Schema.Types.ObjectId,
    ref: 'Account',
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['message', 'task','library','user','assessment','audit'],
    required: true,
  },
  link:{
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  subId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

});

// Add index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
