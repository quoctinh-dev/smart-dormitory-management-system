package com.sdms.backend.modules.auth.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
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
        // 1. Tìm kiếm tài khoản bằng Mã sinh viên (username) và khóa dòng dữ liệu PESSIMISTIC_WRITE để tránh Double Activation
        UserAccount account = userAccountRepository.findByUsernameForUpdate(request.getStudentCode().trim())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS, "Tài khoản không tồn tại trên hệ thống"));

        // 2. Chỉ cho phép các tài khoản có trạng thái PENDING_ACTIVATION được thực hiện kích hoạt
        if (account.getStatus() == AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_ALREADY_ACTIVE);
        }
        if (account.getStatus() == AccountStatus.LOCKED) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }
        if (account.getStatus() != AccountStatus.PENDING_ACTIVATION) {
            throw new AppException(ErrorCode.ACCOUNT_PENDING_ACTIVATION, "Trạng thái tài khoản không hợp lệ");
        }

        // 3. Đối chiếu mật khẩu tạm thời (Số CCCD của sinh viên đã băm BCrypt)
        if (!passwordEncoder.matches(request.getTempPassword(), account.getPassword())) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mật khẩu tạm thời không chính xác");
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
                new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (account.getStatus() == AccountStatus.PENDING_ACTIVATION) {
            throw new AppException(ErrorCode.ACCOUNT_PENDING_ACTIVATION);
        }

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        // Kiểm tra số lần đăng nhập thất bại và thời gian khóa tài khoản
        if (account.getLockTime() != null) {
            if (account.getLockTime().isAfter(LocalDateTime.now())) {
                throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản bị khóa tạm thời do sai mật khẩu quá nhiều lần. Vui lòng thử lại sau.");
            } else {
                account.setFailedLoginAttempts(0);
                account.setLockTime(null);
            }
        }

        if (!passwordEncoder.matches(request.getPassword(), account.getPassword())) {
            int attempts = account.getFailedLoginAttempts() != null ? account.getFailedLoginAttempts() + 1 : 1;
            account.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                account.setLockTime(LocalDateTime.now().plusMinutes(15));
                userAccountRepository.save(account);
                throw new AppException(ErrorCode.ACCOUNT_LOCKED, "Tài khoản đã bị khóa 15 phút do sai mật khẩu quá 5 lần.");
            }
            userAccountRepository.save(account);
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }

        // Reset số lần đăng nhập thất bại và thời gian khóa khi đăng nhập thành công
        account.setFailedLoginAttempts(0);
        account.setLockTime(null);

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
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.ACCOUNT_LOCKED);
        }

        if (account.getRefreshToken() == null || !account.getRefreshToken().equals(refreshToken)) {
            revokeTokens(account); // Thu hồi token nếu phát hiện bất thường
            userAccountRepository.save(account);
            throw new AppException(ErrorCode.REFRESH_TOKEN_REVOKED);
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
            throw new AppException(ErrorCode.INVALID_PASSWORD);
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        revokeTokens(account); // Thu hồi toàn bộ session hiện tại (buộc người dùng phải đăng nhập lại)
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
                .orElseThrow(() -> new AppException(ErrorCode.TOKEN_INVALID_OR_EXPIRED));

        // 3. Kiểm tra thời gian hết hạn
        if (account.getResetPasswordExpiry() == null || account.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.TOKEN_INVALID_OR_EXPIRED);
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
            throw new AppException(ErrorCode.UNAUTHORIZED);
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
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR);
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

    private String buildResetPasswordEmail(String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 0; }
                    .wrapper { background-color: #f8fafc; padding: 20px 10px; }
                    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05); }
                    .header { background-color: #2563eb; color: #ffffff; padding: 30px 25px; text-align: center; }
                    .header h2 { margin: 0; font-weight: 800; letter-spacing: -1px; font-size: 24px; }
                    .content { padding: 35px 30px; }
                    .btn-wrapper { text-align: center; margin: 30px 0; }
                    .btn { background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; }
                    .warning-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 20px; border-radius: 12px; }
                    .footer { background-color: #1e293b; padding: 20px; text-align: center; font-size: 13px; color: #cbd5e1; border-top: 1px solid #e2e8f0; }
                    .footer p { margin: 0; }
                    @media only screen and (max-width: 600px) {
                        .wrapper { padding: 10px 5px; }
                        .header { padding: 20px 15px; }
                        .header h2 { font-size: 20px; }
                        .content { padding: 20px 15px; }
                        .btn { padding: 10px 20px; font-size: 14px; }
                    }
                </style>
            </head>
            <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h2>KÝ TÚC XÁ THÔNG MINH (SDMS)</h2>
                    </div>
                    <div class="content">
                        <h3 style="color: #0f172a; margin-top: 0; font-size: 18px;">Khôi phục mật khẩu của bạn</h3>
                        <p style="font-size: 15px; color: #475569;">
                            Chúng tôi đã nhận được yêu cầu khôi phục mật khẩu từ bạn. Vui lòng nhấn vào nút bên dưới để tiến hành đổi mật khẩu mới.
                        </p>
                        <div class="btn-wrapper">
                            <a href="%s" class="btn">Đặt lại Mật khẩu</a>
                        </div>
                        <div class="warning-box">
                            <strong style="color: #b45309; font-size: 15px;">Lưu ý:</strong>
                            <p style="margin: 6px 0 0 0; color: #92400e; font-size: 14px;">Đường link này sẽ tự động hết hạn sau <strong>15 phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này để đảm bảo an toàn.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Đây là thông báo tự động từ hệ thống SDMS. Vui lòng không trả lời thư này.</p>
                    </div>
                </div>
            </div>
            </body>
            </html>
            """.formatted(resetLink);
    }
}
