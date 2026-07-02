package com.sdms.backend.modules.room.event;

import com.sdms.backend.modules.application.event.ApplicationRejectedEvent; // 🌟 Import đúng Event mới tạo
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomCancellationListener {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final HousingAssignmentService housingAssignmentService;

    @Async("taskExecutor")
    @EventListener // 🌟 Lắng nghe sự kiện Admin từ chối đơn
    public void handleApplicationRejected(ApplicationRejectedEvent event) {
        // Code hết bị báo đỏ vì class Event đã có @Getter sinh ra hàm getApplicationId()
        UUID applicationId = event.getApplicationId();
        log.info("[RoomCancellationListener] Handling ApplicationRejectedEvent for application={}", applicationId);

        // Tìm bản ghi phòng dự kiến (RESERVED) của hồ sơ bị từ chối
        Optional<StudentHousingAssignment> assignmentOpt = assignmentRepository
                .findByApplication_ApplicationIdAndStatus(applicationId, AssignmentStatus.RESERVED);

        if (assignmentOpt.isPresent()) {
            StudentHousingAssignment assignment = assignmentOpt.get();
            try {
                // Thu hồi giường dự kiến về trạng thái trống (AVAILABLE)
                housingAssignmentService.cancelReservation(assignment.getAssignmentId());
                log.info("[RoomCancellationListener] Successfully revoked provisional bed for application={}", applicationId);
            } catch (Exception e) {
                log.error("[RoomCancellationListener] Failed to revoke provisional bed", e);
            }
        }
    }
}