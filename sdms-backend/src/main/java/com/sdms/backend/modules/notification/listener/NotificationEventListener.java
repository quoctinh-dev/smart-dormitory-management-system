package com.sdms.backend.modules.notification.listener;

import com.sdms.backend.modules.application.event.ApplicationApprovedEvent;
import com.sdms.backend.modules.application.event.ApplicationSubmittedEvent;
import com.sdms.backend.modules.face.event.FaceProfileApprovedEvent;
import com.sdms.backend.modules.notification.core.NotificationRouter;
import com.sdms.backend.modules.notification.core.payload.NotificationPayload;
import com.sdms.backend.modules.notification.enums.NotificationChannel;
import com.sdms.backend.modules.notification.enums.NotificationType;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import com.sdms.backend.modules.student.event.ExtensionApprovedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationRouter notificationRouter;

    /**
     * 1. Hứng sự kiện sinh viên NỘP ĐƠN đăng ký phòng thành công
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApplicationSubmitted(ApplicationSubmittedEvent event) {
        log.info("Notification-Event: Tiếp nhận đơn đăng ký số {} của sinh viên thành công.", event.getApplicationId());
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("studentName", event.getStudentName());
            variables.put("applicationId", event.getApplicationId().toString());
            variables.put("status", "CHỜ XÉT DUYỆT");
            variables.put("reason", null);

            Set<NotificationChannel> channels = new java.util.HashSet<>();
            channels.add(NotificationChannel.EMAIL);
            if (event.getStudentId() != null) channels.add(NotificationChannel.IN_APP);

            NotificationPayload payload = NotificationPayload.builder()
                    .eventId("APP_SUBMIT_" + event.getApplicationId())
                    .type(NotificationType.APPLICATION)
                    .channels(channels)
                    .studentId(event.getStudentId())
                    .email(event.getStudentEmail())
                    .recipientName(event.getStudentName())
                    .title("SDMS - Tiếp nhận đơn đăng ký phòng ở thành công")
                    .emailTemplateName("application-status")
                    .templateData(variables)
                    .build();

            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Lỗi xử lý gửi thông báo nộp đơn: {}", e.getMessage(), e);
        }
    }

    /**
     * 2. Hứng sự kiện Ban quản lý PHÊ DUYỆT đơn đăng ký phòng
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApplicationApproved(ApplicationApprovedEvent event) {
        log.info("Notification-Event: Đơn đăng ký số {} đã được phê duyệt thành công.", event.getApplicationId());
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("studentName", event.getStudentName());
            variables.put("applicationId", event.getApplicationId().toString());
            variables.put("status", "ĐA_PHE_DUYET");
            variables.put("reason", "Hồ sơ đủ điều kiện ưu tiên. Vui lòng kiểm tra hóa đơn tiền phòng được đính kèm tại cổng thông tin để hoàn tất nghĩa vụ tài chính.");

            Set<NotificationChannel> channels = new java.util.HashSet<>();
            channels.add(NotificationChannel.EMAIL);
            if (event.getStudentId() != null) channels.add(NotificationChannel.IN_APP);

            NotificationPayload payload = NotificationPayload.builder()
                    .eventId("APP_APPROVE_" + event.getApplicationId())
                    .type(NotificationType.APPLICATION)
                    .channels(channels)
                    .studentId(event.getStudentId())
                    .email(event.getStudentEmail())
                    .recipientName(event.getStudentName())
                    .title("SDMS - Thông báo kết quả đơn đăng ký phòng ở Ký túc xá")
                    .emailTemplateName("application-status")
                    .templateData(variables)
                    .build();

            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Lỗi xử lý gửi thông báo duyệt đơn: {}", e.getMessage(), e);
        }
    }

    /**
     * 3. Hứng sự kiện sinh viên THANH TOÁN HÓA ĐƠN THÀNH CÔNG
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("Notification-Event: Nhận sự kiện đối soát hóa đơn thành công cho Mã đơn: {}", event.getApplicationId());
        try {
            if (event.getEmail() == null) {
                log.warn("PaymentSuccessEvent lacks email, skipping notification for bill {}", event.getBillId());
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("studentName", event.getStudentName());
            variables.put("billId", event.getBillId().toString());
            variables.put("amount", event.getAmount());

            NotificationPayload payload = NotificationPayload.builder()
                    .eventId("PAYMENT_" + event.getBillId())
                    .type(NotificationType.PAYMENT)
                    .channels(event.getStudentId() != null ? Set.of(NotificationChannel.EMAIL, NotificationChannel.IN_APP) : Set.of(NotificationChannel.EMAIL))
                    .studentId(event.getStudentId())
                    .email(event.getEmail())
                    .recipientName(event.getStudentName())
                    .title("SDMS - Xác nhận hoàn tất nghĩa vụ thanh toán hóa đơn thành công")
                    .emailTemplateName("payment-success")
                    .inAppMessage("Thanh toán hóa đơn phòng KTX thành công. Số tiền: " + event.getAmount() + " VNĐ.")
                    .templateData(variables)
                    .build();

            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Notification-Event: Thất bại khi xử lý gửi thông báo thanh toán hóa đơn {}. Lý do: {}", event.getBillId(), e.getMessage(), e);
        }
    }

    /**
     * 4. Hứng sự kiện Hồ sơ dữ liệu khuôn mặt (FACE ID) ĐƯỢC PHÊ DUYỆT
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleFaceApproved(FaceProfileApprovedEvent event) {
        log.info("Notification-Event: Nhận sự kiện phê duyệt Face ID cho Profile ID: {}", event.profileId());
        try {
            if (event.email() == null) {
                log.warn("FaceProfileApprovedEvent lacks email, skipping notification for profile {}", event.profileId());
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("studentName", event.studentName());
            variables.put("status", "ĐA_DUYET");
            variables.put("reason", null);

            NotificationPayload payload = NotificationPayload.builder()
                    .eventId("FACE_" + event.profileId())
                    .type(NotificationType.FACE)
                    .channels(Set.of(NotificationChannel.EMAIL, NotificationChannel.IN_APP))
                    .studentId(event.studentId())
                    .email(event.email())
                    .recipientName(event.studentName())
                    .title("SDMS - Thông báo trạng thái đăng ký dữ liệu Face ID")
                    .emailTemplateName("face-status")
                    .inAppMessage("Hồ sơ khuôn mặt của bạn đã được phê duyệt thành công.")
                    .templateData(variables)
                    .build();

            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Lỗi xử lý gửi thông báo Face ID: {}", e.getMessage(), e);
        }
    }

    /**
     * 5. Hứng sự kiện hoàn tất THỦ TỤC NHẬN PHÒNG thực tế (Check-in)
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCheckInCompleted(CheckInCompletedEvent event) {
        log.info("Notification-Event: Nhận sự kiện check-in hoàn tất cho Đơn ID: {}", event.getApplicationId());
        try {
            Map<String, Object> variables = new HashMap<>();
            variables.put("studentName", event.getStudentName());
            variables.put("bedName", event.getBedCode());
            variables.put("roomName", event.getRoomCode());

            NotificationPayload payload = NotificationPayload.builder()
                    .eventId("CHECKIN_" + event.getAssignmentId())
                    .type(NotificationType.ROOM)
                    .channels(Set.of(NotificationChannel.EMAIL, NotificationChannel.IN_APP))
                    .studentId(event.getStudentId())
                    .email(event.getEmail())
                    .recipientName(event.getStudentName())
                    .title("SDMS - Xác nhận hoàn tất thủ tục nhận phòng ở thực tế")
                    .emailTemplateName("checkin-completed")
                    .inAppMessage("Bạn đã hoàn tất nhận phòng thành công: Phòng " + event.getRoomCode() + ", Giường " + event.getBedCode() + ".")
                    .templateData(variables)
                    .build();

            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Notification-Event: Lỗi xảy ra trong quá trình xử lý gửi thông báo check-in: {}", e.getMessage(), e);
        }
    }

    /**
     * 6. Hứng sự kiện gia hạn lưu trú được phê duyệt
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleExtensionApproved(ExtensionApprovedEvent event) {
        log.info("Notification-Event: Đơn gia hạn số {} đã được phê duyệt.", event.getExtensionId());
        try {
            if (event.getStudentEmail() == null) {
                log.warn("ExtensionApprovedEvent lacks email, skipping notification for extension {}", event.getExtensionId());
                return;
            }

            Map<String, Object> variables = new HashMap<>();
            variables.put("studentName", event.getStudentFullName());
            variables.put("applicationId", event.getExtensionId().toString()); // Dùng tạm extensionId
            variables.put("status", "ĐA_PHE_DUYET");
            variables.put("reason", "Quyết định gia hạn của bạn đã được phê duyệt. Hệ thống đã tạo một hóa đơn thanh toán tiền KTX. Vui lòng kiểm tra mục Hóa đơn trên ứng dụng và hoàn tất nghĩa vụ tài chính.");

            Set<NotificationChannel> channels = new java.util.HashSet<>();
            channels.add(NotificationChannel.EMAIL);
            if (event.getStudentId() != null) channels.add(NotificationChannel.IN_APP);

            NotificationPayload payload = NotificationPayload.builder()
                    .eventId("EXT_APPROVE_" + event.getExtensionId())
                    .type(NotificationType.APPLICATION)
                    .channels(channels)
                    .studentId(event.getStudentId())
                    .email(event.getStudentEmail())
                    .recipientName(event.getStudentFullName())
                    .title("SDMS - Thông báo kết quả đơn xin gia hạn Ký túc xá")
                    .emailTemplateName("application-status")
                    .inAppMessage("Đơn gia hạn KTX của bạn đã được phê duyệt. Vui lòng thanh toán hóa đơn mới được tạo.")
                    .templateData(variables)
                    .build();

            notificationRouter.route(payload);
        } catch (Exception e) {
            log.error("Lỗi xử lý gửi thông báo duyệt đơn gia hạn: {}", e.getMessage(), e);
        }
    }
}