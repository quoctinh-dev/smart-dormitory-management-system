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
            Map uploadResult = cloudinary.uploader().upload(
                    pdfBytes,
                    ObjectUtils.asMap(
                            "folder", folder,
                            "public_id", fileName.replace(".pdf", ""),
                            "resource_type", "raw",
                            "access_mode", "public"
                    )
            );
            String url = uploadResult.get("secure_url").toString();
            log.info("Successfully uploaded PDF to Cloudinary. URL: {}", url);
            return url;
        } catch (IOException e) {
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Tải tệp PDF lên Cloudinary thất bại: " + e.getMessage());
        }
    }
}