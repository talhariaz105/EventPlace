# Notification Module

A complete notification system for the QMS application with real-time socket delivery, optional email notifications, pagination, and helper utilities.

## Features

- ✅ Real-time notification delivery via Socket.IO
- ✅ **Optional email notifications** 📧
- ✅ Create and send notifications to users
- ✅ Paginated notification retrieval
- ✅ Unread notification tracking
- ✅ Mark all notifications as read
- ✅ Multiple notification types (message, booking, review, etc.)
- ✅ Helper functions and templates for common notifications
- ✅ TypeScript support with full type safety
- ✅ Optimized database queries with indexes

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Email Notifications](#email-notifications)
- [Socket Events](#socket-events)
- [Helper Functions](#helper-functions)
- [Notification Templates](#notification-templates)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)

## Installation

The notification module is already integrated into the QMS application. No additional installation is required.

## Quick Start

### Server-Side: Send a Notification

```typescript
import { sendNotificationToUser, NotificationTypes } from '@/modules/notification';

// Send a notification (socket only)
await sendNotificationToUser({
  userId: 'user_id_123',
  title: 'New Message',
  message: 'You have a new message from John',
  type: NotificationTypes.MESSAGE
});

// Send a notification with email
await sendNotificationToUser({
  userId: 'user_id_123',
  title: 'Important Update',
  message: 'Please review the new policy document',
  type: NotificationTypes.USER,
  sendEmailNotification: true  // 📧 Sends email too!
});
```

### Client-Side: Listen for Notifications

```javascript
import { io } from 'socket.io-client';

const socket = io('http://your-server-url', {
  auth: { token: 'your-jwt-token' }
});

// Listen for new notifications in real-time
socket.on('new-notification', (data) => {
  if (data.success) {
    console.log('New notification:', data.notification);
    // Show notification to user
  }
});

// Get all notifications
socket.emit('get-user-notifications', { page: 1, limit: 20 });

socket.on('user-notifications', (response) => {
  if (response.success) {
    console.log('Notifications:', response.notifications);
  }
});
```

## Email Notifications

The notification system supports optional email notifications alongside real-time socket delivery. When enabled, users receive both a real-time notification and an email.

### How It Works

1. **Automatic Email Sending**: When `sendEmailNotification: true` is passed, the system:
   - Creates the notification in the database
   - Sends real-time socket notification (if user is online)
   - Fetches user's email from the database
   - Sends a formatted HTML email

2. **Email Format**: The email includes:
   - Personalized greeting with user's name
   - The notification message
   - A link to view all notifications
   - Professional HTML formatting

### Enable Email Notifications

```typescript
import { sendNotificationToUser, NotificationTypes } from '@/modules/notification';

// Send notification with email
await sendNotificationToUser({
  userId: 'user_id_123',
  title: 'Important: Action Required',
  message: 'Please complete your profile verification by tomorrow',
  type: NotificationTypes.USER,
  sendEmailNotification: true  // 📧 Enable email
});
```

### Email for Multiple Users

```typescript
import { sendNotificationToMultipleUsers, NotificationTypes } from '@/modules/notification';

// Send to multiple users with email
await sendNotificationToMultipleUsers(
  ['user_id_1', 'user_id_2', 'user_id_3'],
  'Team Meeting',
  'Team meeting scheduled for tomorrow at 10 AM',
  NotificationTypes.USER,
  undefined,  // accountId
  true        // sendEmailNotification
);
```

### Email for Mentions

**Mentions automatically send emails!** When a user is mentioned in a chat message, they receive both a real-time notification and an email notification.

```javascript
// Client sends message with mentions
socket.emit('send-message', {
  chatId: 'chat_123',
  content: 'Hey @user123, please check this document',
  mentionUsers: ['account_id_123'], // Array of account IDs
  contentType: 'text'
});

// user123 receives:
// 1. Real-time socket notification
// 2. Email notification (automatic)
```

### Email Customization

The email template includes:
- **Subject**: The notification title
- **Body**: Personalized message with user's name
- **CTA Button**: Link to view notifications in the app
- **Footer**: Professional team signature

Example email received:
```
Subject: You were mentioned

Hi John Doe,

Someone mentioned you: Hey @user123, please check this document

You can view all your notifications by logging into your account.

[View Notifications Button]

If you did not expect this notification, please ignore this email.

Regards,
Team
```

### Error Handling

Email sending is **non-blocking**. If email delivery fails:
- The notification is still created in the database
- Socket notification is still sent
- Error is logged but doesn't affect the main flow
- User can still see the notification when they log in

```typescript
// Email failure won't break notification creation
const result = await sendNotificationToUser({
  userId: 'user_id',
  title: 'Test',
  message: 'Testing',
  type: NotificationTypes.MESSAGE,
  sendEmailNotification: true
});

// result.success will still be true even if email fails
console.log(result.success); // true
```

## Socket Events

### 1. `send-notification`

Send a notification to a specific user.

**Emit:**
```javascript
socket.emit('send-notification', {
  userId: 'target_user_id',
  title: 'Notification Title',
  message: 'Notification message',
  type: 'message', // serviceListing, booking, user, review, message, payout
  accountId: 'optional_account_id',
  sendEmail: true  // Optional: send email notification (default: false)
});
```

**Response:** `notification-sent-response`

### 2. `get-user-notifications`

Get paginated notifications for the authenticated user.

**Emit:**
```javascript
socket.emit('get-user-notifications', { page: 1, limit: 20 });
```

**Response:** `user-notifications`

### 3. `get-user-unread-notifications`

Get only unread notifications.

**Emit:**
```javascript
socket.emit('get-user-unread-notifications');
```

**Response:** `user-unread-notifications`

### 4. `read-user-notifications`

Mark all notifications as read.

**Emit:**
```javascript
socket.emit('read-user-notifications');
```

**Response:** `notifications-read-response`

### 5. `new-notification` (Listener)

Real-time event when a new notification is received.

**Listen:**
```javascript
socket.on('new-notification', (data) => {
  // Handle new notification
});
```

## Helper Functions

### `sendNotificationToUser(params)`

Send a notification to a single user.

```typescript
import { sendNotificationToUser, NotificationTypes } from '@/modules/notification';

await sendNotificationToUser({
  userId: 'user_id_123',
  title: 'New Message',
  message: 'You have a new message',
  type: NotificationTypes.MESSAGE
});
```

### `sendNotificationToMultipleUsers(userIds, title, message, type, accountId?)`

Send the same notification to multiple users.

```typescript
import { sendNotificationToMultipleUsers, NotificationTypes } from '@/modules/notification';

await sendNotificationToMultipleUsers(
  ['user_id_1', 'user_id_2', 'user_id_3'],
  'Team Update',
  'New task assigned to your team',
  NotificationTypes.USER
);
```

## Notification Templates

Pre-configured templates for common notification scenarios:

```typescript
import { 
  sendNotificationToUser, 
  NotificationTemplates 
} from '@/modules/notification';

// New message notification
await sendNotificationToUser({
  userId: 'user_id',
  ...NotificationTemplates.newMessage('John Doe')
});

// New booking notification
await sendNotificationToUser({
  userId: 'user_id',
  ...NotificationTemplates.newBooking('Room Cleaning Service')
});

// Booking confirmed
await sendNotificationToUser({
  userId: 'user_id',
  ...NotificationTemplates.bookingConfirmed('Room Cleaning Service')
});

// New review
await sendNotificationToUser({
  userId: 'user_id',
  ...NotificationTemplates.newReview(5)
});

// Payout processed
await sendNotificationToUser({
  userId: 'user_id',
  ...NotificationTemplates.payoutProcessed(150.00, 'USD')
});

// Account update
await sendNotificationToUser({
  userId: 'user_id',
  ...NotificationTemplates.accountUpdate('profile')
});
```

## Usage Examples

### Example 1: Send Notification After New Message

```typescript
// In your chat service
import { sendNotificationToUser, NotificationTemplates } from '@/modules/notification';

async function sendChatMessage(senderId: string, recipientId: string, message: string) {
  // Save message to database
  await saveMessage(senderId, recipientId, message);
  
  // Get sender name
  const sender = await User.findById(senderId);
  
  // Send notification to recipient
  await sendNotificationToUser({
    userId: recipientId,
    ...NotificationTemplates.newMessage(sender.name)
  });
}
```

### Example 2: Send Notification to Team Members

```typescript
import { sendNotificationToMultipleUsers, NotificationTypes } from '@/modules/notification';

async function notifyTeamMembers(teamId: string, title: string, message: string) {
  // Get all team member IDs
  const team = await Team.findById(teamId).populate('members');
  const memberIds = team.members.map(member => member._id.toString());
  
  // Send notification to all members
  await sendNotificationToMultipleUsers(
    memberIds,
    title,
    message,
    NotificationTypes.USER
  );
}
```

### Example 3: Client-Side Notification Handler

```typescript
// React/Vue/Angular component
class NotificationManager {
  constructor(socket) {
    this.socket = socket;
    this.unreadCount = 0;
    this.setupListeners();
  }

  setupListeners() {
    // Real-time notification
    this.socket.on('new-notification', (data) => {
      if (data.success) {
        this.showToast(data.notification);
        this.updateUnreadCount();
      }
    });

    // Unread count update
    this.socket.on('user-unread-notifications', (response) => {
      if (response.success) {
        this.unreadCount = response.total;
        this.updateBadge(this.unreadCount);
      }
    });
  }

  showToast(notification) {
    // Show toast notification in UI
    console.log(`${notification.title}: ${notification.message}`);
  }

  updateUnreadCount() {
    this.socket.emit('get-user-unread-notifications');
  }

  updateBadge(count) {
    // Update notification badge in UI
    document.getElementById('notification-badge').textContent = count;
  }

  markAllAsRead() {
    this.socket.emit('read-user-notifications');
  }

  getNotifications(page = 1) {
    this.socket.emit('get-user-notifications', { page, limit: 20 });
  }
}
```

## API Reference

### Notification Types

```typescript
type NotificationType = 
  | 'serviceListing' 
  | 'booking' 
  | 'user' 
  | 'review' 
  | 'message' 
  | 'payout';
```

### Notification Schema

```typescript
interface INotification {
  _id: ObjectId;
  userId: ObjectId;              // Recipient user ID
  accountId?: ObjectId;          // Optional account ID
  title: string;                 // Notification title
  message: string;               // Notification message
  type: NotificationType;        // Type of notification
  isRead: boolean;               // Read status (default: false)
  isDelivered: boolean;          // Delivery status (default: false)
  createdAt: Date;               // Creation timestamp
}
```

### Service Functions

#### `createNotification(params: ICreateNotificationParams)`

Creates a notification and delivers it via socket if user is connected.

**Parameters:**
- `userId` (string | ObjectId) - Target user ID
- `title` (string) - Notification title
- `message` (string) - Notification message
- `type` (NotificationType) - Type of notification
- `accountId?` (string | ObjectId) - Optional account ID

**Returns:** `Promise<INotificationResponse>`

#### `getUserNotifications(params: IGetUserNotificationsParams)`

Get paginated notifications for a user.

**Parameters:**
- `userId` (string | ObjectId) - User ID
- `page?` (number) - Page number (default: 1)
- `limit?` (number) - Items per page (default: 20, max: 100)

**Returns:** `Promise<INotificationResponse>`

#### `getUserUnreadNotifications(params: IGetUserUnreadNotificationsParams)`

Get unread notifications for a user.

**Parameters:**
- `userId` (string | ObjectId) - User ID

**Returns:** `Promise<INotificationResponse>`

#### `readUserNotifications(params: IReadUserNotificationsParams)`

Mark all user notifications as read.

**Parameters:**
- `userId` (string | ObjectId) - User ID

**Returns:** `Promise<{ success: boolean; message?: string }>`

## Database Indexes

The notification collection has the following indexes for optimal performance:

```typescript
- { userId: 1, createdAt: -1 }  // Get user notifications sorted by date
- { userId: 1, isRead: 1 }      // Filter unread notifications
```

## Best Practices

1. **Use Templates**: Use `NotificationTemplates` for consistency
2. **Batch Notifications**: Use `sendNotificationToMultipleUsers` for multiple recipients
3. **Error Handling**: Always handle errors from notification functions
4. **Real-time Updates**: Listen to `new-notification` event on client
5. **Pagination**: Use pagination for notification lists to avoid loading too much data
6. **Mark as Read**: Implement mark as read functionality to keep notifications organized

## Testing

```typescript
// Example test
import { sendNotificationToUser, NotificationTypes } from '@/modules/notification';

describe('Notification Service', () => {
  it('should send a notification to user', async () => {
    const result = await sendNotificationToUser({
      userId: 'test_user_id',
      title: 'Test Notification',
      message: 'This is a test',
      type: NotificationTypes.USER
    });

    expect(result.success).toBe(true);
    expect(result.notification).toBeDefined();
  });
});
```

## Troubleshooting

### Notifications not being delivered in real-time

1. Check if user is connected to socket
2. Verify JWT token is valid
3. Check if user has joined their room (userId room)
4. Check server logs for socket errors

### Notifications not saving to database

1. Check MongoDB connection
2. Verify notification schema fields
3. Check for validation errors in logs

## Future Enhancements

- [ ] Individual notification read/unread toggle
- [ ] Delete specific notifications
- [ ] Filter notifications by type
- [ ] Notification preferences per user
- [ ] Email notifications for unread items
- [ ] Push notifications for mobile apps
- [ ] Notification expiry/auto-cleanup

## Support

For issues or questions, please contact the development team or create an issue in the repository.
