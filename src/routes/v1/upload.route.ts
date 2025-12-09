import { validate } from "../../modules/validate";
import { uploadController, uploadValidation } from "../../modules/upload";
import express, { Router } from 'express';
// import { auth } from "../../modules/auth

const router: Router = express.Router();

router
    .route('/initiate-upload')
    .post(validate(uploadValidation.initiateUploadSchema), uploadController.initateUpload);
router.post('/generate-presigned-url', validate(uploadValidation.generatePresignedUrlSchema), uploadController.generatePresignedUrl);
router.post('/complete-upload', validate(uploadValidation.completeUploadSchema), uploadController.completeUpload);

// New non-multipart upload routes
router
    .route('/single-file')
    .post(validate(uploadValidation.singleFileUploadSchema), uploadController.uploadSingleFile);

router
    .route('/from-path')
    .post(validate(uploadValidation.filePathUploadSchema), uploadController.uploadFromPath);

router
    .route('/json-data')
    .post(validate(uploadValidation.jsonDataUploadSchema), uploadController.uploadJsonData);

// Download route
router
    .route('/download')
    .get(uploadController.downloadAwsObject);

export default router;