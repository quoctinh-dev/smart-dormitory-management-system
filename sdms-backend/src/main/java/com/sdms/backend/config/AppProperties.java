package com.sdms.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * Lớp ánh xạ cấu hình (Configuration Properties) cho các tham số môi trường chung của ứng dụng.
 * Tự động liên kết các giá trị từ file application.yml (với tiền tố "app") thành đối tượng Java.
 */
@Component
@ConfigurationProperties(prefix = "app")
@Data
public class AppProperties {
    private String frontendUrl;
}
