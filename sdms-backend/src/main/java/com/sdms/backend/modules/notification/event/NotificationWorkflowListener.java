package com.sdms.backend.modules.notification.event;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.event.ApplicationApprovedEvent;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.maintenance.event.RoomMaintenanceRequiredEvent;
import com.sdms.backend.modules.notification.core.NotificationRouter;
import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.notification.service.NotificationService;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.payment.event.ReservationPaymentExpiredEvent;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Component("notificationWorkflowListener")
@RequiredArgsConstructor
public class NotificationWorkflowListener {

    private final NotificationService notificationService;
    private final NotificationRouter notificationRouter;
    private final DormitoryApplicationRepository applicationRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    @Async("taskExecutor")
    @EventListener
    public void handleReservationPaymentExpired(ReservationPaymentExpiredEvent event) {
        log.info("[Notification] Processing ReservationPaymentExpiredEvent for applicationId: {}", event.getApplicationId());
        try {
            Optional<DormitoryApplication> applicationOpt = applicationRepository.findById(event.getApplicationId());
            if (applicationOpt.isPresent()) {
                DormitoryApplication app = applicationOpt.get();
                Map<String, Object> vars = new HashMap<>();
                vars.put("studentName", app.getFullName());
                vars.put("message", "Đơn đăng ký chỗ ở của bạn đã bị hủy do quá hạn thanh toán hóa đơn giữ chỗ 48 giờ. Vui lòng liên hệ BQL nếu có sai sót.");

                notificationService.sendHtmlEmail(
                        app.getEmail(),
                        "Thông báo Hủy chỗ do quá hạn thanh toán",
                        "generic-notification",
                        vars,
                        NotificationType.ROOM
                );
                log.info("Sent cancellation email to {}", app.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to send expiry notification: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @EventListener
    public void handleMaintenanceRequired(RoomMaintenanceRequiredEvent event) {
        log.info("[Notification] Processing RoomMaintenanceRequiredEvent for roomId: {}", event.getRoomId());
        try {
            List<StudentHousingAssignment> activeAssignments = assignmentRepository.findByBed_Room_RoomIdAndStatus(event.getRoomId(), AssignmentStatus.OCCUPIED);
            
            for (StudentHousingAssignment assignment : activeAssignments) {
                if (assignment.getStudent() != null && assignment.getStudent().getEmail() != null) {
                    Map<String, Object> vars = new HashMap<>();
                    vars.put("studentName", assignment.getStudent().getFullName());
                    vars.put("message", "Phòng của bạn chuẩn bị có đợt bảo trì khẩn cấp (Lý do: " + event.getDescription() + "). Vui lòng chú ý tư trang hoặc tuân thủ hướng dẫn di dời của BQL.");

                    // Push both Email and In-App
                    NotificationPayload payload = NotificationPayload.builder()
                        .eventId(UUID.randomUUID().toString())
                        .studentId(assignment.getStudent().getStudentId())
                        .email(assignment.getStudent().getEmail())
                        .title("Thông báo Bảo trì Khẩn cấp")
                        .inAppMessage("Phòng của bạn chuẩn bị có bảo trì khẩn cấp. Vui lòng xem email để biết chi tiết.")
                        .emailTemplateName("generic-notification")
                        .templateData(vars)
                        .type(NotificationType.ROOM)
                        .channels(Set.of(NotificationChannel.IN_APP, NotificationChannel.EMAIL))
                        .build();
                        
                    notificationRouter.route(payload);
                }
            }
        } catch (Exception e) {
            log.error("Failed to send maintenance notification: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @EventListener
    public void handleApplicationApproved(ApplicationApprovedEvent event) {
        log.info("[Notification] Processing ApplicationApprovedEvent for applicationId: {}", event.getApplicationId());
        try {
            NotificationPayload payload = NotificationPayload.builder()
                .eventId(UUID.randomUUID().toString())
                .studentId(event.getStudentId())
                .title("Đơn đăng ký nội trú ĐÃ ĐƯỢC DUYỆT")
                .inAppMessage("Chúc mừng " + event.getStudentName() + "! Đơn đăng ký nội trú của bạn đã được duyệt. Hãy truy cập phần Hóa đơn để đóng phí giữ chỗ trong vòng 48 giờ.")
                .email(event.getStudentEmail())
                .emailTemplateName("generic-notification")
                .templateData(Map.of("studentName", event.getStudentName(), "message", "Đơn đăng ký nội trú của bạn đã được duyệt. Hãy truy cập phần Tra cứu để đóng phí giữ chỗ trong vòng 48 giờ."))
                .type(NotificationType.APPLICATION)
                .channels(Set.of(NotificationChannel.IN_APP, NotificationChannel.EMAIL))
                .actionUrl("/student/bills")
                .build();
            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Failed to send app approval notification: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @EventListener
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("[Notification] Processing PaymentSuccessEvent for billId: {}", event.getBillId());
        try {
            String studentName = event.getStudentName();
            String email = event.getEmail();
            
            if ((studentName == null || email == null) && event.getApplicationId() != null) {
                DormitoryApplication app = applicationRepository.findById(event.getApplicationId()).orElse(null);
                if (app != null) {
                    if (studentName == null) studentName = app.getFullName();
                    if (email == null) email = app.getEmail();
                }
            }

            if (studentName == null) studentName = "Sinh viên";

            NotificationPayload payload = NotificationPayload.builder()
                .eventId(UUID.randomUUID().toString())
                .studentId(event.getStudentId())
                .title("Thanh toán thành công")
                .inAppMessage("Cảm ơn bạn đã thanh toán số tiền " + event.getAmount() + " VNĐ thành công. Trạng thái biên lai đã được cập nhật.")
                .email(email)
                .emailTemplateName("generic-notification")
                .templateData(Map.of("studentName", studentName, "message", "Biên lai thanh toán của bạn đã được ghi nhận. Số tiền: " + event.getAmount() + " VNĐ."))
                .type(NotificationType.PAYMENT)
                .channels(Set.of(NotificationChannel.IN_APP, NotificationChannel.EMAIL))
                .actionUrl("/student/bills/" + event.getBillId())
                .build();
            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Failed to send payment success notification: {}", e.getMessage(), e);
        }
    }

    @Async("taskExecutor")
    @EventListener
    public void handleCheckInCompleted(CheckInCompletedEvent event) {
        log.info("[Notification] Processing CheckInCompletedEvent for assignmentId: {}", event.getAssignmentId());
        try {
            NotificationPayload payload = NotificationPayload.builder()
                .eventId(UUID.randomUUID().toString())
                .studentId(event.getStudentId())
                .title("Nhận phòng thành công")
                .inAppMessage("Chào mừng bạn đến với KTX! Bạn đã nhận phòng " + event.getRoomCode() + " - Giường " + event.getBedCode() + " thành công.")
                .type(NotificationType.ROOM)
                .channels(Set.of(NotificationChannel.IN_APP))
                .actionUrl("/student/room")
                .build();
            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Failed to send checkin notification: {}", e.getMessage(), e);
        }
    }
}
