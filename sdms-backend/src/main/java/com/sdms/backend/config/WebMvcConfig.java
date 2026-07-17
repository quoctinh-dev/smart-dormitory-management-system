package com.sdms.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Lớp cấu hình tùy chỉnh cho Spring MVC.
 * Quản lý các cấu hình liên quan đến lớp trình bày (Presentation Layer) như định dạng phân trang,
 * và cấu hình cơ chế cung cấp nội dung tĩnh (Static Resources).
 */
@Configuration
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Mở rộng khả năng xử lý tài nguyên tĩnh của Spring MVC.
     * Ánh xạ các URL yêu cầu tập tin (ví dụ: /uploads/image.png) tới thư mục lưu trữ vật lý tương ứng trên máy chủ.
     *
     * @param registry Trình quản lý tài nguyên của Spring MVC
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        Path uploadPath = Paths.get(uploadDir);
        String uploadAbsolutePath = uploadPath.toFile().getAbsolutePath();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadAbsolutePath + "/");
    }
}
