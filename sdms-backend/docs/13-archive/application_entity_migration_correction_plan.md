# SDMS Application Entity & Migration Correction Plan (v1.0)

This document standardizes the correction plan for Java Entities, Enums, Repositories, and Flyway database migrations for the Application Module of the Smart Dormitory Management System (SDMS) based on the `APPLICATION-07` code implementation re-audit.

---

## 1. Entity Inventory

The final architecture of the Application Module is composed of the following entities:

| Entity Name | Purpose | Table Name | Ownership | Aggregate Root |
| :--- | :--- | :--- | :--- | :---: |
| **`DormitoryApplication`** | Core registration record, captures transient student details and submission metadata. | `dormitory_applications` | Application Module | **Yes** |
| **`ApplicationPriority`** | Records multiple priority categories claimed by the student on a single application. | `application_priorities` | `DormitoryApplication` | No |
| **`VerificationDocument`** | Tracks file uploads (scans/photos) and verification states. | `verification_documents` | `DormitoryApplication` | No |
| **`ApplicationGeneratedDocument`** | Manages auto-generated PDF files (`REGISTRATION_FORM`, `COMMITMENT_FORM`). | `application_generated_documents` | `DormitoryApplication` | No |
| **`DormitoryApplicationStatusHistory`**| Tracks status transition logs for auditing and timeline reports. | `dormitory_application_status_history` | `DormitoryApplication` | No |
| **`RegistrationPeriod`** | Manages admission semesters/periods and quotas. | `registration_periods` | Registration Module | **Yes** |
| **`RegistrationEligibility`** | Pre-uploaded list of eligible applicants imported from the school database. | `registration_eligibilities` | `RegistrationPeriod` | No |

---

## 2. Entity Correction Matrix

### A. `DormitoryApplication` (Correction Plan)
*   **Fields to Add:**
    *   `pob` (String / `pob` column): Place of birth (Physical form).
    *   `ethnic` (String / `ethnic` column): Dân tộc (Physical form).
    *   `religion` (String / `religion` column): Tôn giáo (Physical form).
    *   `faculty` (String / `faculty` column): Faculty name (Physical form).
    *   `contactAddress` (String / `contact_address` column): Current temporary address (Physical form).
    *   `fatherYob` (Integer / `father_yob` column): Father's YOB (Physical form).
    *   `fatherJob` (String / `father_job` column): Father's job (Physical form).
    *   `motherYob` (Integer / `mother_yob` column): Mother's YOB (Physical form).
    *   `motherJob` (String / `mother_job` column): Mother's job (Physical form).
    *   `familyContact` (String / `family_contact` column): Section II.3 "Địa chỉ/Điện thoại liên hệ khi cần" (Physical form).
    *   `emergencyContact` (String / `emergency_contact` column): System-extended contact (SDMS Extension).
    *   `reviewedByUserId` (UUID / `reviewed_by_user_id` column): Reviewer soft reference (SDMS Extension).
    *   `reviewNote` (String / `review_note` column): Admin review feedback (SDMS Extension).
    *   `commitmentAccepted` (Boolean / `commitment_accepted` column): Electronic signature consent flag (SDMS Extension).
    *   `commitmentAcceptedAt` (LocalDateTime / `commitment_accepted_at` column): Timestamp of consent (SDMS Extension).
    *   `commitmentVersion` (String / `commitment_version` column): Terms version (SDMS Extension).
    *   `clientIpAddress` (String / `client_ip_address` column): IP address of submitter (SDMS Extension).
*   **Fields to Remove:**
    *   `priorityCategory` (Enum): Deprecated. Superseded by the new $1:N$ association with `ApplicationPriority` to support multiple priorities.
*   **Fields to Keep:**
    *   `applicationId`, `version`, `registrationPeriod`, `fullName`, `dob`, `gender`, `cccd`, `issueDate`, `issuePlace`, `email`, `phone`, `fatherName`, `fatherPhone`, `motherName`, `motherPhone`, `status`, `priorityScore`, `applicationCode`, `waitingListUsed`, `paymentDeadline`, `approvedAt`, `submittedAt`, `applicationPdfUrl` (kept for backward compatibility, though superseded by `ApplicationGeneratedDocument`).

### B. `VerificationDocument` (Correction Plan)
*   **Fields to Add:**
    *   `note` (String / `note` column): Rejection/verification note.
    *   `verifiedAt` (LocalDateTime / `verified_at` column): Timestamp of verification.
*   **Enum Refactoring:**
    *   Modify `documentType` attribute to use `VerificationDocumentType` instead of legacy `DocumentType`.
    *   Modify `status` attribute to use `VerificationStatus` instead of legacy `DocumentStatus`.

### C. `RegistrationEligibility` (Correction Plan)
*   **Fields to Add:**
    *   `email` (String / `email` column): Imported pre-registered email.
    *   `studentCode` (String / `student_code` column, Nullable): Pre-registered student ID.
    *   `target` (`RegistrationTarget` / `target` column): Target group classification.

---

## 3. Enum Correction Matrix

| Enum Name | Action | Details / Values |
| :--- | :---: | :--- |
| **`ApplicationStatus`** | **MODIFY** | Remove `REVISION_REQUIRED`. Keep: `PENDING`, `UNDER_REVIEW`, `APPROVED`, `WAITING_LIST`, `WAITING_PAYMENT`, `REJECTED`, `EXPIRED`. |
| **`PriorityCategory`** | **MODIFY** | Align with the 7 physical STU groups: `PRIORITY_01` (Con liệt sĩ/thương binh) to `PRIORITY_07` (Công tác xã hội), plus `NONE`. |
| **`VerificationStatus`** | **CREATE** | Replaces legacy `DocumentStatus`. Values: `PENDING`, `VALID`, `INVALID`. |
| **`VerificationDocumentType`** | **CREATE** | Replaces legacy `DocumentType`. Normal: `CCCD_FRONT`, `CCCD_BACK`, `PORTRAIT_PHOTO`, `COMMITMENT_FORM`. Priority: `PRIORITY_01_PROOF` to `PRIORITY_07_PROOF`. |
| **`GeneratedDocumentType`** | **CREATE** | Values: `REGISTRATION_FORM`, `COMMITMENT_FORM`. |
| **`RegistrationTarget`** | **CREATE** | Values: `FRESHMAN`, `CURRENT_STUDENT`, `ALL`. |
| **`RegistrationType`** | **KEEP** | Values: `NEW` (Groups A & B), `RENEWAL` (Group C). |

---

## 4. Repository Inventory

The repositories to implement/update in the codebase are:

1.  **`DormitoryApplicationRepository` (Update):** Adjust query methods to match the revised entity attributes and the updated `ApplicationStatus` values.
2.  **`VerificationDocumentRepository` (Update):** Ensure clean queries fetching documents by application ID.
3.  **`ApplicationPriorityRepository` (Create):** Standard JpaRepository.
4.  **`ApplicationGeneratedDocumentRepository` (Create):** Query generated PDFs by application ID and document type.
5.  **`DormitoryApplicationStatusHistoryRepository` (Create):** Fetch status logs for audit timelines.
6.  **`RegistrationPeriodRepository` (Keep):** Standard query methods.
7.  **`RegistrationEligibilityRepository` (Keep):** Queries validating imported lists.

---

## 5. V16 Migration Plan

File: `V16__application_module_refactor.sql`

### A. Tables to Create:
1.  `application_priorities`:
    *   PK: `application_priority_id` (UUID).
    *   FK: `application_id` referencing `dormitory_applications(application_id) ON DELETE CASCADE`.
    *   Columns: `priority_category` (VARCHAR(50)), `priority_score` (INTEGER), audit timestamps.
    *   Constraint: Unique on `(application_id, priority_category)`.
2.  `dormitory_application_status_history`:
    *   PK: `history_id` (UUID).
    *   FK: `application_id` referencing `dormitory_applications(application_id) ON DELETE CASCADE`.
    *   Columns: `from_status` (VARCHAR(20)), `to_status` (VARCHAR(20)), `changed_by_user_id` (UUID soft reference), `changed_at` (TIMESTAMP), `note` (TEXT).
3.  `application_generated_documents`:
    *   PK: `document_id` (UUID).
    *   FK: `application_id` referencing `dormitory_applications(application_id) ON DELETE CASCADE`.
    *   Columns: `document_type` (VARCHAR(50)), `file_url` (TEXT), `template_version` (VARCHAR(10)), `generated_at` (TIMESTAMP).

### B. Tables to Alter:
1.  `dormitory_applications`: Add columns: `reviewed_by_user_id` (UUID), `review_note` (TEXT), `student_code` (VARCHAR(50)), `pob` (VARCHAR(100)), `ethnic` (VARCHAR(50)), `religion` (VARCHAR(50)), `faculty` (VARCHAR(100)), `contact_address` (TEXT), `father_yob` (INTEGER), `father_job` (VARCHAR(100)), `mother_yob` (INTEGER), `mother_job` (VARCHAR(100)), `family_contact` (TEXT), `emergency_contact` (VARCHAR(100)), `commitment_accepted` (BOOLEAN), `commitment_accepted_at` (TIMESTAMP), `commitment_version` (VARCHAR(10)), `client_ip_address` (VARCHAR(45)).
2.  `registration_eligibilities`: Add columns: `email` (VARCHAR(100)), `student_code` (VARCHAR(50)), `target` (VARCHAR(50)).
3.  `verification_documents`: Add columns: `note` (TEXT), `verified_at` (TIMESTAMP).

### C. Indexes & Constraints to Create:
*   Unique index: `uk_period_cccd` on `dormitory_applications(period_id, cccd)` (restricts to one application per period).
*   Search index: `idx_dorm_app_cccd` on `dormitory_applications(cccd)`.
*   Search index: `idx_dorm_app_student_code` on `dormitory_applications(student_code)`.
*   Scheduler optimization index: `idx_dorm_app_waiting_list_promotion` on `dormitory_applications(gender, priority_score DESC, created_at ASC) WHERE status = 'WAITING_LIST'`.

---

## 6. Boundary Validation

*   **Audit Check:** Does the Application Module design reference external JPA entities or database foreign keys pointing to payments, bills, student profiles, accounts, or beds?
*   **Result:** **PASS**. Module isolation is strictly maintained. The Application Module only records user references using soft UUIDs (`reviewedByUserId` and `changedByUserId`) without mapping them in Hibernate or database-level constraints. Communication to outside modules (Room, Payment, Student) is event-driven.

---

## 7. PASS / WARNING / FAIL

*   **Status:** **PASS**. The correction plan addresses all entity gaps, specifies enum modifications, outlines repository additions, details the database schema migration roadmap, and enforces strict boundary isolation rules.

---

## 8. Implementation Readiness Score

*   **Score:** **10/10**. The blueprint is fully aligned with the frozen modular boundaries of SDMS V1, ensuring zero runtime or database pollution.

---

## 9. Final Decision

**READY FOR APPLICATION-07B**
