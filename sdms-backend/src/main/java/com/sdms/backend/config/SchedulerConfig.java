package com.sdms.backend.config;

import net.javacrumbs.shedlock.core.LockProvider;
import net.javacrumbs.shedlock.provider.jdbctemplate.JdbcTemplateLockProvider;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.EnableScheduling;

import javax.sql.DataSource;

/**
 * Lớp cấu hình tự động hóa lịch trình (Cron Job / Scheduler) kết hợp với ShedLock.
 * ShedLock đảm bảo trong môi trường đa máy chủ (Clustered/Microservices),
 * một tác vụ theo lịch chỉ được thực thi trên ĐÚNG MỘT máy chủ tại một thời điểm,
 * ngăn ngừa triệt để tình trạng xử lý trùng lặp dữ liệu (ví dụ: tạo 2 hóa đơn cùng lúc).
 */
@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "10m")
public class SchedulerConfig {

    /**
     * Cấu hình cơ chế khóa (Lock) phi tập trung dựa trên cơ sở dữ liệu (JDBC).
     * 
     * @param dataSource Nguồn dữ liệu kết nối đến Database
     * @return Trình cung cấp khóa (LockProvider) lưu trữ trạng thái vào bảng shedlock
     */
    @Bean
    public LockProvider lockProvider(DataSource dataSource) {
        return new JdbcTemplateLockProvider(
            JdbcTemplateLockProvider.Configuration.builder()
                .withJdbcTemplate(new JdbcTemplate(dataSource))
                .usingDbTime()
                .build()
        );
    }
}
