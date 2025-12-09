import mongoose from 'mongoose';

export interface IGetUserNotificationsParams {
  userId: string | mongoose.Types.ObjectId;
  page?: number;
  limit?: number;
}

export interface IGetUserUnreadNotificationsParams {
  userId: string | mongoose.Types.ObjectId;
  subId: string | mongoose.Types.ObjectId;
}

export interface IReadUserNotificationsParams {
  userId: string | mongoose.Types.ObjectId;
  accountId: string | mongoose.Types.ObjectId;
}

export interface ICreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'serviceListing' | 'booking' | 'user' | 'review' | 'message' | 'payout' | 'task';
  accountId?: string | mongoose.Types.ObjectId;
  subId?: string | mongoose.Types.ObjectId;
  forId?: string | mongoose.Types.ObjectId;
  notificationFor?: string;
  sendEmailNotification?: boolean;
  link?: string;
  key?: string;
}

export interface INotificationResponse {
  success: boolean;
  message?: string;
  notifications?: any[];
  notification?: any;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}
