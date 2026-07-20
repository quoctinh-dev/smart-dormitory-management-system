package com.sdms.backend.common.seeder;

import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Trình khởi tạo dữ liệu (Seeder) cấp phát tài khoản Quản trị viên (Admin) khởi thủy.
 * 
 * Kiến trúc & Bảo mật:
 * - Ứng dụng ApplicationRunner để tự động thực thi chuỗi logic ngay sau khi Spring Context khởi tạo hoàn tất.
 * - Cơ chế chốt chặn (Guard Clause): Sử dụng @Profile("!prod") để ngăn chặn tuyệt đối rủi ro lộ lọt
 *   tài khoản mật khẩu mặc định trên môi trường Production, phòng chống lỗ hổng leo thang đặc quyền.
 * - Cơ chế lũy đẳng (Idempotency): Chủ động kiểm tra sự tồn tại của tài khoản trước khi ghi,
 *   đảm bảo quá trình triển khai nhiều lần không gây trùng lặp hay xung đột dữ liệu.
 */
@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!prod") // Quan trọng: Chỉ chạy seeder khi không ở môi trường production
public class UserSeeder implements ApplicationRunner {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) throws Exception {
        if (userAccountRepository.findByRole(Role.ADMIN).isEmpty()) {
            log.info("No ADMIN account found. Initializing seed data...");
            seedAdminUser();
            log.info("Admin Seed data initialized successfully.");
        } else {
            log.info("Admin account already exists. Skipping Admin seed data.");
        }
    }

    private void seedAdminUser() {
        UserAccount admin = new UserAccount();
        admin.setUsername("admin");
        admin.setEmail("admin@sdms.com");
        admin.setPassword(passwordEncoder.encode("Admin@123"));
        admin.setRole(Role.ADMIN);
        admin.setStatus(AccountStatus.ACTIVE);
        userAccountRepository.save(admin);
        log.info("Created ADMIN user with email: admin@sdms.com and password: Admin@123");
    }
}
