package com.sdms.backend.modules.smartaccess.event.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import com.sdms.backend.modules.smartaccess.application.service.IdempotencyService;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.domain.repository.AccessHistoryRepository;
import com.sdms.backend.modules.smartaccess.event.AccessDeniedEvent;
import com.sdms.backend.modules.smartaccess.event.IdentityFailedEvent;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Lắng nghe sự kiện khi hệ thống AI nhận diện khuôn mặt thất bại (Không tìm thấy người dùng trong cơ sở dữ liệu khuôn mặt).
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Observer Pattern & Event-Driven Architecture.
 * Lưu ý Kiến thức (Dành cho phản biện): 
 * - Áp dụng cơ chế Idempotency (tính lũy đẳng) bằng IdempotencyService để chống lại tình trạng một sự kiện thất bại bị bắn (publish) nhiều lần từ AI Engine, gây rác lịch sử ra vào.
 * - Sau khi ghi lịch sử truy cập (AccessHistory) với trạng thái DENIED, nó tiếp tục bắn ra Outbound Event (AccessDeniedEvent) để IoT Gateway báo đèn đỏ/còi hú.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IdentityFailedEventListener {

    private final IdempotencyService idempotencyService;
    private final AccessHistoryRepository accessHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    @EventListener
    @Transactional
    public void handleIdentityFailed(IdentityFailedEvent event) {
        log.info("Received IdentityFailedEvent for gate {}", event.getGateId());

        if (idempotencyService.isDuplicateOrRegister(event.getEventId(), "FACE_MODULE_FAILURE")) {
            return;
        }

        AccessHistory history = AccessHistory.builder()
                .studentId(UUID.fromString("00000000-0000-0000-0000-000000000000")) // Unknown identity
                .gateId(event.getGateId())
                .buildingId(UUID.fromString("00000000-0000-0000-0000-000000000000"))
                .eventTimestamp(LocalDateTime.now())
                .decision(AccessDecision.DENIED)
                .denialReason("IDENTITY_FAILED")
                .method(event.getMethod())
                .build();

        accessHistoryRepository.save(history);

        // Publish to IoT module (which will consume it via AFTER_COMMIT)
        eventPublisher.publishEvent(new AccessDeniedEvent(event.getGateId(), "IDENTITY_FAILED"));
    }
}
