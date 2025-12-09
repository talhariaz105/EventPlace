"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadJsonDataAsFile = exports.uploadFileFromPathService = exports.uploadSingleFileService = exports.createdownloadAwsObject = exports.createUploadChunk = exports.createcompleteUpload = exports.createpresignedUrl = exports.createInitateUpload = void 0;
const upload_middleware_1 = require("./upload.middleware");
const createInitateUpload = async (body) => {
    const { fileName, filetype } = body;
    // Initiate multipart upload
    const response = await (0, upload_middleware_1.initiateMultipartUpload)(fileName, filetype);
    return response;
};
exports.createInitateUpload = createInitateUpload;
const createpresignedUrl = async (body) => {
    const { fileName, uploadId, numChunks } = body;
    // Generate presigned URLs for each part
    const presignedUrls = [];
    for (let i = 1; i <= numChunks; i++) {
        const url = await (0, upload_middleware_1.createPresignedUrl)(fileName, uploadId, i);
        presignedUrls.push({ partNumber: i, url });
    }
    return { presignedUrls };
};
exports.createpresignedUrl = createpresignedUrl;
const createcompleteUpload = async (body) => {
    const { fileName, uploadId } = body;
    // Complete the multipart upload
    const response = await (0, upload_middleware_1.completeMultipartUpload)(fileName, uploadId);
    return response;
};
exports.createcompleteUpload = createcompleteUpload;
const createUploadChunk = async (body) => {
    const { index, fileName, uploadId, file } = body;
    const response = await (0, upload_middleware_1.uploadPart)(index, fileName, file.buffer, uploadId);
    return response;
};
exports.createUploadChunk = createUploadChunk;
const createdownloadAwsObject = async (keyObject) => {
    const response = await (0, upload_middleware_1.generateDownloadUrl)(keyObject);
    return response;
};
exports.createdownloadAwsObject = createdownloadAwsObject;
/**
 * Upload a single file using base64 content or Buffer (non-multipart)
 * Best for smaller files (< 100MB)
 */
const uploadSingleFileService = async (body) => {
    try {
        const { fileName, fileContent, contentType, isBase64 = true } = body;
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        const response = await (0, upload_middleware_1.uploadSingleFile)(uniqueFileName, fileContent, contentType, isBase64);
        return {
            ...response,
            message: 'File uploaded successfully',
            success: true
        };
    }
    catch (error) {
        console.error('Error in uploadSingleFileService:', error);
        throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.uploadSingleFileService = uploadSingleFileService;
/**
 * Upload file from local file system path
 * Useful for backend file processing
 */
const uploadFileFromPathService = async (body) => {
    try {
        const { filePath, fileName, contentType } = body;
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        const response = await (0, upload_middleware_1.uploadFileFromPath)(filePath, uniqueFileName, contentType);
        return {
            ...response,
            message: 'File uploaded successfully from path',
            success: true
        };
    }
    catch (error) {
        console.error('Error in uploadFileFromPathService:', error);
        throw new Error(`File upload from path failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.uploadFileFromPathService = uploadFileFromPathService;
/**
 * Upload JSON data as a file
 */
const uploadJsonDataAsFile = async (data, fileName) => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const buffer = Buffer.from(jsonString, 'utf-8');
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}.json`;
        const response = await (0, upload_middleware_1.uploadSingleFile)(uniqueFileName, buffer, 'application/json', false);
        return {
            ...response,
            message: 'JSON data uploaded successfully',
            success: true
        };
    }
    catch (error) {
        console.error('Error in uploadJsonDataAsFile:', error);
        throw new Error(`JSON upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};
exports.uploadJsonDataAsFile = uploadJsonDataAsFile;
