package com.sdms.backend.modules.user.event;

import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.event.StudentCreatedEvent;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentCreatedEventListener {

    private final UserAccountRepository userAccountRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;

    @org.springframework.context.event.EventListener
    public void handleStudentCreatedEvent(StudentCreatedEvent event) {
        log.info("[StudentCreatedEventListener] Handling StudentCreatedEvent for studentId={}", event.getStudentId());

        if (userAccountRepository.findByStudent_StudentId(event.getStudentId()).isPresent()) {
            log.warn("[StudentCreatedEventListener] UserAccount for studentId={} already exists, skipping.", event.getStudentId());
            return;
        }

        Optional<Student> studentOpt = studentRepository.findById(event.getStudentId());
        if (studentOpt.isEmpty()) {
            log.error("[StudentCreatedEventListener] Student not found for studentId={}", event.getStudentId());
            return;
        }

        Student student = studentOpt.get();

        UserAccount userAccount = new UserAccount();
        userAccount.setUsername(student.getStudentCode());
        userAccount.setEmail(student.getEmail());
        
        // Generate a simple temporary password
        String tempPassword = "TEMP-" + student.getCccd();
        userAccount.setPassword(passwordEncoder.encode(tempPassword));
        
        userAccount.setRole(Role.STUDENT);
        userAccount.setStatus(AccountStatus.PENDING_ACTIVATION);
        userAccount.setStudent(student);

        userAccountRepository.save(userAccount);
        log.info("[StudentCreatedEventListener] Created UserAccount for studentId={}", student.getStudentId());
    }
}
