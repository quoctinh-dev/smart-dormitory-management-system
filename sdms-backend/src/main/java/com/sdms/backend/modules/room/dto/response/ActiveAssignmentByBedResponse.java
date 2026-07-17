package com.sdms.backend.modules.room.dto.response;

import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.enums.RoomRole;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO trả về thông tin hợp đồng lưu trú đang hoạt động theo Giường.
 * Dùng cho Admin Drill-down: bấm vào 1 giường để xem thông tin sinh viên.
 */
@Getter
@Setter
@Builder
public class ActiveAssignmentByBedResponse {

    private UUID assignmentId;
    private AssignmentStatus status;
    private LocalDateTime reservedAt;
    private LocalDateTime checkInAt;
    private LocalDateTime expectedCheckOutAt;
    private RoomRole roomRole;

    // Thông tin Sinh viên (null nếu chưa liên kết - giai đoạn chờ thanh toán)
    private StudentSummary student;

    // Thông tin vị trí giường để Frontend không cần gọi thêm
    private UUID bedId;
    private String bedCode;
    private String roomCode;
    private String buildingName;

    @Getter
    @Setter
    @Builder
    public static class StudentSummary {
        private UUID studentId;
        private String studentCode;
        private String fullName;
        private String email;
        private String avatarUrl;
    }
}
