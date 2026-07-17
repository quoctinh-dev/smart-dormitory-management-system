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
 * Lớp cấu hình lõi (Core Configuration) cho bảo mật và xác thực (Authentication).
 * Thiết lập các thành phần nền tảng của Spring Security như cơ chế băm mật khẩu
 * và nhà cung cấp quy trình xác thực.
 */
@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {
    /**
     * Khởi tạo bộ băm mật khẩu (Password Encoder) sử dụng thuật toán BCrypt.
     * Thuật toán này tự động tạo salt (muối ngẫu nhiên) để chống lại các cuộc tấn công dò mật khẩu.
     *
     * @return Đối tượng mã hóa mật khẩu BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    /**
     * Cấu hình nhà cung cấp xác thực (Authentication Provider).
     * Liên kết UserDetailsService (truy xuất thông tin người dùng) và PasswordEncoder (kiểm tra mật khẩu)
     * để Spring Security thực thi quy trình đăng nhập đồng bộ.
     *
     * @param userDetailsService Dịch vụ truy xuất chi tiết tài khoản
     * @return Đối tượng DaoAuthenticationProvider đã được thiết lập
     */
    @Bean
    public AuthenticationProvider authenticationProvider(UserDetailsService userDetailsService) {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Cung cấp AuthenticationManager, thành phần trung tâm quản lý toàn bộ vòng đời xác thực.
     * 
     * @param config Cấu hình xác thực mặc định từ Spring Security
     * @return Đối tượng quản lý xác thực (AuthenticationManager)
     * @throws Exception nếu xảy ra lỗi trong quá trình khởi tạo
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
