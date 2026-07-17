package com.sdms.backend.modules.student.adapter;

import com.sdms.backend.modules.face.port.StudentQueryPort;
import com.sdms.backend.modules.student.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class FaceStudentQueryAdapter implements StudentQueryPort {

    private final StudentRepository studentRepository;

    @Override
    public boolean existsById(UUID studentId) {
        return studentRepository.existsById(studentId);
    }

    @Override
    public String getStudentEmail(UUID studentId) {
        return studentRepository.findById(studentId)
                .map(com.sdms.backend.modules.student.entity.Student::getEmail)
                .orElse(null);
    }

    @Override
    public String getStudentFullName(UUID studentId) {
        return studentRepository.findById(studentId)
                .map(com.sdms.backend.modules.student.entity.Student::getFullName)
                .orElse(null);
    }
}
