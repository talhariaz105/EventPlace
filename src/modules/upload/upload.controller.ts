import { Request, Response } from "express";
import { catchAsync } from "../utils";
import * as uploadService from "./upload.service";

export const initateUpload = catchAsync(async (req: Request, res: Response) => {
    const response = await uploadService.createInitateUpload(req.body);
    res.status(200).json(response);
});

export const generatePresignedUrl = catchAsync(async (req: Request, res: Response) => {
    const response = await uploadService.createpresignedUrl(req.body);
    res.status(200).json(response);
});

export const completeUpload = catchAsync(async (req: Request, res: Response) => {
    const response = await uploadService.createcompleteUpload(req.body);
    res.status(200).json(response);
});


export const uploadChunk = catchAsync(async (req: Request, res: Response) => {
    const { uploadId } = req.query;
    const response = await uploadService.createUploadChunk({ ...req.body, file: req.file, uploadId: uploadId });
    res.status(200).json(response);
});


export const downloadAwsObject = catchAsync(async (req: Request, res: Response) => {
    const { key } = req.query;
    const response = await uploadService.createdownloadAwsObject(key as string);
    res.status(200).json(response);
});

/**
 * Upload single file using base64 or raw data (non-multipart)
 */
export const uploadSingleFile = catchAsync(async (req: Request, res: Response) => {
    const response = await uploadService.uploadSingleFileService(req.body);
    res.status(201).json(response);
});

/**
 * Upload file from file system path
 */
export const uploadFromPath = catchAsync(async (req: Request, res: Response) => {
    const response = await uploadService.uploadFileFromPathService(req.body);
    res.status(201).json(response);
});

/**
 * Upload JSON data as file
 */
export const uploadJsonData = catchAsync(async (req: Request, res: Response) => {
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