package com.sdms.backend.modules.registration.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

/**
 * Service xử lý tạo và xác thực OTP đăng ký KTX.
 * Quản lý lưu trữ OTP trong Redis, chống spam resend và gửi email cho sinh viên.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationOtpService {

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    // Key prefix lưu OTP trong Redis
    private static final String OTP_PREFIX = "registration_otp:";

    // Key prefix chặn gửi lại OTP quá nhanh (cooldown)
    private static final String OTP_COOLDOWN_PREFIX = "registration_otp_cooldown:";

    // OTP hết hạn sau 5 phút
    private static final int OTP_EXPIRATION_MINUTES = 5;

    // Khoảng thời gian tối thiểu giữa 2 lần xin mã OTP (60s)
    private static final int OTP_COOLDOWN_SECONDS = 60;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Tạo mã OTP mới và gửi qua email cho sinh viên.
     * Chỉ chấp nhận email sinh viên trường (@student.stu.edu.vn).
     */
    public void generateAndSendOtp(String email) {
        // Validation email đầu vào
        if (email == null || !email.toLowerCase().endsWith("@student.stu.edu.vn")) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hệ thống chỉ chấp nhận Email nội bộ của trường (@student.stu.edu.vn)");
        }

        // Kiểm tra cooldown spam gửi mã
        String cooldownKey = OTP_COOLDOWN_PREFIX + email;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            Long ttl = redisTemplate.getExpire(cooldownKey);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Vui lòng đợi " + (ttl != null ? ttl : OTP_COOLDOWN_SECONDS) + " giây trước khi yêu cầu mã OTP mới.");
        }

        // Sinh mã OTP 6 số
        String otp = generateNumericOtp(6);

        // Gửi email chứa OTP cho sinh viên
        String htmlContent = buildOtpEmail(otp);
        emailService.sendCriticalEmail(
                email,
                "[SDMS] Mã xác thực đăng ký Ký túc xá",
                htmlContent
        );

        // Lưu OTP vào Redis với thời hạn 5 phút
        String redisKey = OTP_PREFIX + email;
        redisTemplate.opsForValue().set(redisKey, otp, Duration.ofMinutes(OTP_EXPIRATION_MINUTES));

        // Set cooldown 60s chống spam
        redisTemplate.opsForValue().set(cooldownKey, "locked", Duration.ofSeconds(OTP_COOLDOWN_SECONDS));

        log.info("Đã gửi mã OTP đăng ký thành công cho email: {}", email);
    }

    /**
     * Kiểm tra mã OTP người dùng nhập vào.
     * Nếu đúng sẽ xóa key trong Redis ngay để tránh dùng lại (replay attack).
     */
    public void verifyOtp(String email, String otp) {
        String redisKey = OTP_PREFIX + email;
        String savedOtp = redisTemplate.opsForValue().get(redisKey);

        if (savedOtp == null) {
            throw new AppException(ErrorCode.TOKEN_INVALID_OR_EXPIRED, "Mã OTP đã hết hạn hoặc không tồn tại.");
        }

        if (!savedOtp.equals(otp)) {
            throw new AppException(ErrorCode.INVALID_CREDENTIALS, "Mã OTP không chính xác.");
        }

        // Xóa OTP ngay sau khi xác thực thành công
        redisTemplate.delete(redisKey);
    }

    /**
     * Sinh chuỗi OTP ngẫu nhiên gồm các chữ số.
     */
    private String generateNumericOtp(int length) {
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Template HTML email gửi mã OTP.
     */
    private String buildOtpEmail(String otp) {
        String rawTemplate = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet">
                <style>
                    body { font-family: "Inter", "Roboto", "Helvetica", "Arial", sans-serif; line-height: 1.6; color: #0f172a; margin: 0; padding: 0; }
                    .wrapper { background-color: #f8fafc; padding: 40px 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.05); }
                    .header { background-color: #2563eb; color: #ffffff; padding: 30px 25px; text-align: center; }
                    .header h2 { margin: 0; font-weight: 800; letter-spacing: -1px; font-size: 24px; }
                    .content { padding: 35px 30px; }
                    .otp-container { text-align: center; margin: 32px 0; }
                    .otp-code { background-color: #eff6ff; border: 1px dashed #bfdbfe; padding: 16px 32px; border-radius: 12px; font-size: 32px; font-weight: 800; letter-spacing: 10px; color: #2563eb; display: inline-block; font-family: monospace; }
                    .warning-box { background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px; margin-top: 20px; border-radius: 12px; }
                    .footer { background-color: #1e293b; padding: 20px; text-align: center; font-size: 13px; color: #cbd5e1; border-top: 1px solid #e2e8f0; }
                    .footer p { margin: 0; }
                </style>
            </head>
            <body>
            <div class="wrapper">
                <div class="container">
                    <div class="header">
                        <h2>KÝ TÚC XÁ THÔNG MINH (SDMS)</h2>
                    </div>
                    <div class="content">
                        <p style="font-size: 16px; margin-top: 0; color: #475569;">
                            Xin chào,
                        </p>
                        <p style="color: #475569; font-size: 15px;">
                            Để hoàn tất quá trình xác thực tài khoản trên hệ thống SDMS, vui lòng nhập mã OTP dưới đây:
                        </p>
                        
                        <div class="otp-container">
                            <div class="otp-code">%s</div>
                        </div>
                        
                        <div class="warning-box">
                            <strong style="color: #b45309; font-size: 15px;">Lưu ý:</strong>
                            <p style="margin: 6px 0 0 0; color: #92400e; font-size: 14px;">Mã có hiệu lực trong <strong>%d phút</strong>. Vui lòng không chia sẻ mã này cho người khác để đảm bảo an toàn cho tài khoản.</p>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Đây là thông báo tự động từ hệ thống SDMS. Vui lòng không trả lời thư này.</p>
                    </div>
                </div>
            </div>
            </body>
            </html>
            """;
        return String.format(rawTemplate, otp, OTP_EXPIRATION_MINUTES);
    }
}