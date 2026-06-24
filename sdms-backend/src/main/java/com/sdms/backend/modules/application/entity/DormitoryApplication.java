package com.sdms.backend.modules.application.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.common.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * DOMAIN ROLE: Aggregate Root cho quy trình tuyển sinh KTX (SDMS V1 Hardening).
 * Lưu trữ toàn bộ dữ liệu thô (snapshot) tại thời điểm ứng viên đăng ký trực tuyến.
 */
@Entity
@Table(
    name = "dormitory_applications",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_period_cccd",
            columnNames = {"period_id", "cccd"}
        )
    }
)
@Getter
@Setter
public class DormitoryApplication extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID applicationId;

    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private RegistrationPeriod registrationPeriod;

    // --- Thông tin cá nhân (Đồng bộ trực tiếp sang Student Profile và Face Matching Module) ---
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

    // --- Thông tin cá nhân bổ sung (Trích xuất từ biểu mẫu giấy STU) ---
    @Column(length = 100)
    private String pob;

    @Column(length = 50)
    private String ethnic;

    @Column(length = 50)
    private String religion;

    @Column(length = 100)
    private String faculty;

    @Column(columnDefinition = "TEXT")
    private String contactAddress;

    // --- Thông tin gia đình ---
    @Column(length = 100)
    private String fatherName;

    private Integer fatherYob;

    @Column(length = 100)
    private String fatherJob;

    @Column(length = 20)
    private String fatherPhone;

    @Column(length = 100)
    private String motherName;

    private Integer motherYob;

    @Column(length = 100)
    private String motherJob;

    @Column(length = 20)
    private String motherPhone;

    @Column(columnDefinition = "TEXT")
    private String familyContact; // Liên hệ khi cần (Mục II.3)

    @Column(length = 100)
    private String emergencyContact; // SDMS System Extension

    // --- Nghiệp vụ phân tầng xử lý dữ liệu và Hàng đợi ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ApplicationStatus status;

    private Integer priorityScore = 0;

    @Column(nullable = false, unique = true, length = 50)
    private String applicationCode;

    // Updated PDF URLs
    @Column(columnDefinition = "TEXT")
    private String registrationFormPdfUrl;

    @Column(columnDefinition = "TEXT")
    private String commitmentFormPdfUrl;

    // --- Người duyệt và Ghi chú (Soft Reference) ---
    private UUID reviewedByUserId;

    @Column(columnDefinition = "TEXT")
    private String reviewNote;

    // --- Chấp thuận cam kết điện tử (Electronic Signature Consent Audit) ---
    private Boolean commitmentAccepted = false;

    private LocalDateTime commitmentAcceptedAt;

    @Column(length = 10)
    private String commitmentVersion;

    @Column(length = 45)
    private String clientIpAddress;

    // ========================================================================
    // SDMS V1 WAITING LIST & PAYMENT WINDOW FIELDS
    // ========================================================================
    @Column(nullable = false)
    private Boolean waitingListUsed = false;

    private LocalDateTime paymentDeadline;

    private LocalDateTime revisionDeadline;

    private LocalDateTime approvedAt;

    private LocalDateTime submittedAt;

    // ========================================================================
    // RELATIONSHIPS (CHILD ENTITIES)
    // ========================================================================
    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.Set<ApplicationPriority> priorities = new java.util.HashSet<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.Set<VerificationDocument> documents = new java.util.HashSet<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ApplicationGeneratedDocument> generatedDocuments = new ArrayList<>();

    @OneToMany(mappedBy = "application", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<DormitoryApplicationStatusHistory> statusHistory = new ArrayList<>();
}
