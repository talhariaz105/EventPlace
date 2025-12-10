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
exports.deleteAmenities = exports.updateAmenities = exports.getNamesForDropdown = exports.getAmenitiesById = exports.getAmenities = exports.createAmenities = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const pick_1 = __importDefault(require("../utils/pick"));
const amenitiesService = __importStar(require("./amenities.service"));
exports.createAmenities = (0, catchAsync_1.default)(async (req, res) => {
    const amenities = await amenitiesService.createAmenities(req.body);
    res.status(http_status_1.default.CREATED).send(amenities);
});
exports.getAmenities = (0, catchAsync_1.default)(async (req, res) => {
    const filter = (0, pick_1.default)(req.query, ["name", "isDeleted"]);
    const options = (0, pick_1.default)(req.query, ["sortBy", "limit", "page", "projectBy"]);
    const result = await amenitiesService.queryAmenities(filter, options);
    res.send(result);
});
exports.getAmenitiesById = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["amenitiesId"] === "string") {
        const amenities = await amenitiesService.getAmenitiesById(new mongoose_1.default.Types.ObjectId(req.params["amenitiesId"]));
        if (!amenities) {
            throw new ApiError_1.default("Amenities not found", http_status_1.default.NOT_FOUND);
        }
        res.send(amenities);
    }
});
exports.getNamesForDropdown = (0, catchAsync_1.default)(async (_req, res) => {
    const amenities = await amenitiesService.getNamesForDropdown();
    res.send(amenities);
});
exports.updateAmenities = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["amenitiesId"] === "string") {
        const amenities = await amenitiesService.updateAmenitiesById(new mongoose_1.default.Types.ObjectId(req.params["amenitiesId"]), req.body);
        res.send(amenities);
    }
});
exports.deleteAmenities = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["amenitiesId"] === "string") {
        await amenitiesService.deleteAmenitiesById(new mongoose_1.default.Types.ObjectId(req.params["amenitiesId"]));
        res.status(http_status_1.default.NO_CONTENT).send();
    }
});
