package com.sdms.backend.modules.room.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomRole;
import com.sdms.backend.modules.student.entity.Student;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity quản lý vòng đời cư trú của sinh viên trong KTX.
 * * PHÂN TÍCH NGHIỆP VỤ SDMS:
 * 1. Application-Centric: Mọi Assignment được khởi tạo từ một DormitoryApplication đã được phê duyệt.
 * 2. WAITING_PAYMENT Lifecycle: Trong giai đoạn này, assignment_id được tạo ra, application_id được link,
 * nhưng student_id vẫn là NULL vì sinh viên chưa tồn tại trong hệ thống.
 * 3. Payment-Linkage: Sau khi thanh toán thành công (Payment Success), student_id sẽ được cập nhật.
 * 4. AI/IoT Ready: Mối quan hệ với Student và Bed giúp các hệ thống ngoại vi truy vấn danh tính
 * và vị trí cư trú thông qua assignment_id hoặc student_id.
 */
@Entity
@Table(
        name = "student_housing_assignments",
        indexes = {
                @Index(name = "idx_assignment_status", columnList = "status"),
                @Index(name = "idx_assignment_application", columnList = "application_id"),
                @Index(name = "idx_assignment_student", columnList = "student_id")
        }
)
@Getter
@Setter
public class StudentHousingAssignment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID assignmentId;

    /**
     * Nguồn gốc của Assignment. Được sử dụng để ràng buộc 1 Application chỉ có 1 Assignment ACTIVE.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private DormitoryApplication application;

    /**
     * Định danh cư dân (Null khi trạng thái RESERVED/WAITING_PAYMENT).
     * Được cập nhật sau khi hoàn tất quy trình Payment và tạo Student Account.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = true)
    private Student student;

    /**
     * Giường được chỉ định. Dùng cho IoT kiểm soát cửa từ và ánh xạ phòng.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bed_id", nullable = false)
    private Bed bed;

    /**
     * Trạng thái phân bổ: RESERVED (Giữ chỗ) -> OCCUPIED (Đang ở) -> CHECKED_OUT (Đã trả).
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssignmentStatus status;

    /**
     * Vai trò của sinh viên trong phòng (Trưởng phòng, phó phòng, thành viên).
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "room_role", length = 30)
    private RoomRole roomRole = RoomRole.MEMBER;

    /**
     * Thời điểm giữ chỗ (Dùng để tính toán hạn chót thanh toán 3 ngày).
     */
    private LocalDateTime reservedAt;

    /**
     * Thời điểm thực hiện Check-in vào phòng.
     */
    private LocalDateTime checkInAt;

    /**
     * Thời điểm thực hiện Check-out khỏi phòng.
     */
    private LocalDateTime checkOutAt;

    /**
     * Thời điểm dự kiến kết thúc hợp đồng.
     */
    private LocalDateTime expectedCheckOutAt;

    /**
     * Hook để tự động hóa trạng thái ban đầu khi persist xuống database.
     */
    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = AssignmentStatus.RESERVED;
        }
        if (this.reservedAt == null) {
            this.reservedAt = LocalDateTime.now();
        }
        if (this.roomRole == null) {
            this.roomRole = RoomRole.MEMBER;
        }
    }
}