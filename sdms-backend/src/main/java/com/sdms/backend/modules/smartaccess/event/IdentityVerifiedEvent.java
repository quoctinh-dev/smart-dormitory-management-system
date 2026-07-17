package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;

import java.util.UUID;

/**
 * Mục tiêu/Nghiệp vụ: Sự kiện được phát ra ngay khi Hệ thống nhận diện (AI Face, RFID) xác nhận thành công danh tính của một người tại một cổng, nhưng CHƯA quyết định mở cửa.
 * Giải pháp Công nghệ/Mẫu thiết kế (Design Pattern): Áp dụng Event-Driven Architecture.
 * Lưu ý Kiến thức (Dành cho phản biện): 
 * - Đây là một Inbound Event (Sự kiện đầu vào). Tách biệt quá trình Xác thực (Authentication) và Cấp phép (Authorization).
 * - Listener của sự kiện này (AccessEvaluationService) sẽ tiếp tục đánh giá các chính sách (Giờ giới nghiêm, Khung giờ ra vào) trước khi ra quyết định cuối cùng.
 */
@Getter
@AllArgsConstructor
public class IdentityVerifiedEvent {
    private final String eventId;
    private final UUID studentId;
    private final UUID gateId;
    private final VerificationMethod method;
    private final String snapshotUrl; // Bổ sung ảnh chụp (dùng cho Fallback Audit)
}
