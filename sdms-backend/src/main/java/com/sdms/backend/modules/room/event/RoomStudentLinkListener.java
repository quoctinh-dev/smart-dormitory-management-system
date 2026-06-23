package com.sdms.backend.modules.room.event;

import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.event.StudentCreatedEvent;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class RoomStudentLinkListener {

    private final StudentHousingAssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;

    @org.springframework.context.event.EventListener
    public void handleStudentCreatedEvent(StudentCreatedEvent event) {
        log.info("[RoomStudentLinkListener] Handling StudentCreatedEvent for assignmentId={}", event.getAssignmentId());

        Optional<StudentHousingAssignment> assignmentOpt = assignmentRepository.findByIdForUpdate(event.getAssignmentId());
        if (assignmentOpt.isEmpty()) {
            log.error("[RoomStudentLinkListener] Assignment not found: {}", event.getAssignmentId());
            return;
        }

        StudentHousingAssignment assignment = assignmentOpt.get();

        if (assignment.getStatus() != AssignmentStatus.RESERVED) {
            log.warn("[RoomStudentLinkListener] Assignment={} is not in RESERVED state (current={}), skipping link", 
                    event.getAssignmentId(), assignment.getStatus());
            return;
        }

        if (assignment.getStudent() != null) {
            log.warn("[RoomStudentLinkListener] Assignment={} already linked to student={}, skipping.", 
                    event.getAssignmentId(), assignment.getStudent().getStudentId());
            return;
        }

        Optional<Student> studentOpt = studentRepository.findById(event.getStudentId());
        if (studentOpt.isEmpty()) {
            log.error("[RoomStudentLinkListener] Student not found: {}", event.getStudentId());
            return;
        }

        assignment.setStudent(studentOpt.get());
        assignment.setStatus(AssignmentStatus.PENDING_CHECKIN);
        
        assignmentRepository.save(assignment);
        log.info("[RoomStudentLinkListener] Successfully linked student={} to assignment={} and transitioned to PENDING_CHECKIN", 
                event.getStudentId(), event.getAssignmentId());
    }
}
