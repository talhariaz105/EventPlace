"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../../modules/validate");
const upload_1 = require("../../modules/upload");
const express_1 = __importDefault(require("express"));
// import { auth } from "../../modules/auth
const router = express_1.default.Router();
router
    .route('/initiate-upload')
    .post((0, validate_1.validate)(upload_1.uploadValidation.initiateUploadSchema), upload_1.uploadController.initateUpload);
router.post('/generate-presigned-url', (0, validate_1.validate)(upload_1.uploadValidation.generatePresignedUrlSchema), upload_1.uploadController.generatePresignedUrl);
router.post('/complete-upload', (0, validate_1.validate)(upload_1.uploadValidation.completeUploadSchema), upload_1.uploadController.completeUpload);
// New non-multipart upload routes
router
    .route('/single-file')
    .post((0, validate_1.validate)(upload_1.uploadValidation.singleFileUploadSchema), upload_1.uploadController.uploadSingleFile);
router
    .route('/from-path')
    .post((0, validate_1.validate)(upload_1.uploadValidation.filePathUploadSchema), upload_1.uploadController.uploadFromPath);
router
    .route('/json-data')
    .post((0, validate_1.validate)(upload_1.uploadValidation.jsonDataUploadSchema), upload_1.uploadController.uploadJsonData);
// Download route
router
    .route('/download')
    .get(upload_1.uploadController.downloadAwsObject);
exports.default = router;
