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

    /**
     * Tải tệp hình ảnh lên Cloudinary
     *
     * @param file   Tệp tin đa phương tiện gửi từ request
     * @param folder Thư mục lưu trữ trên Cloudinary
     * @return URL truy cập an toàn (secure_url) của hình ảnh
     */
    public String uploadFile(MultipartFile file, String folder) {
        // Kiểm tra tệp tin hợp lệ
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tệp tin tải lên bị rỗng hoặc không hợp lệ");
        }

        // Kiểm tra định dạng tệp (chỉ hỗ trợ hình ảnh)
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

    /**
     * Tải tệp tài liệu PDF dạng byte array lên Cloudinary
     *
     * @param pdfBytes Mảng byte chứa dữ liệu PDF
     * @param folder   Thư mục lưu trữ trên Cloudinary
     * @param fileName Tên tệp tin muốn lưu
     * @return URL truy cập an toàn (secure_url) của tệp PDF
     */
    public String uploadPdfBytes(byte[] pdfBytes, String folder, String fileName) {
        if (pdfBytes == null || pdfBytes.length == 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Dữ liệu tệp PDF bị rỗng");
        }

        try {
            // Đảm bảo tên tệp luôn có phần mở rộng .pdf
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

    /**
     * Xóa tệp tin trên Cloudinary dựa theo URL công khai
     *
     * @param fileUrl URL tuyệt đối của tệp tin cần xóa
     */
    public void deleteFileByUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.isEmpty()) {
            return;
        }
        try {
            int uploadIndex = fileUrl.indexOf("/upload/");
            if (uploadIndex != -1) {
                // Tách lấy đường dẫn tài nguyên sau chuỗi '/upload/'
                String pathAfterUpload = fileUrl.substring(uploadIndex + 8);

                // Loại bỏ phần thông tin phiên bản (VD: 'v123456789/') nếu có
                if (pathAfterUpload.matches("^v\\d+/.*")) {
                    pathAfterUpload = pathAfterUpload.replaceFirst("^v\\d+/", "");
                }

                boolean isRaw = fileUrl.contains("/raw/");
                String publicId = pathAfterUpload;

                // Loại bỏ phần mở rộng đuôi tệp đối với các tài nguyên không phải dạng raw
                if (!isRaw) {
                    int lastDotIndex = pathAfterUpload.lastIndexOf('.');
                    publicId = (lastDotIndex != -1) ? pathAfterUpload.substring(0, lastDotIndex) : pathAfterUpload;
                }

                Map<String, Object> options = isRaw ? ObjectUtils.asMap("resource_type", "raw") : ObjectUtils.emptyMap();
                cloudinary.uploader().destroy(publicId, options);
                log.info("Đã xóa file trên Cloudinary: {}", publicId);
            }
        } catch (Exception e) {
            log.warn("Không thể xóa file rác trên Cloudinary: {}. Lỗi: {}", fileUrl, e.getMessage());
        }
    }
}