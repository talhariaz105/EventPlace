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
exports.deleteSubCategory = exports.updateSubCategory = exports.getSubCategory = exports.getSubCategoriesByServiceCategory = exports.getSubCategories = exports.createSubCategory = void 0;
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = __importDefault(require("mongoose"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const pick_1 = __importDefault(require("../utils/pick"));
const subCategoryService = __importStar(require("./subCategory.service"));
exports.createSubCategory = (0, catchAsync_1.default)(async (req, res) => {
    const subCategory = await subCategoryService.createSubCategory(req.body);
    res.status(http_status_1.default.CREATED).send({
        status: "success",
        data: subCategory,
    });
});
exports.getSubCategories = (0, catchAsync_1.default)(async (req, res) => {
    const filter = (0, pick_1.default)(req.query, ["name", "serviceCategory", "isDeleted"]);
    const options = (0, pick_1.default)(req.query, [
        "sortBy",
        "limit",
        "page",
        "projectBy",
    ]);
    const result = await subCategoryService.querySubCategories(filter, options);
    res.send(result);
});
exports.getSubCategoriesByServiceCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["serviceCategoryId"] === "string") {
        const isDeleted = req.query["isDeleted"] === "true";
        const subCategories = await subCategoryService.getSubCategoriesByServiceCategoryId(new mongoose_1.default.Types.ObjectId(req.params["serviceCategoryId"]), isDeleted);
        res.status(http_status_1.default.OK).send({
            status: "success",
            results: subCategories.length,
            data: subCategories,
        });
    }
});
exports.getSubCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["subCategoryId"] === "string") {
        const subCategory = await subCategoryService.getSubCategoryById(new mongoose_1.default.Types.ObjectId(req.params["subCategoryId"]));
        if (!subCategory) {
            throw new ApiError_1.default("Sub category not found", http_status_1.default.NOT_FOUND);
        }
        res.send({
            status: "success",
            data: subCategory,
        });
    }
});
exports.updateSubCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["subCategoryId"] === "string") {
        const subCategory = await subCategoryService.updateSubCategoryById(new mongoose_1.default.Types.ObjectId(req.params["subCategoryId"]), req.body);
        res.send({
            status: "success",
            data: subCategory,
        });
    }
});
exports.deleteSubCategory = (0, catchAsync_1.default)(async (req, res) => {
    if (typeof req.params["subCategoryId"] === "string") {
        const subCategory = await subCategoryService.deleteSubCategoryById(new mongoose_1.default.Types.ObjectId(req.params["subCategoryId"]));
        res.status(http_status_1.default.OK).send({
            status: "success",
            data: subCategory,
        });
    }
});
