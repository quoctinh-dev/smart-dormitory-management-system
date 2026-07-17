package com.sdms.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Lớp ánh xạ cấu hình cho cơ chế JSON Web Token (JWT).
 * Trích xuất các tham số bảo mật chiến lược (Secret Keys, Expiration Times) từ môi trường.
 */
@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtConfig {

    private String accessSecret;
    private String refreshSecret;
    private Long accessExpiration;
    private Long refreshExpiration;
}