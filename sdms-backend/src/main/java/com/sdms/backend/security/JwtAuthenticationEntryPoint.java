package com.sdms.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Mục tiêu/Nghiệp vụ: Xử lý các request bị từ chối do chưa đăng nhập (lỗi 401 Unauthorized) trong hệ thống Ký túc xá (vd: sinh viên truy cập thông tin không có token).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Implement giao diện AuthenticationEntryPoint của Spring Security (Strategy Pattern) để chuẩn hóa phản hồi JSON thay vì trả về trang HTML mặc định.
 * Lưu ý Kiến thức (Dành cho phản biện): Cần trả lời hội đồng tại sao lại tùy chỉnh EntryPoint: Vì hệ thống Ký túc xá là REST API, việc trả về trang HTML 401 mặc định của Spring sẽ làm lỗi phân tích cú pháp ở ứng dụng Mobile hoặc Frontend. Định dạng trả về JSON đồng nhất giúp client xử lý điều hướng mượt mà hơn.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    @Override
    public void commence(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException authException
    ) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
        body.put("message", "Unauthorized");

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
