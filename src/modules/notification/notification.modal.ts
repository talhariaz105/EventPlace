import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "message" | "task" | "booking";
  isRead: boolean;
  createdAt: Date;
  notificationFor?: string;
  forId?: mongoose.Types.ObjectId;
  link?: string;
 
}

const notificationSchema = new Schema<INotification>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  notificationFor: {
    type: String,
  },
  forId: {
    type: Schema.Types.ObjectId,
    refPath: "notificationFor",
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
    enum: ["message", "booking"],
    required: true,
  },
  link: {
    type: String,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Add index for better query performance
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);

export default Notification;
