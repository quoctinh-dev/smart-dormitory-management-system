package com.sdms.backend.modules.student.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.student.enums.StudentStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DOMAIN ROLE: Hồ sơ cư dân chính thức của KTX (Resident Profile).
 * BUSINESS PURPOSE: Quản lý thông tin cư trú, liên lạc và học vụ trong suốt quá trình ở KTX.
 * ARCHITECTURAL NOTE:
 * - Mối quan hệ với sourceApplication là bất biến (updatable = false).
 * - Tối ưu truy vấn bằng Index trên các trường định danh duy nhất.
 */
@Entity
@Table(
        name = "students",
        indexes = {
                @Index(name = "idx_student_code", columnList = "studentCode"),
                @Index(name = "idx_student_cccd", columnList = "cccd")
        }
)
@Getter
@Setter
public class Student extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID studentId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "source_application_id",
            unique = true,
            nullable = false,
            updatable = false
    )
    private DormitoryApplication sourceApplication;

    @Column(unique = true, length = 50)
    private String studentCode;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 20)
    private String cccd;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String faculty;

    @Column(length = 20)
    private String academicYear;

    @Column(length = 100)
    private String fatherName;
    @Column(length = 20)
    private String fatherPhone;
    @Column(length = 100)
    private String motherName;
    @Column(length = 20)
    private String motherPhone;

    @Column(length = 20)
    private String emergencyContact;

    @Column(columnDefinition = "TEXT")
    private String permanentAddress;

    @Column(length = 500)
    private String avatarUrl;

    @Column(length = 500)
    private String faceImageUrl;

    @Column(nullable = false)
    private Boolean isFaceRegistered = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StudentStatus status = StudentStatus.PENDING_CHECKIN;
}