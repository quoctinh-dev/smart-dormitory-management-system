package com.sdms.backend.modules.student.event;

import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.StudentStatus;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentProvisioningListener {

    private final DormitoryApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("[StudentProvisioningListener] Handling PaymentSuccessEvent for applicationId={}", event.getApplicationId());

        Optional<DormitoryApplication> appOpt = applicationRepository.findById(event.getApplicationId());
        if (appOpt.isEmpty()) {
            log.error("[StudentProvisioningListener] Application={} not found", event.getApplicationId());
            return;
        }

        DormitoryApplication app = appOpt.get();

        // Cập nhật trạng thái hồ sơ sang APPROVED (Hoàn tất đóng tiền)
        if (app.getStatus() == com.sdms.backend.modules.application.enums.ApplicationStatus.WAITING_PAYMENT) {
            app.setStatus(com.sdms.backend.modules.application.enums.ApplicationStatus.APPROVED);
            applicationRepository.save(app);
            log.info("[StudentProvisioningListener] Application={} marked as APPROVED after payment.", app.getApplicationId());
        }

        // TODO (Production Readiness): Use Outbox pattern or processed_event_log table
        // to handle webhook idempotency instead of relying purely on business data (CCCD).
        if (studentRepository.existsByCccd(app.getCccd())) {
            log.warn("[StudentProvisioningListener] Student with CCCD={} already exists, skipping provisioning", app.getCccd());
            return;
        }

        Student student = new Student();
        student.setSourceApplication(app);
        // Using CCCD as the initial studentCode since we don't have a formal generator yet
        student.setStudentCode("STU-" + app.getCccd());
        student.setFullName(app.getFullName());
        student.setCccd(app.getCccd());
        student.setEmail(app.getEmail());
        student.setPhone(app.getPhone());
        student.setFaculty(app.getFaculty());
        student.setFatherName(app.getFatherName());
        student.setFatherPhone(app.getFatherPhone());
        student.setMotherName(app.getMotherName());
        student.setMotherPhone(app.getMotherPhone());
        student.setEmergencyContact(app.getEmergencyContact());
        student.setPermanentAddress(app.getPermanentAddress());
        student.setIsFaceRegistered(false);
        student.setStatus(StudentStatus.PENDING_CHECKIN);

        Student savedStudent = studentRepository.save(student);
        log.info("[StudentProvisioningListener] Successfully provisioned Student={} for Application={}", savedStudent.getStudentId(), app.getApplicationId());

        eventPublisher.publishEvent(new StudentCreatedEvent(this, savedStudent.getStudentId(), event.getAssignmentId()));
    }
}
