package com.sdms.backend.modules.student.listener;

import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.StudentStatus;
import com.sdms.backend.modules.student.event.StudentCheckedOutEvent;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class StudentCheckoutEventListener {

    private final StudentRepository studentRepository;

    @EventListener
    @Transactional
    public void handleStudentCheckedOut(StudentCheckedOutEvent event) {
        log.info("Bắt đầu xử lý sự kiện Check-out cho sinh viên ID: {}, Code: {}", event.getStudentId(), event.getStudentCode());

        Student student = studentRepository.findById(event.getStudentId())
                .orElse(null);

        if (student != null) {
            // Cập nhật trạng thái thành INACTIVE
            student.setStatus(StudentStatus.INACTIVE);
            
            // Xóa quyền Smart Access (Vô hiệu hóa khuôn mặt)
            student.setIsFaceRegistered(false);
            student.setFaceImageUrl(null);
            
            studentRepository.save(student);
            
            log.info("Đã cập nhật trạng thái INACTIVE và vô hiệu hóa Smart Access cho sinh viên Code: {}", event.getStudentCode());
        } else {
            log.warn("Không tìm thấy sinh viên ID {} để xử lý sự kiện Check-out", event.getStudentId());
        }
    }
}
