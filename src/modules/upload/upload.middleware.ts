import 'dotenv/config';
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  GetObjectCommand,
  ListPartsCommand,
  DeleteObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
    REGION: requiredVars.REGION!,
    AWS_ACCESS_KEY_ID: requiredVars.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: requiredVars.AWS_SECRET_ACCESS_KEY!,
    AWS_STORAGE_BUCKET_NAME: requiredVars.AWS_STORAGE_BUCKET_NAME!
  };
};

const envVars = validateEnvVars();

const s3Client = new S3Client({
  region: envVars.REGION,
  credentials: {
    accessKeyId: envVars.AWS_ACCESS_KEY_ID,
    secretAccessKey: envVars.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = envVars.AWS_STORAGE_BUCKET_NAME;

interface MultipartUploadResponse {
  uploadId: string;
}

interface Part {
  ETag?: string | undefined;
  PartNumber?: number | undefined;
}

const initiateMultipartUpload = async (fileName: string, fileType: string): Promise<MultipartUploadResponse> => {
  const command = new CreateMultipartUploadCommand({
    Bucket: bucketName,
    Key: fileName,
    ContentType: fileType,
    ACL: 'public-read'
  });
  const response = await s3Client.send(command);
  return { uploadId: response.UploadId! };
};

const createPresignedUrl = async (fileName: string, uploadId: string, partNumber: number): Promise<string> => {
  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: fileName,
    UploadId: uploadId,
    PartNumber: partNumber
  });
  try {
    const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour
    return url;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

/**
 * Upload part to S3
 */
const uploadPart = async (index: number, fileName: string, fileBuffer: Buffer, uploadId: string) => {
  const command = new UploadPartCommand({
    Bucket: bucketName,
    Key: fileName,
    UploadId: uploadId,
    PartNumber: Number(index) + 1,
    Body: fileBuffer
  });
  return s3Client.send(command);
};

const completeMultipartUpload = async (filename: string, uploadId: string) => {
  console.log('aya ma complete upload');

  const command = new ListPartsCommand({
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
    const parts = data?.Parts?.map((part: Part) => ({
      ETag: part.ETag,
      PartNumber: part.PartNumber
    }));

    if (!parts || parts.length === 0) {
      throw new Error('No parts provided for completing multipart upload.');
    }
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: bucketName,
      Key: filename,
      UploadId: uploadId,
      MultipartUpload: { Parts: parts }
    });

    const response = await s3Client.send(completeCommand);

    return response;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const generateDownloadUrl = async (key: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key
  });
  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
};

const deleteMedia = async (key: string): Promise<any> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key
    });
    const response = await s3Client.send(command);
    console.log(`Media deleted successfully: ${key}`);
    return response;
  } catch (error) {
    console.log(`Error deleting media ${key}:`, error);
    return null;
  }
};

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

const uploadSingleFile = async (
  fileName: string, 
  fileContent: string | Buffer, 
  contentType: string,
  isBase64: boolean = false
): Promise<{ Location: string; Key: string; ETag: string }> => {
  try {
    let fileBuffer: Buffer;
    
    if (isBase64 && typeof fileContent === 'string') {
      // Remove data:image/jpeg;base64, prefix if present
      const base64Data = fileContent.replace(/^data:[^;]+;base64,/, '');
      fileBuffer = Buffer.from(base64Data, 'base64');
    } else if (Buffer.isBuffer(fileContent)) {
      fileBuffer = fileContent;
    } else {
      throw new Error('Invalid file content type. Must be base64 string or Buffer.');
    }

    const command = new PutObjectCommand({
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
  } catch (error) {
    console.error('Error uploading single file:', error);
    throw error;
  }
};

/**
 * Upload file from local file system path
 */
const uploadFileFromPath = async (
  filePath: string,
  fileName: string,
  contentType: string
): Promise<{ Location: string; Key: string; ETag: string }> => {
  try {
    const fs = require('fs');
    const fileBuffer = fs.readFileSync(filePath);
    
    return await uploadSingleFile(fileName, fileBuffer, contentType, false);
  } catch (error) {
    console.error('Error uploading file from path:', error);
    throw error;
  }
};


export {
  initiateMultipartUpload,
  createPresignedUrl,
  uploadPart,
  completeMultipartUpload,
  generateDownloadUrl,
  deleteMedia,
  uploadSingleFile,
  uploadFileFromPath
};
