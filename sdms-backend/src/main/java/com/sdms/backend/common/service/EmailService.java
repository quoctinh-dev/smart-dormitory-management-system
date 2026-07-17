package com.sdms.backend.common.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.config.BrevoConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Dịch vụ lõi (Core Service) phụ trách tích hợp và giao tiếp với hệ thống thư điện tử (Brevo SMTP).
 * Thiết kế phân tách rõ ràng hai luồng xử lý: đồng bộ (Synchronous) cho các tác vụ mang tính sống còn
 * và bất đồng bộ (Asynchronous) cho các tác vụ thông báo ngoại vi nhằm tối ưu hóa hiệu năng tổng thể.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final BrevoConfig brevoConfig;
    private final RestTemplate restTemplate;

    /**
     * Gửi thư điện tử thông báo (Notification) không yêu cầu độ tin cậy tuyệt đối.
     * 
     * Kiến trúc: Áp dụng cơ chế thực thi bất đồng bộ (@Async) trên một Thread Pool độc lập.
     * Ngăn chặn tình trạng thắt nút cổ chai (bottleneck) ở luồng xử lý HTTP chính. 
     * Các ngoại lệ phát sinh được cô lập hoàn toàn và ghi log cục bộ, đảm bảo tính liên tục của luồng nghiệp vụ.
     *
     * @param to Địa chỉ email người nhận
     * @param subject Tiêu đề thư
     * @param htmlContent Nội dung thư định dạng HTML
     */
    @Async
    public void sendNotificationEmail(String to, String subject, String htmlContent) {
        try {
            executeSend(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("Failed to send notification email to {}: {}", to, e.getMessage());
        }
    }

    /**
     * Gửi thư điện tử trọng yếu (Critical) đòi hỏi tính chính xác và kịp thời (VD: Mã OTP, Khôi phục mật khẩu).
     * 
     * Kiến trúc: Bắt buộc thực thi đồng bộ (Synchronous). Quy trình này cấu thành một phần không thể tách rời
     * của giao dịch nghiệp vụ. Sự cố gián đoạn từ phía SMTP Server sẽ lập tức phát sinh ngoại lệ (AppException),
     * trực tiếp kích hoạt cơ chế Rollback (nếu có) và báo cáo minh bạch cho hệ thống client.
     *
     * @param to Địa chỉ email người nhận
     * @param subject Tiêu đề thư
     * @param htmlContent Nội dung thư định dạng HTML
     * @throws AppException Ném ra khi đường truyền đến hạ tầng email thất bại
     */
    public void sendCriticalEmail(String to, String subject, String htmlContent) {
        try {
            executeSend(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send critical email to {}: {}", to, e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể gửi email vào lúc này, vui lòng thử lại sau.");
        }
    }

    /**
     * Tầng giao tiếp (Facade) tích hợp trực tiếp với nền tảng Brevo SMTP thông qua giao thức REST.
     * Đóng gói toàn bộ logic khởi tạo HttpHeaders và Payload.
     */
    private void executeSend(String to, String subject, String htmlContent) {
        String url = "https://api.brevo.com/v3/smtp/email";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("api-key", brevoConfig.getApiKey());

        Map<String, Object> body = Map.of(
                "sender", Map.of(
                        "name", brevoConfig.getSenderName(),
                        "email", brevoConfig.getSenderEmail()
                ),
                "to", List.of(Map.of("email", to)),
                "subject", subject,
                "htmlContent", htmlContent
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
        log.info("Email sent successfully to {}", to);
    }
}
