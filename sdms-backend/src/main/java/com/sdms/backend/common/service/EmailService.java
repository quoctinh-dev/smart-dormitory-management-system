package com.sdms.backend.common.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.config.BrevoConfig;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final BrevoConfig brevoConfig;
    private final RestTemplate restTemplate;

    /**
     * Gửi các email không quan trọng (VD: thông báo).
     * <p>
     * Method này chạy bất đồng bộ (@Async) và sẽ không làm block luồng chính.
     * Nếu có lỗi xảy ra, lỗi sẽ chỉ được ghi log mà không ném ra ngoài,
     * đảm bảo không làm gián đoạn các tác vụ khác.
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
     * Gửi các email quan trọng yêu cầu phải thành công (VD: Gửi mã OTP, Reset mật khẩu).
     * <p>
     * Method này chạy đồng bộ. Nếu gửi email thất bại, nó sẽ ném ra một {@link AppException}
     * để tầng service/controller có thể bắt lại và thông báo lỗi cho người dùng.
     *
     * @throws AppException nếu không thể gửi email
     */
    public void sendCriticalEmail(String to, String subject, String htmlContent) {
        try {
            executeSend(to, subject, htmlContent);
        } catch (Exception e) {
            log.error("CRITICAL: Failed to send critical email to {}: {}", to, e.getMessage(), e);
            // Ném ra lỗi để GlobalExceptionHandler bắt được và trả về response 500 cho client
            throw new AppException("Không thể gửi email vào lúc này, vui lòng thử lại sau.", HttpStatus.INTERNAL_SERVER_ERROR, e);
        }
    }

    /**
     * Lõi logic thực thi việc gọi API của Brevo để gửi email.
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

        // RestTemplate.exchange sẽ tự ném ra RestClientException nếu status code là 4xx hoặc 5xx
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            log.info("Email sent successfully to {}", to);
        } else {
            // Đoạn này gần như sẽ không bao giờ được thực thi vì RestTemplate đã ném lỗi trước đó
            log.warn("Email send failed to {}: status={}, body={}", to, response.getStatusCode(), response.getBody());
        }
    }
}
