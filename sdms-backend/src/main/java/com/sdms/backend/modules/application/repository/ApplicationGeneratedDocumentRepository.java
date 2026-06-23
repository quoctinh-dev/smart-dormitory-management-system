package com.sdms.backend.modules.application.repository;

import com.sdms.backend.modules.application.entity.ApplicationGeneratedDocument;
import com.sdms.backend.modules.application.enums.GeneratedDocumentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationGeneratedDocumentRepository extends JpaRepository<ApplicationGeneratedDocument, UUID> {
    List<ApplicationGeneratedDocument> findByApplication_ApplicationId(UUID applicationId);
    Optional<ApplicationGeneratedDocument> findByApplication_ApplicationIdAndDocumentType(UUID applicationId, GeneratedDocumentType documentType);
}
