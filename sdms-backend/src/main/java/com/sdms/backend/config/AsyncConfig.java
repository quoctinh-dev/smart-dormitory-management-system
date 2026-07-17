package com.sdms.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.security.task.DelegatingSecurityContextAsyncTaskExecutor;
import java.util.concurrent.Executor;

/**
 * Lớp cấu hình xử lý bất đồng bộ (Asynchronous Processing).
 * Kích hoạt và thiết lập thông số cho Thread Pool, giúp hệ thống xử lý các tác vụ nền
 * (như gửi thư điện tử, xử lý tập tin lớn) mà không gây tắc nghẽn luồng HTTP chính.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    /**
     * Cấu hình nhóm luồng (Thread Pool) thực thi tác vụ.
     * Trọng tâm kiến trúc: Sử dụng DelegatingSecurityContextAsyncTaskExecutor để đảm bảo
     * SecurityContext (ngữ cảnh bảo mật của người dùng hiện tại) được truyền nguyên vẹn
     * từ luồng chính sang các luồng con chạy ngầm, tránh lỗi mất Authentication.
     *
     * @return Executor quản lý việc phân phối đa luồng
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("SDMS-Async-");
        executor.initialize();

        return new DelegatingSecurityContextAsyncTaskExecutor(executor);
    }
}