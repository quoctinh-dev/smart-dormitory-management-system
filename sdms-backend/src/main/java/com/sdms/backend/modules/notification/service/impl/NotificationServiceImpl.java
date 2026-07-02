package com.sdms.backend.modules.notification.service.impl;

import com.sdms.backend.common.service.EmailService;
import com.sdms.backend.modules.notification.entity.NotificationDeliveryHistory;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationStatus;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.notification.repository.NotificationDeliveryHistoryRepository;
import com.sdms.backend.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

/**
 * Mục tiêu/Nghiệp vụ: Dịch vụ trung tâm phụ trách gửi các loại thông báo (Email nhắc nợ, Email báo đậu KTX, v.v) và lưu vết (Audit Log) lại toàn bộ lịch sử gửi để phục vụ truy thu, tra soát.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Sử dụng Template Engine (Thymeleaf) để sinh mã HTML động. Tích hợp với dịch vụ EmailService được đánh dấu `@Async` để đẩy việc gọi API HTTP bên thứ 3 (Brevo/SendGrid) sang một Thread Pool riêng biệt.
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích về khối finally: Ở khối finally cuối hàm, tác giả bọc thêm try-catch cho lệnh `historyRepository.save(history)`. Điều này để đảm bảo nguyên lý Fault Tolerance (Khoan dung lỗi) tuyệt đối: Ngay cả khi DB bị sập hoặc quá tải không thể ghi log lịch sử, luồng nghiệp vụ chính (ví dụ duyệt đơn) vẫn không bị Exception đánh gục, đảm bảo High Availability (Tính sẵn sàng cao).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final EmailService emailService;
    private final NotificationDeliveryHistoryRepository historyRepository;
    private final TemplateEngine templateEngine;

    @Override
    public void sendHtmlEmail(String toEmail, String title, String templateName, Map<String, Object> variables, NotificationType type) {
        String htmlContent = "";

        // 1. Khởi tạo đối tượng lịch sử để chuẩn bị lưu log DB
        NotificationDeliveryHistory history = NotificationDeliveryHistory.builder()
                .recipient(toEmail)
                .channel(NotificationChannel.EMAIL)
                .type(type)
                .status(NotificationStatus.PENDING) // Đặt trạng thái ban đầu là PENDING
                .build();

        try {
            // 2. Biên dịch dữ liệu động vào Template HTML thông qua Thymeleaf Context
            Context context = new Context();
            if (variables != null) {
                context.setVariables(variables);
            }

            // Đường dẫn trỏ chính xác vào thư mục con: templates/notification/
            htmlContent = templateEngine.process("notification/" + templateName, context);
            history.setPayloadSnapshot("{\"templateName\": \"" + templateName + "\"}");

            // 3. Gọi phương thức gửi Email bất đồng bộ (@Async) qua API của Brevo
            emailService.sendNotificationEmail(toEmail, title, htmlContent);

            // Nếu đẩy sang luồng ngầm thành công, đánh dấu trạng thái SENT (Đã gửi đi từ phía hệ thống)
            history.setStatus(NotificationStatus.SENT);
            log.info("Notification: Đã chuyển yêu cầu gửi email mẫu [{}] tới thành công cho: {}", templateName, toEmail);

        } catch (Exception e) {
            history.setStatus(NotificationStatus.FAILED);
            history.setErrorMessage(e.getMessage());
            // Ghi nhận nội dung tối thiểu nếu render lỗi để admin có thể đối soát
            if (history.getPayloadSnapshot() == null) {
                history.setPayloadSnapshot("Lỗi xảy ra trong quá trình biên dịch Template: " + templateName);
            }
            log.error("Notification: Lỗi biên dịch hoặc đẩy luồng gửi email tới {}: {}", toEmail, e.getMessage());
        } finally {
            try {
                // 4. Luôn luôn lưu vết vào cơ sở dữ liệu (Bọc thêm try-catch nhỏ để cô lập tuyệt đối, tránh lỗi DB làm hỏng luồng logic)
                historyRepository.save(history);
            } catch (Exception dbEx) {
                log.error("Notification: Không thể lưu lịch sử thông báo vào DB. Lý do: {}", dbEx.getMessage());
            }
        }
    }
}