package com.sdms.backend.modules.application.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.application.enums.PriorityCategory;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.common.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.util.UUID;

/**
 * DOMAIN ROLE: Aggregate Root cho quy trình tuyển sinh.
 * Lưu trữ toàn bộ dữ liệu thô (snapshot) tại thời điểm ứng viên đăng ký.
 * * LIFECYCLE:
 * PENDING
 * ↓
 * UNDER_REVIEW
 * ↓
 * WAITING_PAYMENT
 * ↓
 * APPROVED
 * * Sau khi APPROVED:
 * - Student được tạo
 * - UserAccount được tạo
 *
 * ARCHITECTURAL NOTE:
 * - Version: Dùng cho Optimistic Locking.
 * - Liên kết: Mối quan hệ ManyToOne với RegistrationPeriod để kiểm soát đợt đăng ký.
 */
@Entity
@Table(name = "dormitory_applications")
@Getter
@Setter
public class DormitoryApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID applicationId;

    @Version
    private Long version;

    /**
     * BUSINESS RELATIONSHIP: Đơn đăng ký thuộc về một đợt cụ thể.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private RegistrationPeriod registrationPeriod;

    // --- Thông tin cá nhân ---
    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(nullable = false)
    private LocalDate dob;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Gender gender;

    @Column(nullable = false, length = 20)
    private String cccd;

    private LocalDate issueDate;

    @Column(length = 100)
    private String issuePlace;

    @Column(length = 100)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String permanentAddress;

    // --- Thông tin gia đình ---
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

    // --- Nghiệp vụ xử lý ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private PriorityCategory priorityCategory;

    private Integer priorityScore = 0;

    @Column(nullable = false, unique = true, length = 50)
    private String applicationCode;

    @Column(columnDefinition = "TEXT")
    private String applicationPdfUrl;
}