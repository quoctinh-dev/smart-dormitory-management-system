package com.sdms.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.HashMap;
import java.util.Map;

/**
 * Lớp cấu hình tích hợp nền tảng lưu trữ đám mây Cloudinary.
 * Khởi tạo kết nối an toàn để hỗ trợ tính năng tải lên (upload) và quản lý tập tin đa phương tiện.
 */
@Configuration
public class CloudinaryConfig {
    @Value("${cloudinary.cloud-name}")
    private String cloudName;
    @Value("${cloudinary.api-key}")
    private String apiKey;
    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    /**
     * Khởi tạo đối tượng giao tiếp với Cloudinary.
     * Đóng gói các thông số xác thực (Cloud Name, API Key, API Secret) vào cấu trúc Map
     * để tương thích với SDK của Cloudinary.
     *
     * @return Bean Cloudinary đã được tiêm thông số xác thực
     */
    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}