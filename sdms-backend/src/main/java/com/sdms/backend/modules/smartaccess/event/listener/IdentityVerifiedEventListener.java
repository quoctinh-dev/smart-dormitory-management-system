package com.sdms.backend.modules.smartaccess.event.listener;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import com.sdms.backend.modules.smartaccess.application.service.AccessEvaluationService;
import com.sdms.backend.modules.smartaccess.event.IdentityVerifiedEvent;

/**
 * Mục tiêu/Nghiệp vụ: Lắng nghe sự kiện xác thực danh tính thành công (từ Face ID hoặc thẻ từ IoT) để tiến hành đánh giá quyền ra/vào cổng cho sinh viên.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Observer Pattern (th qua cơ chế ApplicationEvent của Spring) giúp decouple (giảm sự phụ thuộc) giữa module nhận diện (Face/RFID) và module phân quyền đóng mở cổng (Smart Access).
 * Lưu ý Kiến thức (Dành cho phản biện): Giải thích tại sao dùng @EventListener đồng bộ: Để đảm bảo luồng nghiệp vụ đánh giá truy cập (evaluateAccess) nằm trong cùng một Request/Thread, từ đó nếu lỗi xảy ra, transaction có thể rollback toàn vẹn dữ liệu. Nếu dùng @Async, ta sẽ mất context của transaction.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class IdentityVerifiedEventListener {

    private final AccessEvaluationService accessEvaluationService;

    // Lắng nghe và xử lý đồng bộ. Hàm evaluateAccess được đánh dấu @Transactional.
    // Nếu transaction thất bại, các sự kiện gửi MQTT tiếp theo (như AFTER_COMMIT) sẽ bị hủy bỏ, đảm bảo tính nhất quán (Consistency).
    @EventListener
    public void handleIdentityVerified(IdentityVerifiedEvent event) {
        log.info("Received IdentityVerifiedEvent for gate {} with eventId {}", event.getGateId(), event.getEventId());
        
        accessEvaluationService.evaluateAccess(
                event.getEventId(),
                event.getStudentId(),
                event.getGateId(),
                event.getMethod(),
                event.getSnapshotUrl()
        );
    }
}
