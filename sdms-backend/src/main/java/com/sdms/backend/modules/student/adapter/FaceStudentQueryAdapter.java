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

    @Override
    public String getStudentCode(UUID studentId) {
        return studentRepository.findById(studentId)
                .map(com.sdms.backend.modules.student.entity.Student::getStudentCode)
                .orElse(null);
    }

    @Override
    public java.util.Map<UUID, StudentQueryPort.StudentBasicInfo> getStudentBasicInfoMap(java.util.List<UUID> studentIds) {
        if (studentIds == null || studentIds.isEmpty()) return java.util.Collections.emptyMap();
        return studentRepository.findAllById(studentIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        com.sdms.backend.modules.student.entity.Student::getStudentId,
                        s -> new StudentQueryPort.StudentBasicInfo(s.getStudentCode(), s.getFullName())
                ));
    }
}
