package com.sdms.backend.modules.application.scheduler;

import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.registration.repository.RegistrationPeriodRepository;
import com.sdms.backend.modules.notification.core.NotificationRouter;
import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class RegistrationPeriodReminderScheduler {

    private final RegistrationPeriodRepository periodRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final NotificationRouter notificationRouter;

    /**
     * Chạy vào lúc 08:00 sáng mỗi ngày.
     * Quét các Đợt đăng ký sẽ hết hạn vào đúng 7 ngày nữa.
     * Gửi thông báo tự động (In-App) cho toàn bộ sinh viên đang ở.
     */
    @Scheduled(cron = "0 0 8 * * ?") // 08:00 AM mỗi ngày
    public void sendExpirationReminders() {
        log.info("[BATCH JOB] Đang kiểm tra các đợt lưu trú sắp hết hạn (7 ngày)...");
        
        LocalDate targetDate = LocalDate.now().plusDays(7);
        java.time.LocalDateTime startOfDay = targetDate.atStartOfDay();
        java.time.LocalDateTime endOfDay = targetDate.atTime(java.time.LocalTime.MAX);
        
        List<RegistrationPeriod> expiringPeriods = periodRepository.findByStayEndDateBetween(startOfDay, endOfDay);
        
        for (RegistrationPeriod period : expiringPeriods) {
            log.info("Đợt lưu trú {} sắp hết hạn vào {}. Đang lấy danh sách sinh viên...", period.getPeriodName(), targetDate);
            
            // Tìm tất cả sinh viên đang ở trong đợt này
            List<StudentHousingAssignment> activeAssignments = assignmentRepository
                .findByApplication_RegistrationPeriod_PeriodIdAndStatusIn(
                    period.getPeriodId(), 
                    List.of(AssignmentStatus.OCCUPIED)
                );
                
            int count = 0;
            for (StudentHousingAssignment assignment : activeAssignments) {
                if (assignment.getStudent() != null) {
                    sendReminderNotification(assignment, period);
                    count++;
                }
            }
            log.info("Đã gửi {} thông báo nhắc nhở trả phòng cho đợt {}.", count, period.getPeriodName());
        }
    }

    private void sendReminderNotification(StudentHousingAssignment assignment, RegistrationPeriod period) {
        String message = String.format(
            "Đợt lưu trú '%s' của bạn sẽ kết thúc sau 7 ngày nữa (vào ngày %s). " +
            "Vui lòng chuẩn bị dọn dẹp tài sản cá nhân. Sau ngày này, hệ thống sẽ tự động vô hiệu hóa quyền ra vào Ký túc xá và trả phòng tự động.",
            period.getPeriodName(), 
            period.getStayEndDate().toString()
        );

        NotificationPayload payload = NotificationPayload.builder()
                .eventId(UUID.randomUUID().toString())
                .type(NotificationType.SYSTEM)
                .channels(Set.of(NotificationChannel.IN_APP))
                .studentId(assignment.getStudent().getStudentId())
                .email(assignment.getStudent().getEmail())
                .recipientName(assignment.getStudent().getFullName())
                .title("Sắp hết hạn lưu trú KTX")
                .inAppMessage(message)
                .build();

        notificationRouter.route(payload);
    }
}
