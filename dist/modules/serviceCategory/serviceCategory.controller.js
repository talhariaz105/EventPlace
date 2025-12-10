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
exports.deleteServiceCategory = exports.updateServiceCategory = exports.getServiceCategory = exports.getAllCategories = exports.getServiceCategories = exports.createServiceCategory = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const pick_1 = __importDefault(require("../utils/pick"));
const serviceCategoryService = __importStar(require("./serviceCategory.service"));
const upload_middleware_1 = require("../upload/upload.middleware");
exports.createServiceCategory = (0, catchAsync_1.default)(async (req, res) => {
    const serviceCategory = await serviceCategoryService.createServiceCategory(req.body);
    res.status(http_status_1.default.CREATED).send({
        status: "success",
        data: serviceCategory,
    });
});
exports.getServiceCategories = (0, catchAsync_1.default)(async (req, res) => {
    const filter = (0, pick_1.default)(req.query, ["name"]);
    const options = (0, pick_1.default)(req.query, [
        "sortBy",
        "limit",
        "page",
        "projectBy",
    ]);
    const result = await serviceCategoryService.queryServiceCategories(filter, options);
    res.send(result);
});
exports.getAllCategories = (0, catchAsync_1.default)(async (_req, res) => {
    const categories = await serviceCategoryService.getAllCategories();
    res.status(http_status_1.default.OK).send({
        status: "success",
        results: categories.length,
        data: categories,
    });
});
exports.getServiceCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
        const serviceCategory = await serviceCategoryService.getServiceCategoryById(new mongoose_1.default.Types.ObjectId(req.params["serviceCategoryId"]));
        if (!serviceCategory) {
            throw new ApiError_1.default("Service category not found", http_status_1.default.NOT_FOUND);
        }
        res.send({
            status: "success",
            data: serviceCategory,
        });
    }
});
exports.updateServiceCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
        const serviceCategory = await serviceCategoryService.updateServiceCategoryById(new mongoose_1.default.Types.ObjectId(req.params["serviceCategoryId"]), req.body, upload_middleware_1.deleteMedia);
        res.send({
            status: "success",
            data: serviceCategory,
        });
    }
});
exports.deleteServiceCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
        await serviceCategoryService.deleteServiceCategoryById(new mongoose_1.default.Types.ObjectId(req.params["serviceCategoryId"]));
        res.status(http_status_1.default.OK).send({
            status: "success",
            data: null,
        });
    }
});
