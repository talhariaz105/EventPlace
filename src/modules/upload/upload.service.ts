
import { CompleteUpload, IinitateUpload, IPressignedUrl, IUploadChunk, ISingleFileUpload, IFilePathUpload, IUploadResponse } from "./upload.interfaces";
import { completeMultipartUpload, createPresignedUrl, generateDownloadUrl, initiateMultipartUpload, uploadPart, uploadSingleFile, uploadFileFromPath } from "./upload.middleware";

export const createInitateUpload = async (body: IinitateUpload) => {
    const { fileName, filetype } = body;

    // Initiate multipart upload
    const response = await initiateMultipartUpload(fileName, filetype);

    return response;
};


export const createpresignedUrl = async (body: IPressignedUrl) => {
    const { fileName, uploadId, numChunks } = body;

    // Generate presigned URLs for each part
    const presignedUrls = [];
    for (let i = 1; i <= numChunks; i++) {
        const url: string = await createPresignedUrl(fileName, uploadId, i);
        presignedUrls.push({ partNumber: i, url });
    }

    return { presignedUrls };
}


export const createcompleteUpload = async (body: CompleteUpload) => {
    const { fileName, uploadId } = body;

    // Complete the multipart upload
    const response = await completeMultipartUpload(fileName, uploadId);

    return response;
}


export const createUploadChunk = async (body: IUploadChunk) => {
    const { index, fileName, uploadId, file } = body;
   
    const response = await uploadPart(index, fileName, file.buffer, uploadId);

    return response;
}

export const createdownloadAwsObject= async(keyObject: string) => {
    const response = await generateDownloadUrl(keyObject);
    return response;
}

/**
 * Upload a single file using base64 content or Buffer (non-multipart)
 * Best for smaller files (< 100MB)
 */
export const uploadSingleFileService = async (body: ISingleFileUpload): Promise<IUploadResponse> => {
    try {
        const { fileName, fileContent, contentType, isBase64 = true } = body;
        
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        
        const response = await uploadSingleFile(uniqueFileName, fileContent, contentType, isBase64);
        
        return {
            ...response,
            message: 'File uploaded successfully',
            success: true
        };
    } catch (error) {
        console.error('Error in uploadSingleFileService:', error);
        throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Upload file from local file system path
 * Useful for backend file processing
 */
export const uploadFileFromPathService = async (body: IFilePathUpload): Promise<IUploadResponse> => {
    try {
        const { filePath, fileName, contentType } = body;
        
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}`;
        
        const response = await uploadFileFromPath(filePath, uniqueFileName, contentType);
        
        return {
            ...response,
            message: 'File uploaded successfully from path',
            success: true
        };
    } catch (error) {
        console.error('Error in uploadFileFromPathService:', error);
        throw new Error(`File upload from path failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};

/**
 * Upload JSON data as a file
 */
export const uploadJsonDataAsFile = async (
    data: any, 
    fileName: string
): Promise<IUploadResponse> => {
    try {
        const jsonString = JSON.stringify(data, null, 2);
        const buffer = Buffer.from(jsonString, 'utf-8');
        
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const uniqueFileName = `${timestamp}-${fileName}.json`;
        
        const response = await uploadSingleFile(uniqueFileName, buffer, 'application/json', false);
        
        return {
            ...response,
            message: 'JSON data uploaded successfully',
            success: true
        };
    } catch (error) {
        console.error('Error in uploadJsonDataAsFile:', error);
        throw new Error(`JSON upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
};