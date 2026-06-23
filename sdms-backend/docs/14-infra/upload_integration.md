# Upload Infrastructure Integration

## 1. Overview
The `com.sdms.backend.modules.upload` package serves as a global infrastructure utility for handling file and image storage. Although placed in the `modules` directory, it operates as an infrastructure layer rather than a domain-driven bounded context.

## 2. Cloudinary Service
The core of this module is the `CloudinaryService`. It wraps the 3rd-party Cloudinary CDN SDK to provide:
- Synchronous file upload capabilities (returning a public CDN URL).
- Synchronous file deletion capabilities (removing assets via public ID).

## 3. Integration Points
- **Student Profile:** Uploading avatars.
- **Application Module:** Uploading verification documents (e.g., identity cards or proof of priority).
- **Face Module (Future):** Temporarily uploading portrait photos for admin approval. If rejected, the `FaceStorageService` will call the `Upload` module to permanently delete the image.

## 4. API Endpoints
- `POST /api/v1/uploads` (Uploads a multipart file and returns the Cloudinary URL).
