import mongoose from 'mongoose';
import Notification from './notification.modal';
import {
  IGetUserNotificationsParams,
  IGetUserUnreadNotificationsParams,
  INotificationResponse,
  IReadUserNotificationsParams,
  ICreateNotificationParams,
} from './notification.interfaces';
import { getSocketInstance } from '../socket/socket.initialize';
import { User } from '../user';
import { sendEmail } from '../email/email.service';
// import NotificationSettingModal from '../workspace/notificationSetting/notificationSetting.modal';

export const createNotification = async (
  params: ICreateNotificationParams,
  workspaceId: string,
  key: string
): Promise<INotificationResponse> => {
  try {
    // const findNotificationSetting = await NotificationSettingModal.findOne({ workspaceId: workspaceId });
        const findNotificationSetting:any = null

    console.log(`Fetched notification setting for workspace: ${workspaceId}`, findNotificationSetting);

    if (findNotificationSetting) {
      const isEnabled = (findNotificationSetting as any)[key];
      console.log(
        `Notification setting for workspace: ${workspaceId}, key: ${key} isEnabled: ${isEnabled}`,
        findNotificationSetting.enableNotifications
      );
      if (!isEnabled || !findNotificationSetting.enableNotifications) {
        console.log(`Notification is disabled for workspace: ${workspaceId}, key: ${key}`);
        return {
          success: false,
          message: 'Notification is disabled for this workspace.',
        };
      }
    }

    const { userId, title, message, type, accountId, notificationFor, forId, sendEmailNotification = false, link } = params;

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;
    const notification = new Notification({
      userId: userObjectId,
      title,
      message,
      type,
      accountId: accountId,
      subId: params.subId ? new mongoose.Types.ObjectId(params.subId) : undefined,
      isRead: false,
      isDelivered: false,
      notificationFor,
      forId,
      link,
    });

    await notification.save();
    console.log(`Notification created for user: ${userObjectId}`, notification);

    // Emit notification to user via socket if they are connected
    const io = getSocketInstance();
    if (io) {
      io.to(userObjectId?.toString()).emit('new-notification', {
        success: true,
        notification: notification.toObject(),
      });
    }

    // Send email notification if requested
    if (sendEmailNotification) {
      try {
        const user = await User.findById(userObjectId).select('email name');
        if (user && user.email) {
          const emailSubject = title;
          const emailText = `Hi ${user.name},\n\n${message}\n\nRegards,\nTeam`;
          const emailHtml = `
            <div style="margin:30px; padding:30px; border:1px solid #e0e0e0; border-radius: 10px; font-family: Arial, sans-serif;">
              <h4 style="color: #333;"><strong>Hi ${user.name},</strong></h4>
              <p style="color: #555; line-height: 1.6;">${message}</p>
              <p style="color: #555; margin-top: 20px;">You can view all your notifications by logging into your account.</p>
              <p style="color: #777; margin-top: 30px; font-size: 12px;">If you did not expect this notification, please ignore this email.</p>
              <p style="color: #555;">Regards,</p>
              <p style="color: #555;"><strong>Team</strong></p>
            </div>
          `;

          await sendEmail(user.email, emailSubject, emailText, emailHtml);
          console.log(`Email notification sent to ${user.email}`);
        }
      } catch (emailError: any) {
        console.error('Error sending email notification:', emailError.message);
        // Don't fail the notification creation if email fails
      }
    }

    return {
      success: true,
      notification: notification.toObject(),
      message: 'Notification created and sent successfully',
    };
  } catch (error: any) {
    console.error('Error in createNotification:', error.message);
    return {
      success: false,
      message: error.message || 'Error creating notification',
    };
  }
};

export const getUserNotifications = async (params: IGetUserNotificationsParams): Promise<INotificationResponse> => {
  try {
    const { userId, page = 1, limit = 20 } = params;

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page

    const skip = (validPage - 1) * validLimit;

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Get total count
    const total = await Notification.countDocuments({ userId: userObjectId });

    // Get paginated notifications
    const notifications = await Notification.find({ userId: userObjectId })
      .populate('forId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(validLimit)
      .lean();

    return {
      success: true,
      notifications,
      page: validPage,
      limit: validLimit,
      total,
      totalPages: Math.ceil(total / validLimit),
    };
  } catch (error: any) {
    console.error('Error in getUserNotifications:', error.message);
    return {
      success: false,
      message: error.message || 'Error fetching notifications',
    };
  }
};

export const getUserUnreadNotifications = async (
  params: IGetUserUnreadNotificationsParams
): Promise<INotificationResponse> => {
  try {
    const { userId, subId } = params;

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    const query: any = {
      userId: userObjectId,
      isRead: false,
    };
    if (subId) {
      query.subId = subId;
    } else {
      query.subId = { $exists: false };
    }

    console.log('Unread notifications query:', query);

    // Get unread notifications
    const notifications = await Notification.find(query).sort({ createdAt: -1 }).lean();

    return {
      success: true,
      notifications,
      total: notifications.length,
    };
  } catch (error: any) {
    console.error('Error in getUserUnreadNotifications:', error.message);
    return {
      success: false,
      message: error.message || 'Error fetching unread notifications',
    };
  }
};

export const readUserNotifications = async (
  params: IReadUserNotificationsParams
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { userId, accountId } = params;

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Build query based on accountId
    const query: any = {
      userId: userObjectId,
    };

    if (accountId) {
      query.subId = accountId;
    } else {
      query.subId = { $exists: false };
    }

    console.log('Read notifications query:', query);

    // Mark notifications as read based on query
    await Notification.updateMany(query, { $set: { isRead: true } });

    return { success: true };
  } catch (error: any) {
    console.error('Error in readUserNotifications:', error.message);
    return {
      success: false,
      message: error.message || 'Error marking notifications as read',
    };
  }
};

export const deleteUserNotifications = async (
  params: IReadUserNotificationsParams
): Promise<{ success: boolean; message?: string }> => {
  try {
    const { userId } = params;

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    // Delete all notifications
    await Notification.deleteMany({ userId: userObjectId });

    return { success: true };
  } catch (error: any) {
    console.error('Error in deleteUserNotifications:', error.message);
    return {
      success: false,
      message: error.message || 'Error deleting notifications',
    };
  }
};
