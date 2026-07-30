// 📄 Đường dẫn chuẩn: src/main/java/com/sdms/backend/modules/user/event/StudentCreatedEventListener.java
package com.sdms.backend.modules.user.event;

import com.sdms.backend.common.service.EmailService;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.student.event.StudentCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentCreatedEventListener {

    private final StudentRepository studentRepository;
    private final EmailService emailService;

    /**
     * Lắng nghe sự kiện Sinh viên đã được provisioning thành công sau thanh toán.
     * Nhiệm vụ duy nhất: Gửi email hướng dẫn kích hoạt tài khoản bằng Async (Bất đồng bộ).
     */
    @Async("taskExecutor") // Chạy Thread riêng để không làm chậm luồng phản hồi thanh toán
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleStudentCreatedEvent(StudentCreatedEvent event) {
        log.info("[StudentCreatedEventListener] Đang chuẩn bị gửi email kích hoạt cho studentId={}", event.getStudentId());

        Optional<Student> studentOpt = studentRepository.findById(event.getStudentId());
        if (studentOpt.isEmpty()) {
            log.error("[StudentCreatedEventListener] Không tìm thấy dữ liệu sinh viên để gửi email.");
            return;
        }

        Student student = studentOpt.get();

        try {
            String activationLink = "http://localhost:3000/activate-account";
            String htmlContent = """
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
                        .header h2 { margin: 0; font-weight: 800; font-size: 22px; }
                        .content { padding: 35px 30px; }
                        .info-table { width: 100%%; background-color: #f1f5f9; border-radius: 12px; padding: 16px; border-collapse: collapse; margin: 20px 0; }
                        .info-table td { padding: 6px 8px; font-size: 15px; }
                        .btn-wrapper { text-align: center; margin: 30px 0; }
                        .btn { background-color: #2563eb; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 8px; font-weight: 700; display: inline-block; font-size: 15px; }
                        .footer { background-color: #1e293b; padding: 20px; text-align: center; font-size: 13px; color: #cbd5e1; }
                        .footer p { margin: 0; }
                        @media only screen and (max-width: 600px) {
                            .wrapper { padding: 10px 5px; }
                            .header { padding: 20px 15px; }
                            .header h2 { font-size: 18px; }
                            .content { padding: 20px 15px; }
                            .btn { padding: 10px 20px; font-size: 14px; }
                        }
                    </style>
                </head>
                <body>
                <div class="wrapper">
                    <div class="container">
                        <div class="header">
                            <h2>🎉 CHÚC MỪNG! TÀI KHOẢN CƯ DÂN ĐÃ SẴN SÀNG</h2>
                        </div>
                        <div class="content">
                            <p style="font-size: 16px; margin-top: 0; color: #475569;">Xin chào <strong style="color: #0f172a;">%s</strong>,</p>
                            <p style="color: #475569; font-size: 15px;">Hệ thống SDMS đã ghi nhận khoản thanh toán tiền phòng của bạn. Tài khoản định danh cư dân nội trú đã sẵn sàng để kích hoạt:</p>
                            <table class="info-table">
                                <tr>
                                    <td><strong>Tên đăng nhập:</strong></td>
                                    <td style="color: #2563eb;"><strong>%s</strong></td>
                                </tr>
                                <tr>
                                    <td><strong>Mật khẩu tạm thời:</strong></td>
                                    <td>Số CCCD của bạn</td>
                                </tr>
                            </table>
                            <p style="color: #475569; font-size: 15px;">Vui lòng bấm vào nút bên dưới để kích hoạt tài khoản và thiết lập mật khẩu chính thức trước khi đến KTX nhận phòng:</p>
                            <div class="btn-wrapper">
                                <a href="%s" class="btn">Kích Hoạt Tài Khoản Ngay →</a>
                            </div>
                        </div>
                        <div class="footer">
                            <p>Đây là email tự động từ hệ thống SDMS. Vui lòng không trả lời thư này.</p>
                        </div>
                    </div>
                </div>
                </body>
                </html>
            """.formatted(student.getFullName(), student.getCccd(), activationLink);

            emailService.sendNotificationEmail(student.getEmail(), "[SDMS] Thông báo cấp tài khoản cư dân Ký túc xá", htmlContent);
            log.info("[StudentCreatedEventListener] Email kích hoạt tài khoản đã gửi thành công tới: {}", student.getEmail());

        } catch (Exception e) {
            log.error("[StudentCreatedEventListener] Lỗi khi gửi email kích hoạt: {}", e.getMessage());
        }
    }
}