package com.sdms.backend.config;

import org.springframework.boot.autoconfigure.flyway.FlywayMigrationStrategy;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class FlywayConfig {

    @Bean
    public FlywayMigrationStrategy flywayMigrationStrategy() {
        return flyway -> {
            // Lifecycle Hook: Thực thi căn chỉnh và kiểm định schema lịch sử.
            // Tính toán lại Checksum của các file migration vật lý và cập nhật bảng flyway_schema_history.
            flyway.repair();

            // Core Migration Pipeline: Kích hoạt tiến trình dịch chuyển schema.
            // Thực thi tuần tự các script DDL/DML chưa được áp dụng vào Database.
            flyway.migrate();
        };
    }
}