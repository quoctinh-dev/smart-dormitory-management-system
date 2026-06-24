// 📄 Đường dẫn chuẩn: src/main/java/com/sdms/backend/modules/user/event/StudentCreatedEventListener.java
package com.sdms.backend.modules.user.event;

import com.sdms.backend.common.service.EmailService;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.student.event.StudentCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
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
    @EventListener
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
                <html>
                <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                        <h2 style="color: #1a73e8; text-align: center;">Chúc Mừng Bạn Đã Đăng Ký Nội Trú Thành Công!</h2>
                        <p>Xin chào <strong>%s</strong>,</p>
                        <p>Hệ thống Ký túc xá SDMS đã ghi nhận khoản thanh toán tiền phòng của bạn. Tài khoản định danh cư dân nội trú của bạn đã sẵn sàng:</p>
                        <table style="margin: 20px 0; background-color: #f1f3f4; padding: 15px; border-radius: 5px; width: 100%;">
                            <tr><td><strong>Tên đăng nhập:</strong></td><td>%s</td></tr>
                            <tr><td><strong>Mật khẩu tạm thời:</strong></td><td>Chính là số CCCD của bạn</td></tr>
                        </table>
                        <p>Vui lòng bấm vào nút bên dưới để tiến hành kích hoạt tài khoản và thiết lập mật khẩu chính thức trước khi đến KTX nhận phòng:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="%s" style="background-color: #1a73e8; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                                Kích Hoạt Tài Khoản Ngay
                            </a>
                        </div>
                        <p style="color: #5f6368; font-size: 12px; text-align: center;">Đây là email tự động từ Hệ thống Quản lý Ký túc xá SDMS, vui lòng không phản hồi email này.</p>
                    </div>
                </body>
                </html>
            """.formatted(student.getFullName(), student.getCccd(), activationLink); // 🌟 FIX ĐỒNG BỘ: Username trả về dạng CCCD phẳng khớp code login

            emailService.sendNotificationEmail(student.getEmail(), "[SDMS] Thông báo cấp tài khoản cư dân Ký túc xá", htmlContent);
            log.info("[StudentCreatedEventListener] Email kích hoạt tài khoản đã gửi thành công tới: {}", student.getEmail());

        } catch (Exception e) {
            log.error("[StudentCreatedEventListener] Lỗi khi gửi email kích hoạt: {}", e.getMessage());
        }
    }
}