package com.sdms.backend.modules.room.event;

import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.application.event.ApplicationSubmittedEvent;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.service.HousingAssignmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener; // 🌟 Dùng EventListener thuần
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomAllocationListener {

    private final HousingAssignmentService assignmentService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Lắng nghe sự kiện sinh viên nộp đơn thành công (ApplicationSubmittedEvent).
     * Tự động tìm và gán giường dự kiến ngay khi hồ sơ được nộp.
     */
    @Async("taskExecutor")
    @EventListener // 🌟 Đổi sang EventListener thuần để chạy đồng bộ/bất đồng bộ an toàn khi nộp đơn
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {
        log.info("[RoomAllocationListener] Received ApplicationSubmittedEvent for Application ID: {}", event.getApplicationId());
        try {
            Gender gender = Gender.valueOf(event.getGender());
            // Hệ thống thực hiện xếp phòng dự kiến, lưu bản ghi Assignment mang trạng thái RESERVED
            StudentHousingAssignment assignment = assignmentService.reserveBed(event.getApplicationId(), gender);

            log.info("[RoomAllocationListener] Successfully reserved PROVISIONAL bed {} in room {} for application {}",
                    assignment.getBed().getBedCode(),
                    assignment.getBed().getRoom().getRoomCode(),
                    event.getApplicationId());

            // 🌟 FIX TẠI ĐÂY: TUYỆT ĐỐI KHÔNG BẮN BedReservedEvent Ở ĐÂY NỮA!
            // Để đơn nằm im ở trạng thái PENDING kèm thông tin phòng dự kiến, chưa sinh hóa đơn.

        } catch (Exception e) {
            log.error("[RoomAllocationListener] Failed to reserve provisional bed for application {}. Reason: {}",
                    event.getApplicationId(), e.getMessage());

            // Nếu hết giường, phát sự kiện thất bại để đẩy đơn vào danh sách chờ (WAITING_LIST)
            eventPublisher.publishEvent(new BedReservationFailedEvent(this, event.getApplicationId()));
        }
    }
}