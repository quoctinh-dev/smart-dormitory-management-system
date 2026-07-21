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

    private String permanentAddress;
    private String avatarUrl;
    private String status;

    private String dob;
    private String gender;
    private String issueDate;
    private String issuePlace;
    private String pob;
    private String ethnic;
    private String religion;
    private String cohort;
    private String contactAddress;
    private Integer fatherYob;
    private String fatherJob;
    private Integer motherYob;
    private String motherJob;
    private String familyContact;

    public static StudentProfileResponse fromEntity(Student student) {
        com.sdms.backend.modules.application.entity.DormitoryApplication app = student.getSourceApplication();
        return StudentProfileResponse.builder()
                .studentId(student.getStudentId())
                .studentCode(student.getStudentCode())
                .fullName(student.getFullName())
                .cccd(student.getCccd())
                .email(student.getEmail())
                .phone(student.getPhone())
                .faculty(student.getFaculty() != null ? student.getFaculty() : (app != null ? app.getFaculty() : null))
                .academicYear(student.getAcademicYear() != null ? student.getAcademicYear() : (app != null ? app.getCohort() : null))
                .dob(app != null && app.getDob() != null ? app.getDob().toString() : null)
                .gender(app != null && app.getGender() != null ? app.getGender().name() : null)
                .issueDate(app != null && app.getIssueDate() != null ? app.getIssueDate().toString() : null)
                .issuePlace(app != null ? app.getIssuePlace() : null)
                .pob(app != null ? app.getPob() : null)
                .ethnic(app != null ? app.getEthnic() : null)
                .religion(app != null ? app.getReligion() : null)
                .cohort(app != null ? app.getCohort() : null)
                .contactAddress(student.getContactAddress() != null ? student.getContactAddress() : (app != null ? app.getContactAddress() : null))
                .fatherName(student.getFatherName())
                .fatherYob(app != null ? app.getFatherYob() : null)
                .fatherJob(app != null ? app.getFatherJob() : null)
                .fatherPhone(student.getFatherPhone())
                .motherName(student.getMotherName())
                .motherYob(app != null ? app.getMotherYob() : null)
                .motherJob(app != null ? app.getMotherJob() : null)
                .motherPhone(student.getMotherPhone())

                .familyContact(app != null ? app.getContactAddress() : null)
                .permanentAddress(student.getPermanentAddress())
                .avatarUrl(student.getAvatarUrl())
                .status(student.getStatus() != null ? student.getStatus().name() : null)
                .build();
    }
}
