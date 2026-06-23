package com.sdms.backend.modules.auth.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.service.EmailService;
import com.sdms.backend.config.AppProperties;
import com.sdms.backend.config.JwtConfig;
import com.sdms.backend.modules.auth.dto.request.ActivateAccountRequest;
import com.sdms.backend.modules.auth.dto.request.ChangePasswordRequest;
import com.sdms.backend.modules.auth.dto.request.ForgotPasswordRequest;
import com.sdms.backend.modules.auth.dto.request.LoginRequest;
import com.sdms.backend.modules.auth.dto.request.ResetPasswordRequest;
import com.sdms.backend.modules.auth.dto.response.AuthResponse;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Optional;

/**
 * Service xử lý các nghiệp vụ xác thực và quản lý tài khoản.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtConfig jwtConfig;
    private final AppProperties appProperties;
    private final EmailService emailService;

    /**
     * Kích hoạt tài khoản cư dân đăng nhập lần đầu sử dụng thông tin định danh Email.
     */
    @Transactional
    public AuthResponse activate(ActivateAccountRequest request) {
        // 1. Tìm kiếm tài khoản bằng Email và khóa dòng dữ liệu PESSIMISTIC_WRITE để tránh Double Activation
        UserAccount account = userAccountRepository.findByEmailForUpdate(request.getEmail().trim())
                .orElseThrow(() -> new AppException("Tài khoản không tồn tại trên hệ thống", HttpStatus.UNAUTHORIZED));

        // 2. Chỉ cho phép các tài khoản có trạng thái PENDING_ACTIVATION được thực hiện kích hoạt
        if (account.getStatus() == AccountStatus.ACTIVE) {
            throw new AppException("Tài khoản đã được kích hoạt từ trước", HttpStatus.BAD_REQUEST);
        }
        if (account.getStatus() == AccountStatus.LOCKED) {
            throw new AppException("Tài khoản đã bị khóa, không thể kích hoạt", HttpStatus.BAD_REQUEST);
        }
        if (account.getStatus() != AccountStatus.PENDING_ACTIVATION) {
            throw new AppException("Trạng thái tài khoản không hợp lệ", HttpStatus.BAD_REQUEST);
        }

        // 3. Đối chiếu mật khẩu tạm thời (Số CCCD của sinh viên đã băm BCrypt)
        if (!passwordEncoder.matches(request.getTempPassword(), account.getPassword())) {
            throw new AppException("Mật khẩu tạm thời không chính xác", HttpStatus.UNAUTHORIZED);
        }

        // 4. Mã hóa mật khẩu mới và cập nhật trạng thái tài khoản sang ACTIVE
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        account.setStatus(AccountStatus.ACTIVE);

        // 5. Thu hồi toàn bộ token cũ
        revokeTokens(account);

        // 6. Cấp phát và lưu trữ Refresh Token mới, cập nhật lastLogin
        return generateAndSaveTokens(account);
    }

    /**
     * Xác thực người dùng và cấp phát Token.
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();

        Optional<UserAccount> accountOpt = identifier.contains("@")
                ? userAccountRepository.findByEmail(identifier)
                : userAccountRepository.findByUsername(identifier);

        UserAccount account = accountOpt.orElseThrow(() ->
                new AppException("Invalid username or password", HttpStatus.UNAUTHORIZED));

        if (account.getStatus() == AccountStatus.PENDING_ACTIVATION) {
            throw new AppException("ACCOUNT_PENDING_ACTIVATION", HttpStatus.FORBIDDEN);
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AppException("Account is not active", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            throw new AppException("Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        return generateAndSaveTokens(account);
    }

    /**
     * Cấp mới Access Token thông qua Refresh Token hợp lệ (xoay vòng token).
     */
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        jwtService.validateRefreshToken(refreshToken);
        String username = jwtService.extractUsernameFromRefreshToken(refreshToken);

        UserAccount account = userAccountRepository.findByUsername(username)
                .orElseThrow(() -> new AppException("Account not found", HttpStatus.NOT_FOUND));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AppException("Account is not active", HttpStatus.FORBIDDEN);
        }

        if (account.getRefreshToken() == null || !account.getRefreshToken().equals(refreshToken)) {
            revokeTokens(account); // Thu hồi token nếu phát hiện bất thường
            userAccountRepository.save(account);
            throw new AppException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
        }

        return generateAndSaveTokens(account);
    }

    /**
     * Đăng xuất người dùng hiện tại bằng cách xóa Refresh Token.
     */
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public void logout() {
        UserAccount account = getCurrentUserAccount();
        revokeTokens(account);
        userAccountRepository.save(account);
    }

    /**
     * Thay đổi mật khẩu cho người dùng đang đăng nhập.
     */
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        UserAccount account = getCurrentUserAccount();

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new AppException("Old password is incorrect", HttpStatus.BAD_REQUEST);
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        revokeTokens(account); // Buộc đăng nhập lại trên tất cả thiết bị
        userAccountRepository.save(account);
    }

    /**
     * Tạo mã khôi phục mật khẩu và gửi qua Email (Phase 5).
     */
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<UserAccount> accountOpt = userAccountRepository.findByEmail(request.getEmail().trim());

        if (accountOpt.isEmpty()) {
            // Bảo mật: Không tiết lộ email có tồn tại hay không.
            log.info("Password reset requested for non-existent email: {}", request.getEmail());
            return; 
        }

        UserAccount account = accountOpt.get();

        // 1. Tạo Raw Token an toàn (32 bytes -> Base64URL)
        String rawToken = generateSecureToken();

        // 2. Hash Raw Token bằng SHA-256
        String hashedToken = hashToken(rawToken);

        // 3. Lưu Hashed Token và thời gian hết hạn (15 phút) vào DB
        account.setResetPasswordToken(hashedToken);
        account.setResetPasswordExpiry(LocalDateTime.now().plusMinutes(15));
        userAccountRepository.save(account);

        // 4. Xây dựng Frontend URL chứa Raw Token
        String resetLink = String.format("%s/reset-password?token=%s", appProperties.getFrontendUrl(), rawToken);

        // 5. Build HTML Email
        String htmlContent = buildResetPasswordEmail(resetLink);

        // 6. Gửi email
        emailService.sendCriticalEmail(account.getEmail(), "Password Reset Request", htmlContent);
        
        log.info("Password reset email sent to {}", account.getEmail());
    }

    /**
     * Đặt lại mật khẩu sử dụng token hợp lệ.
     */
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        // 1. Hash Raw Token từ request
        String hashedToken = hashToken(request.getToken());

        // 2. Tìm UserAccount bằng Hashed Token
        UserAccount account = userAccountRepository.findByResetPasswordToken(hashedToken)
                .orElseThrow(() -> new AppException("Invalid or expired password reset token", HttpStatus.BAD_REQUEST));

        // 3. Kiểm tra thời gian hết hạn
        if (account.getResetPasswordExpiry() == null || account.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException("Invalid or expired password reset token", HttpStatus.BAD_REQUEST);
        }

        // 4. Đổi mật khẩu mới
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));

        // 5. Xóa Token reset password (chỉ dùng 1 lần)
        account.setResetPasswordToken(null);
        account.setResetPasswordExpiry(null);

        // 6. Thu hồi toàn bộ session hiện tại (buộc người dùng phải đăng nhập lại)
        revokeTokens(account);

        // 7. Lưu thay đổi
        userAccountRepository.save(account);
        log.info("Password successfully reset for account ID: {}", account.getAccountId());
    }

    // =========================================================================================
    // PRIVATE HELPER METHODS
    // =========================================================================================

    private UserAccount getCurrentUserAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserAccount)) {
            throw new AppException("User is not authenticated", HttpStatus.UNAUTHORIZED);
        }
        return (UserAccount) authentication.getPrincipal();
    }

    private AuthResponse generateAndSaveTokens(UserAccount account) {
        String accessToken = jwtService.generateAccessToken(account);
        String refreshToken = jwtService.generateRefreshToken(account);

        account.setRefreshToken(refreshToken);
        account.setRefreshTokenExpiry(LocalDateTime.now().plus(jwtConfig.getRefreshExpiration(), ChronoUnit.MILLIS));
        account.setLastLogin(LocalDateTime.now());
        
        userAccountRepository.save(account);

        return new AuthResponse(accessToken, refreshToken);
    }

    private void revokeTokens(UserAccount account) {
        account.setRefreshToken(null);
        account.setRefreshTokenExpiry(null);
    }

    /**
     * Tạo một token ngẫu nhiên an toàn bằng SecureRandom.
     */
    private String generateSecureToken() {
        byte[] randomBytes = new byte[32]; // 256 bits
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Hash token bằng thuật toán SHA-256 để lưu vào DB.
     */
    private String hashToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] encodedHash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(encodedHash);
        } catch (NoSuchAlgorithmException e) {
            log.error("SHA-256 algorithm not found", e);
            throw new AppException("Internal server error during token generation", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Chuyển đổi mảng byte sang chuỗi Hex.
     */
    private String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }

    /**
     * Mẫu Email HTML cho chức năng Reset Password.
     */
    private String buildResetPasswordEmail(String resetLink) {
        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                        <h2 style="color: #333333; text-align: center;">Reset Your Password</h2>
                        <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                            We received a request to reset your password. Click the button below to choose a new one.
                        </p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background-color: #007bff; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                                Reset Password
                            </a>
                        </div>
                        <p style="color: #777777; font-size: 14px; text-align: center;">
                            This link will expire in <strong>15 minutes</strong>.<br>
                            If you did not request a password reset, please ignore this email.
                        </p>
                    </div>
                </body>
                </html>
                """.formatted(resetLink);
    }
}