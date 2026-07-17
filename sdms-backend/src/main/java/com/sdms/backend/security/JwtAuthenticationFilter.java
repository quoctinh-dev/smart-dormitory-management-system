package com.sdms.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sdms.backend.modules.auth.service.JwtService;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

/**
 * Mục tiêu/Nghiệp vụ: Filter một lần cho mỗi request để xác thực JWT của hệ thống Ký túc xá. Chịu trách nhiệm chặn request, kiểm tra token (tính hợp lệ, thời hạn, quyền hạn), và thiết lập SecurityContext cho sinh viên hoặc ban quản lý.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Kế thừa OncePerRequestFilter của Spring Security (thuộc Chain of Responsibility Pattern).
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích cho hội đồng tại sao dùng OncePerRequestFilter thay vì Filter thông thường: Đảm bảo logic xác thực chỉ chạy 1 lần duy nhất trên 1 request, tránh vòng lặp forward/include trong servlet container gây tràn bộ nhớ hoặc xác thực nhiều lần dư thừa.
 */
@Slf4j
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ObjectMapper objectMapper;
    @Autowired
    public JwtAuthenticationFilter(
            JwtService jwtService,
            @Lazy UserDetailsService userDetailsService,
            ObjectMapper objectMapper) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.objectMapper = objectMapper;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        final String token = authHeader.substring(7);
        String username;

        try {
            jwtService.validateAccessToken(token);
            username = jwtService.extractUsernameFromAccessToken(token);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
                log.info("User {} has authorities: {}", username, userDetails.getAuthorities());
                if (!(userDetails instanceof UserAccount account) || account.getStatus() != AccountStatus.ACTIVE) {
                    log.warn("Attempt to access with non-ACTIVE account. Username: {}", username);
                    sendErrorResponse(response, ErrorCode.ACCOUNT_LOCKED);
                    return;
                }

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }

            filterChain.doFilter(request, response);

        } catch (JwtException e) {
            log.debug("JWT validation failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
        } catch (Exception e) {
            log.error("Unexpected error during authentication filter", e);
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Gửi response lỗi chuẩn hóa dạng JSON.
     */
    private void sendErrorResponse(HttpServletResponse response, ErrorCode errorCode) throws IOException {
        response.setStatus(errorCode.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("errorCode", errorCode.name());
        body.put("message", errorCode.getMessage());
        body.put("data", null);

        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
