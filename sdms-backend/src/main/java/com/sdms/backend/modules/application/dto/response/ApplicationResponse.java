package com.sdms.backend.modules.application.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.sdms.backend.modules.application.enums.ApplicationStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApplicationResponse {
    private UUID applicationId;
    private String applicationCode;
    private String fullName;
    private String cccd;
    private String email;
    private String phone;
    private String dob;
    private String gender;
    private String permanentAddress;
    private String contactAddress;
    private List<String> priorityCategories;
    private List<DocumentResponse> documents;
    private ApplicationStatus status;
    private int priorityScore;
    private String registrationFormPdfUrl; // New field for registration form PDF
    private String commitmentFormPdfUrl;   // New field for commitment form PDF
    private LocalDateTime submittedAt;
    private LocalDateTime revisionDeadline;
    private AssignmentInfo assignment;

    @Data
    @Builder
    public static class AssignmentInfo {
        private String buildingName;
        private String floorName;
        private String roomName;
        private String bedName;
    }
}
