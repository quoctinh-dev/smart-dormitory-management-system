package com.sdms.backend.modules.face.port;

import org.springframework.web.multipart.MultipartFile;

/**
 * Cổng ra cho các tương tác với AI Engine.
 * Lớp Anti-Corruption giữa Module Face và service AI Python bên ngoài.
 */
public interface AiExtractionPort {

    /**
     * Trích xuất vector 192 chiều từ URL ảnh khuôn mặt.
     * Ném ra ngoại lệ nếu không phát hiện thấy khuôn mặt hoặc nếu AI engine không thể truy cập.
     *
     * @param imageUrl URL CDN của ảnh chân dung đã tải lên
     * @return Vector 512 chiều
     */
    float[] extractVector(String imageUrl);

    /**
     * Trích xuất vector 512 chiều trực tiếp từ MultipartFile (ví dụ: từ ESP32).
     *
     * @param file Tệp hình ảnh đã tải lên
     * @return Vector 512 chiều
     */
    float[] extractVector(MultipartFile file);
}
