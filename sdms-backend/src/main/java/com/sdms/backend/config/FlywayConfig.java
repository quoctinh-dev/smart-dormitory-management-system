package com.sdms.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Lớp cấu hình can thiệp vào vòng đời (Lifecycle) của công cụ quản lý cơ sở dữ liệu Flyway.
 * Đảm bảo quá trình cập nhật cấu trúc bảng (Schema Migration) diễn ra trơn tru.
 */
@Configuration
public class FlywayConfig {

    /**
     * Điều chỉnh chiến lược khởi chạy Flyway mặc định của Spring Boot.
     *
     * @return Chiến lược thực thi Flyway tùy chỉnh (FlywayMigrationStrategy)
     */
    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            flyway.repair();
            flyway.migrate();
        };
    }
}