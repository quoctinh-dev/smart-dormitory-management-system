package com.sdms.backend.modules.application.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.application.enums.DocumentStatus;
import com.sdms.backend.modules.application.enums.DocumentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DOMAIN ROLE: Lưu trữ tài liệu minh chứng cho hồ sơ đăng ký.
 * BUSINESS PURPOSE: Phục vụ công tác hậu kiểm và duyệt hồ sơ.
 * ARCHITECTURAL NOTE: Chỉ lưu trạng thái thực tế, không chứa logic cấu hình (required).
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
    @Column(nullable = false, length = 50)
    private DocumentType documentType;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DocumentStatus status = DocumentStatus.PENDING;
}