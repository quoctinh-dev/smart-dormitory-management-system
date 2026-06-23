package com.sdms.backend.modules.application.entity;

import com.sdms.backend.modules.application.enums.GeneratedDocumentType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Entity quản lý các tài liệu PDF tự động sinh của hồ sơ (SDMS Extension).
 */
@Entity
@Table(name = "application_generated_documents")
@Getter
@Setter
public class ApplicationGeneratedDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "document_id")
    private UUID documentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private DormitoryApplication application;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 50)
    private GeneratedDocumentType documentType;

    @Column(name = "file_url", nullable = false, columnDefinition = "TEXT")
    private String fileUrl;

    @Column(name = "template_version", nullable = false, length = 10)
    private String templateVersion = "V1.0";

    @Column(name = "generated_at", nullable = false)
    private LocalDateTime generatedAt = LocalDateTime.now();
}
