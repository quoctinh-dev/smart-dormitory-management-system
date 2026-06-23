package com.sdms.backend.modules.application.repository;

import com.sdms.backend.modules.application.entity.VerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, UUID> {
    List<VerificationDocument> findByApplication_ApplicationId(UUID applicationId);
    java.util.Optional<VerificationDocument> findByApplication_ApplicationIdAndDocumentType(UUID applicationId, com.sdms.backend.modules.application.enums.VerificationDocumentType documentType);
}
