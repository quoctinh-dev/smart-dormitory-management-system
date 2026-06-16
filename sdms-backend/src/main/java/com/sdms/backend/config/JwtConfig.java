package com.sdms.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "jwt")
@Data
public class JwtConfig {

    private String accessSecret;
    private String refreshSecret;
    private Long accessExpiration;
    private Long refreshExpiration;
}