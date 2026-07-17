package com.sdms.backend.modules.user.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;

/**
 * DOMAIN ROLE:
 * Thực thể quản lý định danh và xác thực người dùng trong hệ thống.
 * Tích hợp trực tiếp với Spring Security thông qua UserDetails.
 *
 * LIFECYCLE:
 * PENDING_ACTIVATION (Chờ kích hoạt)
 * ↓
 * ACTIVE (Hoạt động)
 * ↓
 * LOCKED (Bị khóa)
 *
 * BUSINESS PURPOSE:
 * - Cung cấp cơ chế đăng nhập linh hoạt (Username hoặc Email).
 * - Quản lý quyền hạn (Role) và trạng thái tài khoản.
 * - Làm cầu nối (Bridge) để gán thông tin sinh viên vào tài khoản đăng nhập.
 * - ADMIN và STAFF sẽ không có liên kết với Student.
 *
 * ARCHITECTURAL NOTE:
 * - Username: Định danh hệ thống duy nhất (Bất biến).
 * - Email: Định danh xác thực (Dùng cho Email Verification, Forgot Password).
 * - Thiết kế cho phép đăng nhập đồng thời qua cả Username hoặc Email.
 */
@Entity
@Table(name = "user_accounts")
@org.hibernate.annotations.SQLDelete(sql = "UPDATE user_accounts SET is_deleted = true WHERE account_id=?")
@org.hibernate.annotations.SQLRestriction("is_deleted = false")
@Getter
@Setter
public class UserAccount extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID accountId;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccountStatus status = AccountStatus.ACTIVE;

    private LocalDateTime lastLogin;

    /**
     * Access Token Refresh mechanism
     */
    @Column(length = 500)
    private String refreshToken;

    private LocalDateTime refreshTokenExpiry;

    /**
     * Password Reset Flow (Phase 5)
     */
    @Column(name = "reset_password_token")
    private String resetPasswordToken;

    @Column(name = "reset_password_expiry")
    private LocalDateTime resetPasswordExpiry;

    /**
     * Brute-Force Protection Mechanism
     */
    @Column(name = "failed_login_attempts", nullable = false)
    private Integer failedLoginAttempts = 0;

    @Column(name = "lock_time")
    private LocalDateTime lockTime;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", unique = true)
    private Student student;


    /**
     * Chuyển đổi Role của hệ thống thành GrantedAuthority của Spring Security.
     * Tự động thêm tiền tố "ROLE_" theo chuẩn.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> authorities = new ArrayList<>();
        
        // 1. Gán Base Role
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role.name()));
        
        // 2. Gán Granular Capabilities (Tối ưu cho đồ án không có Database RBAC động)
        if (role == Role.ADMIN) {
            // ADMIN có toàn quyền hệ thống (bao gồm cấu hình rủi ro cao)
            authorities.add(new SimpleGrantedAuthority("MANAGE_CURFEW_POLICY"));
            authorities.add(new SimpleGrantedAuthority("MANAGE_TIME_WINDOW_POLICY"));
            authorities.add(new SimpleGrantedAuthority("VIEW_ACCESS_HISTORY"));
            authorities.add(new SimpleGrantedAuthority("REMOTE_UNLOCK"));
            authorities.add(new SimpleGrantedAuthority("EMERGENCY_OVERRIDE"));
        } else if (role == Role.STAFF) {
            // STAFF (Ban quản lý) chỉ được xem lịch sử và mở cổng hỗ trợ sinh viên
            // Không được quyền can thiệp Emergency Lockdown hay Sửa Giờ giới nghiêm
            authorities.add(new SimpleGrantedAuthority("VIEW_ACCESS_HISTORY"));
            authorities.add(new SimpleGrantedAuthority("REMOTE_UNLOCK"));
        }
        
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    /**
     * SDMS V1 không áp dụng logic hết hạn tài khoản.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Xác định tài khoản có bị khóa hay không.
     * Liên kết trực tiếp với trạng thái LOCKED của hệ thống.
     */
    @Override
    public boolean isAccountNonLocked() {
        return this.status != AccountStatus.LOCKED;
    }

    /**
     * SDMS V1 không áp dụng logic hết hạn mật khẩu.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Xác định tài khoản có đang hoạt động hay không.
     * Chỉ những tài khoản có trạng thái ACTIVE mới được phép đăng nhập.
     */
    @Override
    public boolean isEnabled() {
        return this.status == AccountStatus.ACTIVE;
    }
}
