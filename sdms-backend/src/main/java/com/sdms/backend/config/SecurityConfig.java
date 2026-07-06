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

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/v1/auth/**",
            "/api/v1/registrations/**",
            "/api/v1/uploads/**",
            "/api/v1/smartaccess/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/webjars/**",
            "/uploads/**"
    };


    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Cấu hình CORS (Phải được đặt đầu tiên)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // 2. Vô hiệu hóa CSRF vì dùng JWT (Stateless)
                .csrf(AbstractHttpConfigurer::disable)

                // 3. Sử dụng Stateless Session
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 4. Cấu hình xử lý lỗi 401/403
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler)
                )

                // 5. Quy tắc phân quyền
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập OPTIONS cho toàn bộ hệ thống (Fix lỗi Pre-flight)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/{applicationId}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/applications/status").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/applications").permitAll()
                        .anyRequest().authenticated()
                )

                // 6. Cấu hình Provider và Filter
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép nguồn React
        configuration.setAllowedOriginPatterns(List.of("http://localhost:5173"));

        // BẮT BUỘC: Thêm "PATCH" và "OPTIONS" vào danh sách cho phép
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Cho phép các header cần thiết cho Token và Content-Type
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));

        // Cho phép cookie/token
        configuration.setAllowCredentials(true);

        // Áp dụng cho toàn bộ đường dẫn
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}