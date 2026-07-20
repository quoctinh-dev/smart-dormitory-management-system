package com.sdms.backend.modules.payment.event;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentIntegrationListener {

    private final DormitoryApplicationRepository applicationRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;

    /**
     * Lắng nghe sự kiện PaymentSuccessEvent SAU KHI transaction payment đã COMMIT thành công.
     *
     * Dùng @TransactionalEventListener(phase = AFTER_COMMIT) thay vì @EventListener để tránh
     * race condition: nếu dùng @EventListener, listener có thể chạy trước khi transaction
     * gốc commit xong, dẫn đến đọc được dữ liệu cũ (stale read).
     *
     * Dùng @Transactional(propagation = REQUIRES_NEW) để tạo transaction mới hoàn toàn
     * độc lập, không bị ảnh hưởng bởi transaction gốc.
     */
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("[PaymentIntegrationListener] Handling PaymentSuccessEvent for applicationId={} and assignmentId={}",
                event.getApplicationId(), event.getAssignmentId());

        try {
            DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                            "Không tìm thấy đơn đăng ký với ID: " + event.getApplicationId()));

            if (application.getStatus() == ApplicationStatus.WAITING_PAYMENT) {
                application.setStatus(ApplicationStatus.APPROVED);
                applicationRepository.save(application);
                log.info("[PaymentIntegrationListener] Application {} status updated to APPROVED.", event.getApplicationId());

                StudentHousingAssignment assignment = assignmentRepository.findById(event.getAssignmentId())
                        .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND,
                                "Không tìm thấy quyết định xếp phòng với ID: " + event.getAssignmentId()));

                if (assignment.getStatus() == AssignmentStatus.RESERVED) {
                    assignment.setStatus(AssignmentStatus.PENDING_CHECKIN);
                    assignmentRepository.save(assignment);
                    log.info("[PaymentIntegrationListener] Assignment {} status updated to PENDING_CHECKIN.", event.getAssignmentId());
                } else {
                    log.warn("[PaymentIntegrationListener] Assignment {} was not in RESERVED status (current: {}). Skipping status update.",
                            event.getAssignmentId(), assignment.getStatus());
                }
            } else {
                log.warn("[PaymentIntegrationListener] Application {} was not in WAITING_PAYMENT status (current: {}). Skipping status update.",
                        event.getApplicationId(), application.getStatus());
            }

        } catch (Exception e) {
            log.error("[PaymentIntegrationListener] Failed to process PaymentSuccessEvent for applicationId={}. Reason: {}",
                    event.getApplicationId(), e.getMessage(), e);
        }
    }
}
