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
            // Tự động sửa chữa (Repair) lịch sử Flyway trước khi chạy Migration.
            // Đồng bộ hóa lại checksum của các tệp SQL trong trường hợp có thay đổi thủ công,
            // tránh lỗi "checksum mismatch" gây treo hệ thống ở pha khởi động.
            flyway.repair();

            // Thực thi quá trình dịch chuyển (Migrate) cấu trúc cơ sở dữ liệu.
            // Tự động chạy các kịch bản DDL/DML mới chưa được áp dụng.
            flyway.migrate();
        };
    }
}