package com.sdms.backend.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Configuration;

/**
 * Cấu hình Redis Cache với cơ chế xử lý lỗi graceful.
 *
 * Vấn đề gốc: Khi Redis không khả dụng (down, mất kết nối), Spring Cache
 * ném ra RedisConnectionFailureException và làm crash toàn bộ request HTTP,
 * ngay cả khi logic nghiệp vụ đã xử lý thành công (VD: thanh toán thành công
 * nhưng user thấy lỗi vì dashboard dùng Redis).
 *
 * Giải pháp: Implement CacheErrorHandler để bắt các lỗi cache và gracefully
 * fallback về query thẳng DB, thay vì propagate exception lên Controller.
 */
@Slf4j
@Configuration
public class RedisConfig implements CachingConfigurer {

    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {

            @Override
            public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
                log.warn("[RedisConfig] Cache GET failed on cache='{}', key='{}'. Falling back to DB. Error: {}",
                        cache.getName(), key, e.getMessage());
                // Không throw → Spring tự động fallback về method gốc (query DB)
            }

            @Override
            public void handleCachePutError(RuntimeException e, Cache cache, Object key, Object value) {
                log.warn("[RedisConfig] Cache PUT failed on cache='{}', key='{}'. Data saved to DB only. Error: {}",
                        cache.getName(), key, e.getMessage());
                // Không throw → chấp nhận data không được cache, nhưng không crash
            }

            @Override
            public void handleCacheEvictError(RuntimeException e, Cache cache, Object key) {
                log.warn("[RedisConfig] Cache EVICT failed on cache='{}', key='{}'. Error: {}",
                        cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException e, Cache cache) {
                log.warn("[RedisConfig] Cache CLEAR failed on cache='{}'. Error: {}",
                        cache.getName(), e.getMessage());
            }
        };
    }
}
