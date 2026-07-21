package com.sdms.backend.config;

import com.sdms.backend.security.CustomAccessDeniedHandler;
import com.sdms.backend.security.JwtAuthenticationEntryPoint;
import com.sdms.backend.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Trạm gác trung tâm (Security Center) của toàn bộ hệ thống.
 * 
 * Kiến trúc & Vai trò cốt lõi:
 * 1. CORS: Thiết lập bộ lọc Cross-Origin cho phép Frontend truy cập API an toàn.
 * 2. Routing Rules: Phân định rõ ràng ranh giới giữa Public API và Private API.
 * 3. Exception Handling: Bắt và chuẩn hóa các lỗi bảo mật cấp thấp (401 Unauthorized, 403 Forbidden).
 * 4. Stateless Session: Vô hiệu hóa Session truyền thống, chuyển đổi hoàn toàn sang kiến trúc RESTful JWT.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    // Danh sách các API công khai (Public Endpoints) không yêu cầu xác thực
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/registrations/**",
            "/api/v1/uploads/**",
            "/api/v1/smartaccess/**",
            "/api/webhooks/**",
            "/api/v1/payments/online",
            "/api/v1/ocr/cccd",
            "/api/v1/public/**",
            "/api/v1/internal/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/webjars/**",
            "/uploads/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Cấu hình CORS (Bắt buộc ưu tiên thực thi đầu tiên để tránh lỗi block từ trình duyệt)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Vô hiệu hóa CSRF (Cross-Site Request Forgery). Kiến trúc Stateless JWT tự động miễn nhiễm với CSRF.
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Cơ chế Stateless: Tuyệt đối không lưu trạng thái phiên (JSESSIONID) trên máy chủ.
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Ủy quyền xử lý ngoại lệ phân quyền (401 & 403) về các Handler tùy chỉnh để đảm bảo trả về ApiResponse.
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint) // Xử lý thiếu hoặc sai Token
                        .accessDeniedHandler(customAccessDeniedHandler)        // Xử lý lệch quyền (Role)
                )

                // 5. Cấu hình phân quyền truy cập (Routing Rules)
                .authorizeHttpRequests(auth -> auth
                        // Cực kỳ quan trọng: Luôn cho phép pre-flight request của CORS thông qua phương thức OPTIONS
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        
                        // Các API công khai (Auth, Swagger, Webhook...)
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        
                        // Các API liên quan đến Đơn Đăng Ký (Khi sinh viên chưa được cấp tài khoản)
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/{applicationId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications").permitAll()
                        
                        // TẤT CẢ các API còn lại đều phải qua kiểm tra Token (Authentication)
                        .anyRequest().authenticated()
                )

                // 6. Chèn bộ lọc kiểm tra JWT vào trước bộ lọc xác thực mặc định của Spring Security
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Xây dựng bộ quy tắc cấu hình CORS.
     * Cấp quyền cụ thể về Origin, Methods và Headers nhằm đảm bảo giao tiếp an toàn và linh hoạt với Frontend.
     * 
     * @return Nguồn cấu hình CORS đã được chuẩn hóa
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Thiết lập danh sách Origin được phép truy cập (VD: React App)
        configuration.setAllowedOriginPatterns(List.of("http://localhost:5173"));

        // Cho phép các phương thức tương tác Dữ liệu
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cấp quyền đính kèm Header (Đặc biệt quan trọng với header Authorization để gửi Token)
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With", "x-admin-id"));

        // Bắt buộc bật tính năng này để cho phép gửi cookie/token qua biên giới domain (Cross-domain)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}