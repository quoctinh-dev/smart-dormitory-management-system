package com.sdms.backend.modules.application.dto.response;

import com.sdms.backend.modules.application.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
public class ApplicationResponse {
    private UUID applicationId;
    private String applicationCode;
    private String fullName;
    private String cccd;
    private String email;
    private String phone;
    
    // Additional fields for review
    private String dob;
    private String gender;
    private String permanentAddress;
    private String contactAddress;
    private java.util.List<String> priorityCategories;
    
    // Documents
    private java.util.List<DocumentResponse> documents;

    private ApplicationStatus status;
    private int priorityScore;
    private String applicationPdfUrl;
    private LocalDateTime submittedAt;
    private LocalDateTime revisionDeadline;
}
