package com.sdms.backend.modules.student.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.student.enums.ChangeRoomRequestStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * Quản lý yêu cầu đổi phòng của sinh viên.
 */
@Entity
@Table(
        name = "change_room_requests",
        indexes = {
                @Index(name = "idx_change_room_student", columnList = "student_id"),
                @Index(name = "idx_change_room_status", columnList = "status")
        }
)
@Getter
@Setter
public class ChangeRoomRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_assignment_id", nullable = false)
    private StudentHousingAssignment currentAssignment;

    // Sinh viên có thể không biết cụ thể phòng nào, chỉ ghi mong muốn, 
    // hoặc có thể chọn thẳng 1 phòng trống. Cho phép null.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_room_id", nullable = true)
    private Room targetRoom;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(columnDefinition = "TEXT")
    private String adminNote;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChangeRoomRequestStatus status = ChangeRoomRequestStatus.PENDING;

    private UUID reviewedByUserId;
}
