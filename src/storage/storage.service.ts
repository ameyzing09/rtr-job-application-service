import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  PresignedUrlResponseDto,
} from './storage.dto';

@Injectable()
export class StorageService {
  /**
   * Generates a presigned URL for file uploads.
   *
   * TODO: Implement actual cloud storage integration
   * - Google Cloud Storage (GCS): Use @google-cloud/storage with signed URLs
   * - AWS S3: Use @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner
   * - IBM Cloud Object Storage: Use ibm-cos-sdk
   *
   * Configuration should be loaded from environment variables:
   * - GCS_PROJECT_ID, GCS_BUCKET_NAME, GCS_KEYFILE_PATH
   * - AWS_REGION, AWS_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
   * - IBM_ENDPOINT, IBM_BUCKET_NAME, IBM_API_KEY_ID, IBM_SERVICE_INSTANCE_ID
   *
   * When implementing with real cloud storage:
   * - Set size limits in the presigned URL policy (e.g., conditions in GCS/S3)
   * - Include content-type restrictions in the signature
   * - Set expiration time (currently 15 minutes)
   * - For GCS: Use bucket.file(path).getSignedUrl({ action: 'write', ... })
   * - For S3: Use getSignedUrl(new PutObjectCommand({ ... }))
   *
   * @param tenantId - The tenant ID for namespacing uploads
   * @param fileName - The name of the file to upload
   * @param fileType - The MIME type of the file
   * @returns Presigned URL details including upload URL and final file URL
   */
  getPresignedUrl(
    tenantId: string,
    fileName: string,
    fileType: string,
  ): PresignedUrlResponseDto {
    // Validate file type
    if (!(fileType in ALLOWED_FILE_TYPES)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${Object.values(ALLOWED_FILE_TYPES).join(', ')}`,
      );
    }

    // STUBBED IMPLEMENTATION
    // This is a placeholder that returns mock URLs for development
    // Replace this with actual cloud storage implementation when credentials are available

    const timestamp = Date.now();
    const fileExtension = ALLOWED_FILE_TYPES[fileType as keyof typeof ALLOWED_FILE_TYPES];
    const sanitizedFilename = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');

    // Remove existing extension and add the validated one
    const baseFilename = sanitizedFilename.replace(/\.[^.]+$/, '');
    const finalFilename = `${baseFilename}.${fileExtension}`;

    const storagePath = `${tenantId}/resumes/${timestamp}-${finalFilename}`;

    // Mock presigned URL (not functional, just for API contract demonstration)
    // In real implementation, this would include:
    // - Content-Type restriction
    // - Size limit policy (max ${MAX_FILE_SIZE} bytes = 5MB)
    // - Expiration timestamp
    const mockUploadUrl = `https://storage.googleapis.com/mock-bucket/${storagePath}?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=mock&X-Goog-Date=20250101T000000Z&X-Goog-Expires=900&X-Goog-SignedHeaders=content-type%3Bhost&X-Goog-ContentLength=${MAX_FILE_SIZE}&X-Goog-Signature=mock-signature`;

    // Mock final file URL (where the file will be accessible after upload)
    const mockFileUrl = `https://storage.googleapis.com/mock-bucket/${storagePath}`;

    return {
      uploadUrl: mockUploadUrl,
      fileUrl: mockFileUrl,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * TODO: Add method to validate if a file URL belongs to the tenant
   * This prevents users from submitting resume URLs from other tenants
   */
  // async validateFileUrl(tenantId: string, fileUrl: string): Promise<boolean> {
  //   return fileUrl.includes(`/${tenantId}/`);
  // }

  /**
   * TODO: Add method to delete uploaded files (e.g., when application is deleted)
   */
  // async deleteFile(fileUrl: string): Promise<void> {
  //   // Implementation depends on cloud provider
  // }
}
