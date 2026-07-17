package com.sdms.backend.config;

import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Lớp cấu hình HTTP Client (RestTemplate).
 * Thiết lập các tham số thời gian chờ (Timeout) nhằm ngăn chặn tình trạng cạn kiệt luồng (Thread Exhaustion)
 * khi tích hợp với các dịch vụ bên ngoài phản hồi chậm (VD: API thanh toán, API gửi email).
 */
@Configuration
public class RestTemplateConfig {

    /**
     * Khởi tạo RestTemplate với cơ chế kiểm soát thời gian Timeout rõ ràng.
     * 
     * @param builder Công cụ xây dựng RestTemplate từ Spring Boot
     * @return Bean RestTemplate đã được tinh chỉnh
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(10))
                .build();
    }
}
