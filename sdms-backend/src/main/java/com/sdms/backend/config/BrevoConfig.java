package com.sdms.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Lớp ánh xạ cấu hình cho dịch vụ gửi thư điện tử Brevo (tên cũ Sendinblue).
 * Trích xuất các tham số (API Key, Thông tin người gửi) từ biến môi trường để tích hợp giao thức SMTP.
 */
@Configuration
@ConfigurationProperties(prefix = "brevo")
@Data
public class BrevoConfig {

    private String apiKey;

    private String senderEmail;

    private String senderName;
}
