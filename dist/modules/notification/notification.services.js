"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserNotifications = exports.readUserNotifications = exports.getUserUnreadNotifications = exports.getUserNotifications = exports.createNotification = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const notification_modal_1 = __importDefault(require("./notification.modal"));
const socket_initialize_1 = require("../socket/socket.initialize");
const user_1 = require("../user");
const email_service_1 = require("../email/email.service");
// import NotificationSettingModal from '../workspace/notificationSetting/notificationSetting.modal';
const createNotification = async (params, workspaceId, key) => {
    try {
        // const findNotificationSetting = await NotificationSettingModal.findOne({ workspaceId: workspaceId });
        const findNotificationSetting = null;
        console.log(`Fetched notification setting for workspace: ${workspaceId}`, findNotificationSetting);
        if (findNotificationSetting) {
            const isEnabled = findNotificationSetting[key];
            console.log(`Notification setting for workspace: ${workspaceId}, key: ${key} isEnabled: ${isEnabled}`, findNotificationSetting.enableNotifications);
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
        const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        const notification = new notification_modal_1.default({
            userId: userObjectId,
            title,
            message,
            type,
            accountId: accountId,
            subId: params.subId ? new mongoose_1.default.Types.ObjectId(params.subId) : undefined,
            isRead: false,
            isDelivered: false,
            notificationFor,
            forId,
            link,
        });
        await notification.save();
        console.log(`Notification created for user: ${userObjectId}`, notification);
        // Emit notification to user via socket if they are connected
        const io = (0, socket_initialize_1.getSocketInstance)();
        if (io) {
            io.to(userObjectId?.toString()).emit('new-notification', {
                success: true,
                notification: notification.toObject(),
            });
        }
        // Send email notification if requested
        if (sendEmailNotification) {
            try {
                const user = await user_1.User.findById(userObjectId).select('email name');
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
                    await (0, email_service_1.sendEmail)(user.email, emailSubject, emailText, emailHtml);
                    console.log(`Email notification sent to ${user.email}`);
                }
            }
            catch (emailError) {
                console.error('Error sending email notification:', emailError.message);
                // Don't fail the notification creation if email fails
            }
        }
        return {
            success: true,
            notification: notification.toObject(),
            message: 'Notification created and sent successfully',
        };
    }
    catch (error) {
        console.error('Error in createNotification:', error.message);
        return {
            success: false,
            message: error.message || 'Error creating notification',
        };
    }
};
exports.createNotification = createNotification;
const getUserNotifications = async (params) => {
    try {
        const { userId, page = 1, limit = 20 } = params;
        // Validate pagination parameters
        const validPage = Math.max(1, page);
        const validLimit = Math.min(Math.max(1, limit), 100); // Max 100 items per page
        const skip = (validPage - 1) * validLimit;
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        // Get total count
        const total = await notification_modal_1.default.countDocuments({ userId: userObjectId });
        // Get paginated notifications
        const notifications = await notification_modal_1.default.find({ userId: userObjectId })
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
    }
    catch (error) {
        console.error('Error in getUserNotifications:', error.message);
        return {
            success: false,
            message: error.message || 'Error fetching notifications',
        };
    }
};
exports.getUserNotifications = getUserNotifications;
const getUserUnreadNotifications = async (params) => {
    try {
        const { userId, subId } = params;
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        const query = {
            userId: userObjectId,
            isRead: false,
        };
        if (subId) {
            query.subId = subId;
        }
        else {
            query.subId = { $exists: false };
        }
        console.log('Unread notifications query:', query);
        // Get unread notifications
        const notifications = await notification_modal_1.default.find(query).sort({ createdAt: -1 }).lean();
        return {
            success: true,
            notifications,
            total: notifications.length,
        };
    }
    catch (error) {
        console.error('Error in getUserUnreadNotifications:', error.message);
        return {
            success: false,
            message: error.message || 'Error fetching unread notifications',
        };
    }
};
exports.getUserUnreadNotifications = getUserUnreadNotifications;
const readUserNotifications = async (params) => {
    try {
        const { userId, accountId } = params;
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        // Build query based on accountId
        const query = {
            userId: userObjectId,
        };
        if (accountId) {
            query.subId = accountId;
        }
        else {
            query.subId = { $exists: false };
        }
        console.log('Read notifications query:', query);
        // Mark notifications as read based on query
        await notification_modal_1.default.updateMany(query, { $set: { isRead: true } });
        return { success: true };
    }
    catch (error) {
        console.error('Error in readUserNotifications:', error.message);
        return {
            success: false,
            message: error.message || 'Error marking notifications as read',
        };
    }
};
exports.readUserNotifications = readUserNotifications;
const deleteUserNotifications = async (params) => {
    try {
        const { userId } = params;
        // Convert userId to ObjectId if it's a string
        const userObjectId = typeof userId === 'string' ? new mongoose_1.default.Types.ObjectId(userId) : userId;
        // Delete all notifications
        await notification_modal_1.default.deleteMany({ userId: userObjectId });
        return { success: true };
    }
    catch (error) {
        console.error('Error in deleteUserNotifications:', error.message);
        return {
            success: false,
            message: error.message || 'Error deleting notifications',
        };
    }
};
exports.deleteUserNotifications = deleteUserNotifications;
