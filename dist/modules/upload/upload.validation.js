"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonDataUploadSchema = exports.filePathUploadSchema = exports.singleFileUploadSchema = exports.completeUploadSchema = exports.generatePresignedUrlSchema = exports.initiateUploadSchema = void 0;
const Joi = require('joi');
const initiateUploadBody = {
    fileName: Joi.string().trim().min(3).required(),
    filetype: Joi.string()
        .required()
};
exports.initiateUploadSchema = {
    body: Joi.object().keys(initiateUploadBody)
};
const PresignedUrlSchema = {
    fileName: Joi.string().trim().min(3).required(),
    uploadId: Joi.string().trim().required(),
    filetype: Joi.string()
        .required(),
    numChunks: Joi.number().integer().min(1).max(1000).required()
};
exports.generatePresignedUrlSchema = {
    body: Joi.object().keys(PresignedUrlSchema)
};
const completeUploadBody = {
    fileName: Joi.string().trim().min(3).required(),
    uploadId: Joi.string().trim().required()
};
exports.completeUploadSchema = {
    body: Joi.object().keys(completeUploadBody)
};
// Single file upload validation (non-multipart)
const singleFileUploadBody = {
    fileName: Joi.string().trim().min(1).required(),
    fileContent: Joi.string().required(),
    contentType: Joi.string()
        .required(),
    isBase64: Joi.boolean().optional().default(true)
};
exports.singleFileUploadSchema = {
    body: Joi.object().keys(singleFileUploadBody)
};
// File path upload validation
const filePathUploadBody = {
    filePath: Joi.string().required(),
    fileName: Joi.string().trim().min(1).required(),
    contentType: Joi.string()
        .required()
};
exports.filePathUploadSchema = {
    body: Joi.object().keys(filePathUploadBody)
};
// JSON data upload validation
exports.jsonDataUploadSchema = {
    body: Joi.object().keys({
        data: Joi.alternatives().try(Joi.object(), Joi.array(), Joi.string(), Joi.number(), Joi.boolean()).required(),
        fileName: Joi.string().trim().min(1).required()
    })
};
