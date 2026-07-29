package com.sdms.backend.modules.upload.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folder) {
        // 1. Kiểm tra file có rỗng không
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tệp tin tải lên bị rỗng hoặc không hợp lệ");
        }

        // 2. Kiểm tra định dạng (chỉ cho phép ảnh)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Định dạng tệp không được hỗ trợ (chỉ chấp nhận tệp hình ảnh)");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", "auto"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Tải tệp lên Cloudinary thất bại: " + e.getMessage());
        }
    }

    public String uploadPdfBytes(byte[] pdfBytes, String folder, String fileName) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Dữ liệu tệp PDF bị rỗng");
        }

        try {
            String publicId = fileName.endsWith(".pdf") ? fileName : fileName + ".pdf";
            
            Map uploadResult = cloudinary.uploader().upload(
                    pdfBytes,
                    ObjectUtils.asMap(
                            "folder", folder,
                            "public_id", publicId,
                            "resource_type", "raw"
                    )
            );
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Tải tệp PDF lên Cloudinary thất bại: " + e.getMessage());
        }
    }

    public void deleteFileByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        try {
            // URL format: https://res.cloudinary.com/<cloud_name>/<resource_type>/upload/v<version>/<folder>/<filename>.<ext>
            // We need to extract <folder>/<filename> as public_id
            int uploadIndex = fileUrl.indexOf("/upload/");
            if (uploadIndex != -1) {
                String pathAfterUpload = fileUrl.substring(uploadIndex + 8);
                // Remove version tag (v1234567890/) if present
                if (pathAfterUpload.matches("^v\\d+/.*")) {
                    pathAfterUpload = pathAfterUpload.replaceFirst("^v\\d+/", "");
                }
                // Xử lý tách publicId tùy thuộc vào loại tài nguyên (raw, image, video)
                boolean isRaw = fileUrl.contains("/raw/");
                String publicId = pathAfterUpload;
                
                if (!isRaw) {
                    // Đối với image/video, Cloudinary yêu cầu publicId không bao gồm phần mở rộng file
                    int lastDotIndex = pathAfterUpload.lastIndexOf('.');
                    publicId = (lastDotIndex != -1) ? pathAfterUpload.substring(0, lastDotIndex) : pathAfterUpload;
                }
                
                // Khi xóa tài liệu dạng raw, cần phải chỉ định tham số resource_type tương ứng
                Map<String, Object> options = isRaw ? ObjectUtils.asMap("resource_type", "raw") : ObjectUtils.emptyMap();
                cloudinary.uploader().destroy(publicId, options);
                log.info("Đã xóa file trên Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.warn("Không thể xóa file rác trên Cloudinary: {}. Lỗi: {}", fileUrl, e.getMessage());
        }
    }
}