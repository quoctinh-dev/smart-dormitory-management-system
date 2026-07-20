package com.sdms.backend.modules.student.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.registration.entity.RegistrationPeriod;
import com.sdms.backend.modules.room.entity.Bed;
import com.sdms.backend.modules.student.enums.ExtensionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * DOMAIN ROLE: Lưu trữ hồ sơ gia hạn lưu trú của sinh viên.
 * BUSINESS PURPOSE: Quản lý đợt gia hạn trực tuyến.
 */
@Entity
@Table(name = "stay_extensions")
@Getter
@Setter
public class StayExtension extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID extensionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ExtensionStatus status = ExtensionStatus.PENDING;

    /**
     * [BUSINESS RULE] Mỗi sinh viên chỉ được nộp 1 đơn gia hạn trong 1 đợt đăng ký.
     * Dùng trường này để check uniqueness theo đợt, không check globally.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "registration_period_id", nullable = false)
    private RegistrationPeriod registrationPeriod;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_bed_id", nullable = false)
    private Bed currentBed;

    @Column(columnDefinition = "TEXT")
    private String contractPdfUrl;

    @Column(columnDefinition = "TEXT")
    private String commitmentPdfUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String rejectReason;

    @Column
    private java.time.LocalDateTime oldExpectedCheckOutAt;

    @Column
    private java.time.LocalDateTime newExpectedCheckOutAt;
}
