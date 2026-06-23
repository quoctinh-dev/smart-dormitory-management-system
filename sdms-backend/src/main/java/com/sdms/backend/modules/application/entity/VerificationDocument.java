package com.sdms.backend.modules.application.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DOMAIN ROLE: Lưu trữ tài liệu minh chứng cho hồ sơ đăng ký.
 */
@Entity
@Table(name = "verification_documents")
@Getter
@Setter
public class VerificationDocument extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private DormitoryApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private VerificationDocumentType documentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VerificationStatus status = VerificationStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String note;

    private LocalDateTime verifiedAt;
}