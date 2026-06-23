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
}
