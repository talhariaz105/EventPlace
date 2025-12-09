"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileFromPath = exports.uploadSingleFile = exports.deleteMedia = exports.generateDownloadUrl = exports.completeMultipartUpload = exports.uploadPart = exports.createPresignedUrl = exports.initiateMultipartUpload = void 0;
require("dotenv/config");
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const validateEnvVars = () => {
    const requiredVars = {
        REGION: process.env['REGION'],
        AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'],
        AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'],
        AWS_STORAGE_BUCKET_NAME: process.env['AWS_STORAGE_BUCKET_NAME']
    };
    for (const [key, value] of Object.entries(requiredVars)) {
        if (!value) {
            throw new Error(`Missing required environment variable: ${key}`);
        }
    }
    return {
        REGION: requiredVars.REGION,
        AWS_ACCESS_KEY_ID: requiredVars.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: requiredVars.AWS_SECRET_ACCESS_KEY,
        AWS_STORAGE_BUCKET_NAME: requiredVars.AWS_STORAGE_BUCKET_NAME
    };
};
const envVars = validateEnvVars();
const s3Client = new client_s3_1.S3Client({
    region: envVars.REGION,
    credentials: {
        accessKeyId: envVars.AWS_ACCESS_KEY_ID,
        secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
    }
});
const bucketName = envVars.AWS_STORAGE_BUCKET_NAME;
const initiateMultipartUpload = async (fileName, fileType) => {
    const command = new client_s3_1.CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: fileName,
        ContentType: fileType,
        ACL: 'public-read'
    });
    const response = await s3Client.send(command);
    return { uploadId: response.UploadId };
};
exports.initiateMultipartUpload = initiateMultipartUpload;
const createPresignedUrl = async (fileName, uploadId, partNumber) => {
    const command = new client_s3_1.UploadPartCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: partNumber
    });
    try {
        const url = await (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
        return url;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
exports.createPresignedUrl = createPresignedUrl;
/**
 * Upload part to S3
 */
const uploadPart = async (index, fileName, fileBuffer, uploadId) => {
    const command = new client_s3_1.UploadPartCommand({
        Bucket: bucketName,
        Key: fileName,
        UploadId: uploadId,
        PartNumber: Number(index) + 1,
        Body: fileBuffer
    });
    return s3Client.send(command);
};
exports.uploadPart = uploadPart;
const completeMultipartUpload = async (filename, uploadId) => {
    console.log('aya ma complete upload');
    const command = new client_s3_1.ListPartsCommand({
        Bucket: bucketName,
        Key: filename,
        UploadId: uploadId
    });
    try {
        const data = await s3Client.send(command);
        console.log(data);
        if (!data) {
            throw new Error('data not provided for completing multipart upload.');
        }
        const parts = data?.Parts?.map((part) => ({
            ETag: part.ETag,
            PartNumber: part.PartNumber
        }));
        if (!parts || parts.length === 0) {
            throw new Error('No parts provided for completing multipart upload.');
        }
        const completeCommand = new client_s3_1.CompleteMultipartUploadCommand({
            Bucket: bucketName,
            Key: filename,
            UploadId: uploadId,
            MultipartUpload: { Parts: parts }
        });
        const response = await s3Client.send(completeCommand);
        return response;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
exports.completeMultipartUpload = completeMultipartUpload;
const generateDownloadUrl = async (key) => {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: bucketName,
        Key: key
    });
    return (0, s3_request_presigner_1.getSignedUrl)(s3Client, command, { expiresIn: 3600 });
};
exports.generateDownloadUrl = generateDownloadUrl;
const deleteMedia = async (key) => {
    try {
        const command = new client_s3_1.DeleteObjectCommand({
            Bucket: bucketName,
            Key: key
        });
        const response = await s3Client.send(command);
        console.log(`Media deleted successfully: ${key}`);
        return response;
    }
    catch (error) {
        console.log(`Error deleting media ${key}:`, error);
        return null;
    }
};
exports.deleteMedia = deleteMedia;
/**
 * Simple file upload without multipart (for smaller files)
 * Supports base64 encoded data or Buffer
 */
// {
//   fileName: "report.pdf",
//   fileContent: "JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL0NhdGFsb2...", // Base64 PDF content
//   contentType: "application/pdf",
//   isBase64: true
// }
const uploadSingleFile = async (fileName, fileContent, contentType, isBase64 = false) => {
    try {
        let fileBuffer;
        if (isBase64 && typeof fileContent === 'string') {
            // Remove data:image/jpeg;base64, prefix if present
            const base64Data = fileContent.replace(/^data:[^;]+;base64,/, '');
            fileBuffer = Buffer.from(base64Data, 'base64');
        }
        else if (Buffer.isBuffer(fileContent)) {
            fileBuffer = fileContent;
        }
        else {
            throw new Error('Invalid file content type. Must be base64 string or Buffer.');
        }
        const command = new client_s3_1.PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: fileBuffer,
            ContentType: contentType,
            ACL: 'public-read'
        });
        const response = await s3Client.send(command);
        // Construct the file URL
        const fileUrl = `https://${bucketName}.s3.${envVars.REGION}.amazonaws.com/${fileName}`;
        return {
            Location: fileUrl,
            Key: fileName,
            ETag: response.ETag || ''
        };
    }
    catch (error) {
        console.error('Error uploading single file:', error);
        throw error;
    }
};
exports.uploadSingleFile = uploadSingleFile;
/**
 * Upload file from local file system path
 */
const uploadFileFromPath = async (filePath, fileName, contentType) => {
    try {
        const fs = require('fs');
        const fileBuffer = fs.readFileSync(filePath);
        return await uploadSingleFile(fileName, fileBuffer, contentType, false);
    }
    catch (error) {
        console.error('Error uploading file from path:', error);
        throw error;
    }
};
exports.uploadFileFromPath = uploadFileFromPath;
