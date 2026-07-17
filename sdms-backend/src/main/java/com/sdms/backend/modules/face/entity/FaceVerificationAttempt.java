package com.sdms.backend.modules.face.entity;

import com.sdms.backend.modules.face.enums.FaceVerificationResult;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Sổ cái kiểm toán chỉ-thêm cho mỗi yêu cầu xác thực cổng IoT.
 *
 * <p>Entity này cố tình KHÔNG kế thừa BaseEntity.
 * Nó là bất biến: được tạo một lần cho mỗi lần quét cổng, không bao giờ cập nhật.
 *
 * <p>Quyền sở hữu: Chỉ thuộc Module Face.
 * dữ liệu ảnh camera KHÔNG được lưu ở đây — nó thuộc ranh giới Module IoT.
 */
@Entity
@Table(
        name = "face_verification_attempts",
        indexes = {
                @Index(name = "idx_face_verif_profile_id", columnList = "profile_id"),
                @Index(name = "idx_face_verif_gate_time", columnList = "gate_device_id, attempted_at")
        }
)
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class FaceVerificationAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "attempt_id", updatable = false, nullable = false)
    private UUID attemptId;

    /**
     * Định danh của thiết bị cổng IoT vật lý.
     */
    @Column(name = "gate_device_id", nullable = false, length = 100)
    private String gateDeviceId;

    /**
     * FaceProfile khớp, nếu xác thực thành công.
     * Nullable cho kết quả FAIL và AI_TIMEOUT.
     * ON DELETE SET NULL: giữ lại cho kiểm toán ngay cả khi hồ sơ bị xóa sau này.
     */
    @Column(name = "profile_id")
    private UUID profileId;

    /**
     * Khoảng cách Cosine similarity trả về bởi truy vấn nearest-neighbor của pgvector.
     *
     * <p><b>CHỈ ĐỂ CHẨN ĐOÁN.</b> Giá trị này tồn tại duy nhất cho kiểm toán, khả năng quan sát,
     * và giám sát hiệu suất mô hình AI.
     *
     * <p><b>RÀNG BUỘC QUẢN TRỊ — KHÔNG BAO GIỜ được sử dụng cho:</b>
     * <ul>
     *   <li>Quyết định phân quyền</li>
     *   <li>Logic kiểm soát truy cập</li>
     *   <li>Cấp hoặc từ chối quyền</li>
     * </ul>
     *
     * <p>Mọi quyết định truy cập là trách nhiệm độc quyền của
     * Module Smart Access, tiêu thụ {@code FaceMatchSuccessEvent}
     * và đánh giá chuỗi chính sách độc lập của riêng nó (giờ giới nghiêm, khung giờ, trạng thái sinh viên).
     *
     * <p>Nullable: vắng mặt cho kết quả {@code FAIL} và {@code AI_TIMEOUT}.
     */
    @Column(name = "confidence_score", precision = 10, scale = 8)
    private BigDecimal confidenceScore;

    /**
     * Kết quả của lần thử xác thực AI.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private FaceVerificationResult status;

    // Dấu thời gian bất biến — không có cột updatedAt trên bảng sổ cái này.
    @CreatedDate
    @Column(name = "attempted_at", nullable = false, updatable = false)
    private LocalDateTime attemptedAt;

    @PrePersist
    protected void onCreate() {
        if (this.attemptedAt == null) {
            this.attemptedAt = LocalDateTime.now();
        }
    }
}
