package com.sdms.backend.modules.application.dto.response;

import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.enums.VerificationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Getter
@Setter
@Builder
public class DocumentResponse {
    private UUID documentId;
    private VerificationDocumentType documentType;
    private String fileUrl;
    private VerificationStatus status;
    private String note;
}
