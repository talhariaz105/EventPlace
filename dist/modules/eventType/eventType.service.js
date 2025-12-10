"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNamesForDropdown = exports.deleteEventTypeById = exports.updateEventTypeById = exports.getEventTypeById = exports.getEventTypes = exports.queryEventTypes = exports.createEventType = void 0;
const http_status_1 = __importDefault(require("http-status"));
const eventType_model_1 = __importDefault(require("./eventType.model"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
/**
 * Create an event type
 * @param {NewEventType} eventTypeBody
 * @returns {Promise<IEventTypeDoc>}
 */
const createEventType = async (eventTypeBody) => {
    const eventType = await eventType_model_1.default.create(eventTypeBody);
    return eventType;
};
exports.createEventType = createEventType;
/**
 * Query for event types
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @returns {Promise<QueryResult>}
 */
const queryEventTypes = async (filter, options) => {
    const eventTypes = await eventType_model_1.default.paginate(filter, options);
    return eventTypes;
};
exports.queryEventTypes = queryEventTypes;
/**
 * Get all event types with pagination and search
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object>}
 */
const getEventTypes = async (queryParams) => {
    const { page = 1, limit = 10, search = "" } = queryParams;
    const skip = (page - 1) * limit;
    // Build match stage for search
    const matchStage = {};
    if (search) {
        matchStage.$or = [{ name: { $regex: search, $options: "i" } }];
    }
    const pipeline = [
        { $match: matchStage },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                data: [
                    { $skip: parseInt(skip.toString()) },
                    { $limit: parseInt(limit.toString()) },
                ],
                totalCount: [{ $count: "count" }],
            },
        },
    ];
    const result = await eventType_model_1.default.aggregate(pipeline);
    const eventTypes = result[0].data;
    const totalResults = result[0].totalCount[0]?.count || 0;
    return {
        eventTypes,
        totalResults,
        currentPage: parseInt(page.toString()),
        totalPages: Math.ceil(totalResults / limit),
    };
};
exports.getEventTypes = getEventTypes;
/**
 * Get event type by id
 * @param {mongoose.Types.ObjectId} id
 * @returns {Promise<IEventTypeDoc | null>}
 */
const getEventTypeById = async (id) => {
    return eventType_model_1.default.findById(id);
};
exports.getEventTypeById = getEventTypeById;
/**
 * Update event type by id
 * @param {mongoose.Types.ObjectId} eventTypeId
 * @param {UpdateEventTypeBody} updateBody
 * @returns {Promise<IEventTypeDoc | null>}
 */
const updateEventTypeById = async (eventTypeId, updateBody) => {
    const eventType = await (0, exports.getEventTypeById)(eventTypeId);
    if (!eventType) {
        throw new ApiError_1.default("Event type not found", http_status_1.default.NOT_FOUND);
    }
    Object.assign(eventType, updateBody);
    await eventType.save();
    return eventType;
};
exports.updateEventTypeById = updateEventTypeById;
/**
 * Delete event type by id
 * @param {mongoose.Types.ObjectId} eventTypeId
 * @returns {Promise<IEventTypeDoc | null>}
 */
const deleteEventTypeById = async (eventTypeId) => {
    const eventType = await (0, exports.getEventTypeById)(eventTypeId);
    if (!eventType) {
        throw new ApiError_1.default("Event type not found", http_status_1.default.NOT_FOUND);
    }
    await eventType.deleteOne();
    return eventType;
};
exports.deleteEventTypeById = deleteEventTypeById;
/**
 * Get event type names for dropdown
 * @returns {Promise<Array<{_id: mongoose.Types.ObjectId, name: string}>>}
 */
const getNamesForDropdown = async () => {
    const eventTypes = await eventType_model_1.default.find().select("name");
    return eventTypes;
};
exports.getNamesForDropdown = getNamesForDropdown;
