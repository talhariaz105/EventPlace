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
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadJsonData = exports.uploadFromPath = exports.uploadSingleFile = exports.downloadAwsObject = exports.uploadChunk = exports.completeUpload = exports.generatePresignedUrl = exports.initateUpload = void 0;
const utils_1 = require("../utils");
const uploadService = __importStar(require("./upload.service"));
exports.initateUpload = (0, utils_1.catchAsync)(async (req, res) => {
    const response = await uploadService.createInitateUpload(req.body);
    res.status(200).json(response);
});
exports.generatePresignedUrl = (0, utils_1.catchAsync)(async (req, res) => {
    const response = await uploadService.createpresignedUrl(req.body);
    res.status(200).json(response);
});
exports.completeUpload = (0, utils_1.catchAsync)(async (req, res) => {
    const response = await uploadService.createcompleteUpload(req.body);
    res.status(200).json(response);
});
exports.uploadChunk = (0, utils_1.catchAsync)(async (req, res) => {
    const { uploadId } = req.query;
    const response = await uploadService.createUploadChunk({ ...req.body, file: req.file, uploadId: uploadId });
    res.status(200).json(response);
});
exports.downloadAwsObject = (0, utils_1.catchAsync)(async (req, res) => {
    const { key } = req.query;
    const response = await uploadService.createdownloadAwsObject(key);
    res.status(200).json(response);
});
/**
 * Upload single file using base64 or raw data (non-multipart)
 */
exports.uploadSingleFile = (0, utils_1.catchAsync)(async (req, res) => {
    const response = await uploadService.uploadSingleFileService(req.body);
    res.status(201).json(response);
});
/**
 * Upload file from file system path
 */
exports.uploadFromPath = (0, utils_1.catchAsync)(async (req, res) => {
    const response = await uploadService.uploadFileFromPathService(req.body);
    res.status(201).json(response);
});
/**
 * Upload JSON data as file
 */
exports.uploadJsonData = (0, utils_1.catchAsync)(async (req, res) => {
    const { data, fileName } = req.body;
    if (!data || !fileName) {
        res.status(400).json({
            success: false,
            message: 'Data and fileName are required'
        });
        return;
    }
    const response = await uploadService.uploadJsonDataAsFile(data, fileName);
    res.status(201).json(response);
});
