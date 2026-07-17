    package com.sdms.backend.modules.face.entity;

    import com.sdms.backend.common.entity.BaseEntity;
    import com.sdms.backend.modules.face.enums.FaceProfileStatus;
    import jakarta.persistence.*;
    import lombok.*;

    import java.time.LocalDateTime;
    import java.util.UUID;

    /**
     * Root aggregate cho Domain Face.
     * Theo dõi vòng đời đăng ký khuôn mặt của sinh viên.
     *
     * <p>Quyền sở hữu: Chỉ thuộc Module Face.
     * Tham chiếu chéo module: student_id (khóa ngoại chỉ đọc tới Module Student).
     *
     * <p>Ràng buộc: student_id là DUY NHẤT — 1 Sinh viên có tối đa 1 FaceProfile tại bất kỳ thời điểm nào.
     */
    @Entity
    @Table(
            name = "face_profiles",
            indexes = {
                    @Index(name = "idx_face_profiles_student_id", columnList = "student_id"),
                    @Index(name = "idx_face_profiles_status_created", columnList = "status, created_at")
            }
    )
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class FaceProfile extends BaseEntity {

        @Id
        @GeneratedValue(strategy = GenerationType.UUID)
        @Column(name = "profile_id", updatable = false, nullable = false)
        private UUID profileId;

        /**
         * Tham chiếu chéo tới Module Student.
         * Ràng buộc UNIQUE đảm bảo quan hệ 1:0..1 ở mức cơ sở dữ liệu.
         * KHÔNG inject StudentRepository hoặc StudentService ở đây.
         */
        @Column(name = "student_id", nullable = false, unique = true)
        private UUID studentId;

        /**
         * CDN URL của ảnh chân dung đã tải lên.
         * Nullable: bị xóa trong quá trình dọn dẹp sau khi BỊ TỪ CHỐI.
         */
        @Column(name = "face_image_url", length = 500)
        private String faceImageUrl;

        /**
         * CDN URL của ảnh chân dung mới tải lên đang chờ admin duyệt.
         * Nullable: chỉ được điền trong luồng Yêu cầu thay thế.
         */
        @Column(name = "pending_face_image_url", length = 500)
        private String pendingFaceImageUrl;

        /**
         * Dấu thời gian của yêu cầu thay thế để sắp xếp Hàng đợi Admin (FIFO).
         */
        @Column(name = "replacement_requested_at")
        private LocalDateTime replacementRequestedAt;

        /**
         * Trạng thái vòng đời phê duyệt. Không bao giờ null.
         * Các trạng thái chuyển đổi hợp lệ:
         *   Upload        → CHỜ DUYỆT
         *   Admin Duyệt   → ĐÃ DUYỆT
         *   Admin Từ chối → BỊ TỪ CHỐI
         *   Admin Thu hồi → BỊ THU HỒI
         */
        @Enumerated(EnumType.STRING)
        @Column(name = "status", nullable = false, length = 50)
        private FaceProfileStatus status;

        /**
         * Lý do cho trạng thái BỊ TỪ CHỐI hoặc BỊ THU HỒI.
         * Nullable cho trạng thái CHỜ DUYỆT và ĐÃ DUYỆT.
         */
        @Column(name = "rejection_reason", columnDefinition = "TEXT")
        private String rejectionReason;

        /**
         * UUID của Admin đã duyệt hồ sơ này.
         * Nullable: chỉ được điền khi trạng thái chuyển sang ĐÃ DUYỆT.
         * Tham chiếu chéo tới UserAccount — lưu dưới dạng UUID thuần (không join JPA).
         */
        @Column(name = "approved_by")
        private UUID approvedBy;

        /**
         * Dấu thời gian khi Admin duyệt hồ sơ này.
         * Nullable: chỉ được điền khi trạng thái chuyển sang ĐÃ DUYỆT.
         */
        @Column(name = "approved_at")
        private LocalDateTime approvedAt;
    }
