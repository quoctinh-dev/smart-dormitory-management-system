package com.sdms.backend.modules.student.event;

import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.StudentStatus;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentEventListener {

    private final StudentRepository studentRepository;

    /**
     * Lắng nghe sự kiện Check-in hoàn tất (CheckInCompletedEvent).
     * Cập nhật trạng thái Student sang ACTIVE.
     * Chạy trong transaction mới sau khi transaction check-in gốc đã commit thành công.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleCheckInCompleted(CheckInCompletedEvent event) {
        log.info("[StudentEventListener] Handling CheckInCompletedEvent for student={}", event.getStudentId());
        
        try {
            Student student = studentRepository.findById(event.getStudentId())
                    .orElseThrow(() -> new IllegalArgumentException("Student not found: " + event.getStudentId()));

            student.setStatus(StudentStatus.ACTIVE);
            studentRepository.save(student);

            log.info("[StudentEventListener] Student={} status successfully transitioned to ACTIVE", event.getStudentId());
        } catch (Exception e) {
            log.error("[StudentEventListener] Failed to process CheckInCompletedEvent for student: {}", event.getStudentId(), e);
        }
    }
}
