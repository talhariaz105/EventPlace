"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatQuery = void 0;
const chatQuery = (type) => [
    {
        $lookup: {
            from: type === 'risk' ? 'risklibraries' : 'libraries',
            let: { objId: '$obj' },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $and: [{ $eq: ['$_id', '$$objId'] }],
                        },
                    },
                },
                {
                    $lookup: {
                        from: 'workspaces',
                        localField: 'workspace',
                        foreignField: '_id',
                        as: 'workspaceDetail',
                        pipeline: [
                            {
                                $lookup: {
                                    from: 'accounts',
                                    localField: '_id',
                                    foreignField: 'Permissions.workspace',
                                    as: 'accountDetails',
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: 'users',
                                                localField: 'user',
                                                foreignField: '_id',
                                                as: 'userDetails',
                                                pipeline: [
                                                    {
                                                        $project: { _id: 1, name: 1, profilePicture: 1, email: 1 },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            $unwind: {
                                                path: '$userDetails',
                                                preserveNullAndEmptyArrays: true,
                                            },
                                        },
                                        {
                                            $project: {
                                                _id: '$userDetails._id',
                                                name: '$userDetails.name',
                                                profilePicture: '$userDetails.profilePicture',
                                                email: '$userDetails.email',
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                $lookup: {
                                    from: 'subscriptions',
                                    localField: 'moduleId',
                                    foreignField: '_id',
                                    as: 'subscription',
                                    pipeline: [
                                        {
                                            $lookup: {
                                                from: 'users',
                                                localField: 'userId',
                                                foreignField: '_id',
                                                as: 'OwnerDetails',
                                                pipeline: [
                                                    {
                                                        $project: { _id: 1, name: 1, profilePicture: 1, email: 1 },
                                                    },
                                                ],
                                            },
                                        },
                                        {
                                            $unwind: {
                                                path: '$OwnerDetails',
                                                preserveNullAndEmptyArrays: true,
                                            },
                                        },
                                    ],
                                },
                            },
                            {
                                $unwind: {
                                    path: '$subscription',
                                    preserveNullAndEmptyArrays: false,
                                },
                            },
                            {
                                $project: { _id: 1, accountDetails: 1, owner: '$subscription.OwnerDetails' },
                            },
                        ],
                    },
                },
                {
                    $unwind: {
                        path: '$workspaceDetail',
                        preserveNullAndEmptyArrays: true,
                    },
                },
            ],
            as: 'Library',
        },
    },
    {
        $unwind: {
            path: '$Library',
            preserveNullAndEmptyArrays: true,
        },
    },
    {
        $project: {
            _id: 1,
            participants: { $setUnion: ['$Library.workspaceDetail.accountDetails', ['$Library.workspaceDetail.owner']] },
            chatType: 1,
            isGroup: 1,
        },
    },
];
exports.chatQuery = chatQuery;
