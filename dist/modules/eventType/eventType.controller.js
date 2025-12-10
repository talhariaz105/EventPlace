"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNamesForDropdown = exports.deleteEventType = exports.updateEventType = exports.getEventType = exports.getAllEventTypes = exports.getEventTypes = exports.createEventType = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const pick_1 = __importDefault(require("../utils/pick"));
const eventTypeService = __importStar(require("./eventType.service"));
exports.createEventType = (0, catchAsync_1.default)(async (req, res) => {
    const eventType = await eventTypeService.createEventType(req.body);
    res.status(http_status_1.default.CREATED).send({
        status: "success",
        data: {
            eventType,
        },
    });
});
exports.getEventTypes = (0, catchAsync_1.default)(async (req, res) => {
    const filter = (0, pick_1.default)(req.query, ["name"]);
    const options = (0, pick_1.default)(req.query, [
        "sortBy",
        "limit",
        "page",
        "projectBy",
    ]);
    const result = await eventTypeService.queryEventTypes(filter, options);
    res.send(result);
});
exports.getAllEventTypes = (0, catchAsync_1.default)(async (req, res) => {
    const { page, limit, search } = req.query;
    const queryParams = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        search: search,
    };
    const data = await eventTypeService.getEventTypes(queryParams);
    res.status(http_status_1.default.OK).send({
        status: "success",
        results: data.eventTypes.length,
        totalResults: data.totalResults,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        data: {
            eventTypes: data.eventTypes,
        },
    });
});
exports.getEventType = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["eventTypeId"] === "string") {
        const eventType = await eventTypeService.getEventTypeById(new mongoose_1.default.Types.ObjectId(req.params["eventTypeId"]));
        if (!eventType) {
            throw new ApiError_1.default("Event type not found", http_status_1.default.NOT_FOUND);
        }
        res.send({
            status: "success",
            data: {
                eventType,
            },
        });
    }
});
exports.updateEventType = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["eventTypeId"] === "string") {
        const eventType = await eventTypeService.updateEventTypeById(new mongoose_1.default.Types.ObjectId(req.params["eventTypeId"]), req.body);
        res.send({
            status: "success",
            data: {
                eventType,
            },
        });
    }
});
exports.deleteEventType = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["eventTypeId"] === "string") {
        await eventTypeService.deleteEventTypeById(new mongoose_1.default.Types.ObjectId(req.params["eventTypeId"]));
        res.status(http_status_1.default.NO_CONTENT).send();
    }
});
exports.getNamesForDropdown = (0, catchAsync_1.default)(async (_req, res) => {
    const eventTypes = await eventTypeService.getNamesForDropdown();
    res.status(http_status_1.default.OK).send({
        status: "success",
        data: {
            eventTypes,
        },
    });
});
