import Messages from '../message/message.modal';
import { DeliveredMessage, ICreateChat, IGetMessages, IMessageIds, IReactionParams } from './chat.interfaces';
import ChatModel from './chat.modal';
import { IgetMessageResponse } from './../message/message.interfaces';
import { Reaction } from '../reaction';
import { chatQuery } from './chat.queries';
import mongoose from 'mongoose';

export const createChat = async (data: ICreateChat) => {
  const chat = new ChatModel(data);
  await chat.save();
  return chat;
};
export const getChatsByObj = async (objId: string) => {
  return ChatModel.find({ obj: objId }).populate('obj').exec();
};

export const getChatById = async (chatId: string) => {
  return ChatModel.findById(chatId).populate('obj').exec();
};
export const deleteChatById = async (chatId: string) => {
  return ChatModel.findByIdAndDelete(chatId).exec();
};
export const getAllChats = async () => {
  return ChatModel.find().populate('obj').exec();
};

export const updateDeliveredAt = async (params: DeliveredMessage) => {
  try {
    const { chatIds, userId } = params;
    // Update existing entries
    await Messages.updateMany(
      {
        chat: { $in: chatIds },
        sender: { $ne: userId },
        userSettings: {
          $elemMatch: {
            userId: userId,
            $or: [{ deliveredAt: { $exists: false } }, { deliveredAt: null }],
          },
        },
      },
      {
        $set: { 'userSettings.$.deliveredAt': new Date() },
      }
    );

    // Add new entries if none exist
    await Messages.updateMany(
      {
        chat: { $in: chatIds },
        sender: { $ne: userId },
        'userSettings.userId': { $ne: userId },
      },
      {
        $push: {
          userSettings: {
            userId: userId,
            deliveredAt: new Date(),
          },
        },
      }
    );
  } catch (error) {
    console.log(`Got error in [updateDeliveredAt] for userId ${params?.userId} that is ${JSON.stringify(error)}`);
  }
};

export const fetchChatMessages = async (params: IGetMessages) => {
  try {
    const { chatId, userId, page = 1, limit = 20 } = params;
    const skipDocuments = (page - 1) * limit;
    const documentsLimit = limit;
    const messagesQuery = {
      chat: chatId,
      $or: [
        {
          userSettings: {
            $not: {
              $elemMatch: {
                userId,
                deletedAt: { $exists: true },
              },
            },
          },
        },
        { userSettings: { $elemMatch: { userId, deletedAt: null } } },
      ],
    };

    const totalRecords = await Messages.countDocuments(messagesQuery);
    let messages = await Messages.find(messagesQuery)
      .populate('sender', '_id name profilePicture')
      .populate('reply')
      .sort({ createdAt: -1 })
      .skip(skipDocuments)
      .limit(documentsLimit);
    let messagesnew = messages?.map((message: any) => {
      const otherUserSettings = message?.userSettings?.find(
        (setting: { userId: string }) => setting?.userId?.toString?.() !== userId?.toString?.()
      );
      return {
        chatId: message?.chat,
        messageId: message?._id,
        sender: message?.sender,
        content: message?.content,
        contentType: message?.contentType,
        contentTitle: message?.contentTitle,

        contentDescription: message?.contentDescription ?? '',
        contentDescriptionType: message?.contentDescriptionType ?? 'text',

        reactionCounts: message?.reactionsCount,

        isRead: otherUserSettings?.readAt ? true : false,
        isDelivered: otherUserSettings?.deliveredAt ? true : false,
        editedAt: message?.editedAt,
        createdAt: message?.createdAt,

        reply: message?.reply
          ? {
              _id: message?.reply?._id,
              content: message?.reply?.content,
              contentTitle: message?.reply?.contentTitle,
              contentDescription: message?.reply?.contentDescription ?? '',
              contentType: message?.reply?.contentType ?? 'text',
              contentDescriptionType: message?.reply?.contentDescriptionType ?? 'text',
            }
          : null,
      };
    });

    const messageIds = messagesnew?.map((message: { messageId: string }) => message?.messageId);
    updateReadAt({ chatId, userId, messageIds });
    return {
      page: page,
      limit,
      total: totalRecords,
      messages: messagesnew,
    };
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return {
      messages: [],
      pageNo: 1,
      recordsPerPage: 20,
    };
  }
};

export const updateReadAt = async (params: IMessageIds) => {
  try {
    const { chatId, userId, messageIds } = params;
    console.log(`updateReadAt called with params ${JSON.stringify(params)}`);
    // Update existing entries
    const updatedMessagesResponse = await Messages.updateMany(
      {
        _id: { $in: messageIds },
        chat: chatId,
        userSettings: {
          $elemMatch: {
            userId: userId,
            $or: [{ readAt: { $exists: false } }, { readAt: null }],
          },
        },
      },
      {
        $set: { 'userSettings.$.readAt': new Date() },
      }
    );
    console.log(`Got updatedMessagesResponse that is ${JSON.stringify(updatedMessagesResponse)}`);
    // Add new entries if none exist
    const newEntryResponse = await Messages.updateMany(
      {
        _id: { $in: messageIds },
        chat: { $in: chatId },
        'userSettings.userId': { $ne: userId },
      },
      {
        $push: {
          userSettings: {
            userId: userId,
            readAt: new Date(),
            deliveredAt: new Date(),
          },
        },
      }
    );
    console.log(`Got response of updatedMessagesResponse that is ${JSON.stringify(newEntryResponse)}`);
    return {
      success: true,
    };
  } catch (error) {
    console.log(`caught error in updateReadAt that is ${error}`);
    return {
      success: false,
    };
  }
};

export const editMessage = async (params: { messageId: string; userId: string; content: string }) => {
  try {
    console.log(`editMessage util called with params ${JSON.stringify(params)}`);
    const { messageId, userId, content } = params;
    const message: IgetMessageResponse | null = await Messages.findById(messageId).populate('reply').populate('sender');
    if (!message) {
      console.log(`Message with ID ${messageId} not found`);
      return {
        success: false,
        message: `Message with ID ${messageId} not found`,
      };
    }
    if (message?.sender?._id?.toString?.() !== userId?.toString?.()) {
      console.log(`User ${userId} is not the sender of message ${messageId}`);
      return {
        success: false,
        message: `User ${userId} is not the sender of message ${messageId}`,
      };
    }
    message.content = content;
    message.editedAt = new Date();
    await message.save();
    console.log(`Message ${messageId} edited successfully and new data is ${JSON.stringify(message)}`);
    return {
      success: true,
      data: message,
    };
  } catch (error) {
    console.error(`Error editing message: ${error}`);
    return {
      success: false,
    };
  }
};

export const addReaction = async (params: IReactionParams) => {
  try {
    console.log(`addReaction util called with params ${JSON.stringify(params)}`);
    const { messageId, userId, emoji } = params;
    const userExistingReaction = await Reaction.findOne({ messageId: messageId, userId: userId });
    if (userExistingReaction) {
      userExistingReaction.emoji = emoji;
      return userExistingReaction.save();
    }
    const reactionBody = {
      messageId: messageId,
      userId: userId,
      emoji: emoji,
    };
    const reaction = await Reaction.create(reactionBody);
    console.log(`Got reaction create response in DB [add-reaction]: ${JSON.stringify(reaction)}`);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const removeReaction = async (params: { messageId: string; userId: string }) => {
  try {
    console.log(`removeReaction util called with params ${JSON.stringify(params)}`);
    const { messageId, userId } = params;
    const result = await Reaction.deleteOne({ messageId: messageId, userId: userId });
    console.log(`Got response of removeReaction that is ${JSON.stringify(result)}`);
    return {
      success: true,
    };
  } catch (error) {
    console.log(`caught error in removeReaction that is ${error}`);
    return {
      success: false,
    };
  }
};

export const markMessageAsRead = async (params: { chatId: string; userId: string ,chatOf: string }) => {
  try {
    console.log(`markMessageAsRead util called with params ${JSON.stringify(params)}`);
    const { chatId, userId, chatOf } = params;

    // Validate user is part of the chat using aggregation
    const chatDetails = await ChatModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(chatId),
        },
      },
      ...chatQuery(chatOf || 'capa'),
    ]).then((result) => result[0]);

    if (!chatDetails) {
      console.log(`Chat with ID ${chatId} not found.`);
      return {
        success: false,
        message: `Chat with ID ${chatId} not found.`,
      };
    }

    // Check if user is a participant
    const isParticipant = chatDetails?.participants?.some(
      (participant: { _id: string }) => participant?._id?.toString() === userId?.toString()
    );

    if (!isParticipant) {
      console.log(`User ${userId} is not a participant of chat ${chatId}.`);
      return {
        success: false,
        message: `User is not a part of this chat.`,
      };
    }

    const allChatMessages = await Messages.find({ chat: chatId }).distinct('_id');
    const response = await updateReadAt({ chatId, userId, messageIds: allChatMessages });
    if (!response || !response.success) {
      console.log(`Failed to mark messages as read for chat ${chatId} and user ${userId}`);
      return {
        success: false,
        message: `Failed to mark messages as read for chat ${chatId} and user ${userId}`,
      };
    }
    return {
      success: true,
      chatId,
    };
  } catch (error: any) {
    console.error(`Got error in markMessageAsRead for user ${params?.userId}: ${error.message}`);
    return {
      success: false,
      message: `Internal server error. Please try again.`,
    };
  }
};

export const getMessageReactions = async (params: { messageId: string; page?: number; limit?: number }) => {
  try {
    console.log(`getMessageReactions util called with params ${JSON.stringify(params)}`);
    const { messageId, page = 1, limit = 20 } = params;

    // Check if message exists
    const message = await Messages.findById(messageId);
    if (!message) {
      console.log(`Message with ID ${messageId} not found`);
      return {
        success: false,
        message: `Message with ID ${messageId} not found`,
        reactions: [],
        page: 1,
        limit: 20,
        total: 0,
      };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count of reactions
    const totalReactions = await Reaction.countDocuments({ messageId });

    // Get reactions for the message with user details and pagination
    const reactions = await Reaction.find({ messageId })
      .populate('userId', '_id name profilePicture email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Format the response
    const formattedReactions = reactions.map((reaction: any) => ({
      reactionId: reaction._id,
      emoji: reaction.emoji,
      userId: reaction.userId?._id,
      userName: reaction.userId?.name,
      userProfilePicture: reaction.userId?.profilePicture,
      userEmail: reaction.userId?.email,
      createdAt: reaction.createdAt,
    }));

    return {
      success: true,
      messageId,
      page,
      limit,
      total: totalReactions,
      totalPages: Math.ceil(totalReactions / limit),
      reactions: formattedReactions,
    };
  } catch (error: any) {
    console.error(`Got error in getMessageReactions: ${error.message}`);
    return {
      success: false,
      message: `Internal server error. Please try again.`,
      reactions: [],
      page: 1,
      limit: 20,
      total: 0,
    };
  }
};

export const getUserChats = async (params: { userId: string; page?: number; limit?: number; accountId?: string }) => {
  try {
    console.log(`getUserChats util called with params ${JSON.stringify(params)}`);
    const { userId, page = 1, limit = 20, accountId } = params;

    const accountLookupQuery = [
      {
        $lookup: {
          from: 'accounts',
          let: { memberIds: '$members', managerIds: '$managers' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$user', new mongoose.Types.ObjectId(userId)] },
                    { $eq: ['$accountId', new mongoose.Types.ObjectId(accountId)] },
                    {
                      $or: [{ $in: ['$_id', '$$memberIds'] }, { $in: ['$_id', '$$managerIds'] }],
                    },
                  ],
                },
              },
            },
          ],
          as: 'userAccounts',
        },
      },
    ];

    // Reusable pipeline for library lookup (works for both libraries and risklibraries)
    const buildLibraryPipeline = (_collectionName: string, libraryType: string) => [
      {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$_id', '$$objId'] },
              { $eq: ['$isDeleted', false] }
            ]
          },
        },
      },
      ...(accountId ? accountLookupQuery : []),
      {
        $lookup: {
          from: 'workspaces',
          localField: 'workspace',
          foreignField: '_id',
          as: 'workspace',
          pipeline: [
            {
              $lookup: {
                from: 'subscriptions',
                localField: 'moduleId',
                foreignField: '_id',
                as: 'subscription',
                pipeline: [
                  ...(!accountId
                    ? [
                        {
                          $match: {
                            $expr: {
                              $eq: ['$userId', new mongoose.Types.ObjectId(userId)],
                            },
                          },
                        },
                      ]
                    : []),
                ],
              },
            },
            {
              $unwind: {
                path: '$subscription',
                preserveNullAndEmptyArrays: false,
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: '$workspace',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $match: {
          $expr: {
            $or: [
              { $gt: [{ $size: { $ifNull: ['$userAccounts', []] } }, 0] },
              { $eq: ['$workspace.subscription.userId', new mongoose.Types.ObjectId(userId)] },
            ],
          },
        },
      },
      {
        $unwind: {
          path: '$userAccounts',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          name: 1,
          title: 1,
          description: 1,
          status: 1,
          members: 1,
          managers: 1,
          workspace: 1,
          accountId: '$userAccounts._id',
          type: { $literal: libraryType },
        },
      },
    ];

    // Get chats from BOTH libraries and risklibraries using $unionWith
    const userChats = await ChatModel.aggregate([
      // First: Lookup CAPA libraries
      {
        $lookup: {
          from: 'libraries',
          let: { objId: '$obj' },
          pipeline: buildLibraryPipeline('libraries', 'capa'),
          as: 'library',
        },
      },
      { $unwind: { path: '$library', preserveNullAndEmptyArrays: true } },
      // Second: Lookup Risk libraries
      {
        $lookup: {
          from: 'risklibraries',
          let: { objId: '$obj' },
          pipeline: buildLibraryPipeline('risklibraries', 'risk'),
          as: 'riskLibrary',
        },
      },
      { $unwind: { path: '$riskLibrary', preserveNullAndEmptyArrays: true } },
      // Match only chats that have at least one valid (non-deleted) library
      {
        $match: {
          $expr: {
            $or: [
              { $and: [{ $ne: ['$library', null] }, { $ne: [{ $type: '$library' }, 'missing'] }] },
              { $and: [{ $ne: ['$riskLibrary', null] }, { $ne: [{ $type: '$riskLibrary' }, 'missing'] }] },
            ],
          },
        },
      },
      // Lookup last message
      {
        $lookup: {
          from: 'messages',
          let: { chatId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$chat', '$$chatId'] },
              },
            },
            { $sort: { createdAt: -1 } },
            { $limit: 1 },
            {
              $lookup: {
                from: 'users',
                localField: 'sender',
                foreignField: '_id',
                as: 'senderDetails',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      profilePicture: 1,
                    },
                  },
                ],
              },
            },
            {
              $addFields: {
                sender: { $arrayElemAt: ['$senderDetails', 0] },
              },
            },
            {
              $project: {
                content: 1,
                contentType: 1,
                createdAt: 1,
                sender: 1,
              },
            },
          ],
          as: 'lastMessage',
        },
      },
      {
        $addFields: {
          lastMessage: { $arrayElemAt: ['$lastMessage', 0] },
        },
      },
      // Merge library and riskLibrary fields using $ifNull
      {
        $project: {
          _id: 1,
          chatOf: 1,
          obj: 1,
          libraryName: { $ifNull: ['$library.name', '$riskLibrary.name'] },
          workspaceid: { $ifNull: ['$library.workspace._id', '$riskLibrary.workspace._id'] },
          moduleId: { $ifNull: ['$library.workspace.moduleId', '$riskLibrary.workspace.moduleId'] },
          libraryTitle: { $ifNull: ['$library.title', '$riskLibrary.title'] },
          libraryDescription: { $ifNull: ['$library.description', '$riskLibrary.description'] },
          libraryStatus: { $ifNull: ['$library.status', '$riskLibrary.status'] },
          type: { $ifNull: ['$library.type', '$riskLibrary.type'] },
          lastMessage: 1,
          createdAt: 1,
          accountId: { $ifNull: ['$library.accountId', '$riskLibrary.accountId'] },
        },
      },
      { $sort: { 'lastMessage.createdAt': -1, createdAt: -1 } },
    ]);

    // Get unread counts for ALL chats first, then filter
    const chatsWithUnreadCount = await Promise.all(
      userChats.map(async (chat) => {
        const unreadCount = await Messages.countDocuments({
          chat: chat._id,
          sender: { $ne: userId },
          $or: [
            { userSettings: { $exists: false } },
            { userSettings: { $size: 0 } },
            {
              userSettings: {
                $not: {
                  $elemMatch: {
                    userId: new mongoose.Types.ObjectId(userId),
                    readAt: { $exists: true, $ne: null },
                  },
                },
              },
            },
          ],
        });

        const chatType = chat.type || 'capa'; // Fallback to 'capa' if type is missing
        
        return {
          chatId: chat._id,
          chatOf: chat.chatOf,
          libraryName: chat.libraryName || chat.libraryTitle || 'Unknown',
          libraryDescription: chat.libraryDescription,
          libraryStatus: chat.libraryStatus,
          type: chatType,
          unreadCount,
          lastMessage: chat.lastMessage
            ? {
                content: chat.lastMessage.content,
                contentType: chat.lastMessage.contentType,
                createdAt: chat.lastMessage.createdAt,
                sender: chat.lastMessage.sender,
              }
            : null,
          createdAt: chat.createdAt,
          accountId: chat.accountId,
          moduleId: chat.moduleId,
          workspaceid: chat.workspaceid,
          obj: chat.obj,
          link: `/${chatType}/${chat.moduleId}/workspace/${chat.workspaceid}/library/detail/${chat.obj}?fromRecentChats=true`
        };
      })
    );

    // Filter to only include chats with unread messages
    const chatsWithUnreadOnly = chatsWithUnreadCount.filter((chat) => chat.unreadCount > 0);

    // Calculate pagination on chats with unread messages
    const totalChats = chatsWithUnreadOnly.length;
    const skip = (page - 1) * limit;
    const paginatedChats = chatsWithUnreadOnly.slice(skip, skip + limit);

    return {
      success: true,
      page,
      limit,
      total: totalChats,
      totalPages: Math.ceil(totalChats / limit),
      chats: paginatedChats,
    };
  } catch (error: any) {
    console.error(`Got error in getUserChats: ${error.message}`);
    return {
      success: false,
      message: `Internal server error. Please try again.`,
      chats: [],
      page: 1,
      limit: 20,
      total: 0,
    };
  }
};
