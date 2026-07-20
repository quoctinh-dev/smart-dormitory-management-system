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
 * Service quản lý chu trình bảo mật OTP (One-Time Password) cho đợt đăng ký KTX.
 * <p>
 * Đảm nhiệm các chức năng: Sinh mã ngẫu nhiên bảo mật cao, lưu trữ và thiết lập vòng đời
 * mã trên Redis, áp dụng cơ chế chặn spam (Rate Limiting/Cooldown), cấu trúc giao diện Email HTML
 * và xác thực OTP đầu vào của sinh viên.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationOtpService {

    private final StringRedisTemplate redisTemplate;
    private final EmailService emailService;

    /** Tiền tố khóa lưu trữ mã OTP của sinh viên trong Redis */
    private static final String OTP_PREFIX = "registration_otp:";

    /** Tiền tố khóa chặn gửi lại OTP liên tục (Chống spam) trong Redis */
    private static final String OTP_COOLDOWN_PREFIX = "registration_otp_cooldown:";

    /** Thời gian hết hạn của mã OTP (5 phút) */
    private static final int OTP_EXPIRATION_MINUTES = 5;

    /** Thời gian giãn cách tối thiểu giữa 2 lần yêu cầu mã mới (60 giây) */
    private static final int OTP_COOLDOWN_SECONDS = 60;

    /** Khởi tạo bộ sinh số ngẫu nhiên bảo mật cao (Thread-safe) */
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * Tạo mã OTP mới và tiến hành gửi Email xác thực cho sinh viên.
     * <p>
     * Quy trình xử lý bao gồm:
     * 1. Kiểm tra định dạng Email (Chỉ chấp nhận domain nội bộ Đại học Công nghệ Sài Gòn - STU).<br>
     * 2. Kiểm tra thời gian Cooldown (Nếu click gửi lại quá nhanh sẽ bị chặn).<br>
     * 3. Sinh chuỗi mã số ngẫu nhiên.<br>
     * 4. Gửi nội dung Email HTML dạng Critical thông qua hạ tầng Mail Service.<br>
     * 5. Đẩy mã vào Redis Cache cấu hình TTL 5 phút và kích hoạt khóa Cooldown 60 giây.
     * </p>
     *
     * @param email Email đích nhận mã xác thực (Yêu cầu hậu tố @student.stu.edu.vn)
     * @throws AppException Nếu định dạng Email không hợp lệ (VALIDATION_FAILED)
     * @throws AppException Nếu yêu cầu lặp lại trong thời gian Cooldown (VALIDATION_FAILED)
     */
    public void generateAndSendOtp(String email) {
        if (email == null || !email.toLowerCase().endsWith("@student.stu.edu.vn")) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hệ thống chỉ chấp nhận Email nội bộ của trường (@student.stu.edu.vn)");
        }

        String cooldownKey = OTP_COOLDOWN_PREFIX + email;
        if (Boolean.TRUE.equals(redisTemplate.hasKey(cooldownKey))) {
            Long ttl = redisTemplate.getExpire(cooldownKey);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Vui lòng đợi " + (ttl != null ? ttl : OTP_COOLDOWN_SECONDS) + " giây trước khi yêu cầu mã OTP mới.");
        }

        // 1. Sinh OTP 6 chữ số mang tính bảo mật cao
        String otp = generateNumericOtp(6);

        // 2. Biên dịch template và gửi Email trước (Đảm bảo mail đi thành công mới lock hạ tầng)
        String htmlContent = buildOtpEmail(otp);
        emailService.sendCriticalEmail(
                email,
                "[SDMS] Mã xác thực đăng ký Ký túc xá",
                htmlContent
        );

        // 3. Đẩy thông tin vào bộ nhớ đệm Redis
        String redisKey = OTP_PREFIX + email;
        redisTemplate.opsForValue().set(redisKey, otp, Duration.ofMinutes(OTP_EXPIRATION_MINUTES));

        // 4. Kích hoạt hàng rào Cooldown chống spam gửi liên tục
        redisTemplate.opsForValue().set(cooldownKey, "locked", Duration.ofSeconds(OTP_COOLDOWN_SECONDS));

        log.info("Đã gửi thành công OTP xác thực đăng ký cho email: {}", email);
    }

    /**
     * Kiểm tra và thẩm định mã OTP do người dùng cung cấp từ Client.
     * <p>
     * Nếu mã trùng khớp hoàn toàn, bản ghi OTP đó sẽ lập tức bị xóa bỏ (Evict)
     * khỏi hệ thống để ngăn chặn triệt để lỗ hổng tấn công phát lại (Replay Attack).
     * </p>
     *
     * @param email Email cần thực hiện xác thực đơn
     * @param otp   Chuỗi mã OTP truyền lên từ Client
     * @throws AppException Nếu mã OTP đã quá hạn hoặc không tồn tại trên hệ thống (TOKEN_INVALID_OR_EXPIRED)
     * @throws AppException Nếu mã OTP nhập vào không khớp với dữ liệu gốc (INVALID_CREDENTIALS)
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

        // OTP hợp lệ -> Triệt tiêu token ngay lập tức chống tái sử dụng dữ liệu cũ
        redisTemplate.delete(redisKey);
    }

    /**
     * Thuật toán sinh mã số ngẫu nhiên bảo mật.
     */
    private String generateNumericOtp(int length) {
        StringBuilder otp = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            otp.append(SECURE_RANDOM.nextInt(10));
        }
        return otp.toString();
    }

    /**
     * Thiết lập cấu trúc giao diện mẫu Email HTML phục vụ gửi mã OTP.
     */
    private String buildOtpEmail(String otp) {
        String rawTemplate = """
                <!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SDMS OTP Verification</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                            background-color: #f0f4f8;
                            background-image: 
                                radial-gradient(at 0%% 0%%, rgba(25, 118, 210, 0.1) 0px, transparent 50%%),
                                radial-gradient(at 100%% 100%%, rgba(3, 169, 244, 0.1) 0px, transparent 50%%);
                            color: #334155;
                            -webkit-font-smoothing: antialiased;
                        }
                        .container { max-width: 600px; margin: 40px auto; padding: 0 20px; }
                        .card { background: #ffffff; border: 1px solid rgba(25, 118, 210, 0.1); border-radius: 16px; padding: 40px; box-shadow: 0 10px 40px -10px rgba(25, 118, 210, 0.1); }
                        .header { text-align: center; margin-bottom: 30px; }
                        .logo { font-size: 32px; font-weight: 800; background: linear-gradient(135deg, #1976d2 0%%, #03a9f4 100%%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 0; letter-spacing: 2px; }
                        .subtitle { color: #64748b; font-size: 14px; margin-top: 8px; font-weight: 500; }
                        .content h2 { font-size: 20px; font-weight: 600; margin-bottom: 16px; color: #1e293b; }
                        .content p { color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px; }
                        .otp-container { text-align: center; margin: 40px 0; }
                        .otp-code { background: linear-gradient(to right, #e0f2fe, #f0f9ff); border: 1px solid #bae6fd; padding: 20px 40px; border-radius: 12px; font-size: 36px; font-weight: 700; letter-spacing: 12px; color: #0369a1; display: inline-block; box-shadow: 0 0 20px rgba(3, 169, 244, 0.1); }
                        .warning-box { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 30px; }
                        .warning-text { color: #b45309; font-size: 14px; line-height: 1.5; margin: 0; }
                        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; }
                        .footer p { color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0; }
                        @media only screen and (max-width: 600px) {
                            .container { margin: 20px auto; }
                            .card { padding: 30px 20px; }
                            .otp-code { font-size: 28px; padding: 15px 25px; letter-spacing: 8px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="card">
                            <div class="header">
                                <h1 class="logo">SDMS</h1>
                                <p class="subtitle">Hệ thống Quản lý Ký túc xá Thông minh</p>
                            </div>
                            <div class="content">
                                <h2>Xác Thực Đăng Ký</h2>
                                <p>Xin chào,</p>
                                <p>Chúng tôi nhận được yêu cầu xác thực từ email của bạn. Để đảm bảo an toàn, vui lòng sử dụng mã OTP dưới đây để hoàn tất bước đăng ký:</p>
                            </div>
                            <div class="otp-container">
                                <div class="otp-code">%s</div>
                            </div>
                            <div class="warning-box">
                                <p class="warning-text">
                                    <span style="font-weight: 600; color: #d97706;">Lưu ý bảo mật:</span> Mã OTP này sẽ hết hiệu lực sau <strong>%d phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai (kể cả nhân viên Ban quản lý KTX) để tránh rủi ro mất dữ liệu.
                                </p>
                            </div>
                            <div class="footer">
                                <p>Đây là email tự động được gửi từ hệ thống SDMS.<br>Vui lòng không phản hồi lại địa chỉ email này.</p>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
                """;
        return String.format(rawTemplate, otp, OTP_EXPIRATION_MINUTES);
    }
}