package com.sdms.backend.config;

import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tối ưu Luận văn (Thesis Optimization):
 * Đảm bảo hệ thống luôn khởi tạo được tài khoản Admin mặc định khi deploy lên database trắng.
 * Điều này giúp Hội đồng chấm thi có thể chạy dự án ngay lập tức mà không cần chèn Script SQL thủ công.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userAccountRepository.count() == 0) {
            log.info("Database is empty. Seeding default ADMIN account...");
            UserAccount admin = new UserAccount();
            admin.setUsername("admin");
            admin.setEmail("admin@sdms.com");
            // Mật khẩu mặc định tuân thủ Pattern bảo mật: 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setRole(Role.ADMIN);
            admin.setStatus(AccountStatus.ACTIVE);
            userAccountRepository.save(admin);
            log.info("Default ADMIN account seeded successfully. Username: admin / Password: Admin@123");
        }
    }
}
