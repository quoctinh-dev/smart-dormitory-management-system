package com.sdms.backend.config;

import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Cấu hình các Bean quan trọng cho việc xác thực (Authentication).
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final UserAccountRepository userAccountRepository;

    /**
     * Định nghĩa dịch vụ tải thông tin người dùng.
     * Được sử dụng bởi DaoAuthenticationProvider để lấy thông tin chi tiết của người dùng
     * trong quá trình xác thực.
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng với tên đăng nhập: " + username));
    }

    /**
     * Định nghĩa thuật toán mã hóa mật khẩu.
     * BCrypt là thuật toán băm mật khẩu mạnh, đảm bảo an toàn khi lưu trữ.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Cấu hình Provider chính để xử lý xác thực.
     * Kết nối giữa UserDetailsService (lấy user) và PasswordEncoder (so khớp mật khẩu).
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService());
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Cung cấp AuthenticationManager để quản lý toàn bộ quy trình xác thực.
     * Đây là cửa ngõ chính của Spring Security, được AuthService sử dụng để xử lý đăng nhập.
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}