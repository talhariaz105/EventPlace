export interface IinitateUpload {
    fileName: string;
    filetype: string;
}

export interface IPressignedUrl {
    fileName: string;
    filetype: string;
    uploadId: string;
    numChunks: number;
}

export interface CompleteUpload {
    fileName: string;
    uploadId: string;
}

export interface IUploadChunk {
    index: number;
    fileName: string;
    uploadId: string;
    file: Express.Multer.File;
}

export interface ISingleFileUpload {
    fileName: string;
    fileContent: string; // base64 encoded string
    contentType: string;
    isBase64?: boolean;
}

export interface IFilePathUpload {
    filePath: string;
    fileName: string;
    contentType: string;
}

export interface IUploadResponse {
    Location: string;
    Key: string;
    ETag: string;
    message: string;
    success: boolean;
}