package com.sdms.backend.modules.student.dto.response;

import com.sdms.backend.modules.student.entity.Student;
import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class StudentProfileResponse {
    private UUID studentId;
    private String studentCode;
    private String fullName;
    private String cccd;
    private String email;
    private String phone;
    private String faculty;
    private String academicYear;
    private String fatherName;
    private String fatherPhone;
    private String motherName;
    private String motherPhone;
    private String emergencyContact;
    private String permanentAddress;
    private String avatarUrl;
    private String status;

    public static StudentProfileResponse fromEntity(Student student) {
        return StudentProfileResponse.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .cccd(student.getCccd())
                .email(student.getEmail())
                .phone(student.getPhone())
                .faculty(student.getFaculty())
                .academicYear(student.getAcademicYear())
                .fatherName(student.getFatherName())
                .fatherPhone(student.getFatherPhone())
                .motherName(student.getMotherName())
                .motherPhone(student.getMotherPhone())
                .emergencyContact(student.getEmergencyContact())
                .permanentAddress(student.getPermanentAddress())
                .avatarUrl(student.getAvatarUrl())
                .status(student.getStatus().name())
                .build();
    }
}
