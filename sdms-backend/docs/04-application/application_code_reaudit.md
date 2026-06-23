# SDMS Application Code Re-Audit (v1.0)

This document performs the corrected code re-audit for the Application Module of the Smart Dormitory Management System (SDMS), checking only the active source code directories and comparing the implementation strictly against the approved `APPLICATION-06` Database Freeze.

---

## 1. Entity Re-Audit (Check 01, 02, 03)

The entities located in `src/main/java/com/sdms/backend/modules/application/entity` and `src/main/java/com/sdms/backend/modules/registration/entity` have been audited.

### A. `DormitoryApplication.java`
*   **File Path:** [DormitoryApplication.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplication.java)
*   **Status:** ⚠️ **MISMATCH (FAIL)**
*   **Evidence of Gaps:**
    *   **Missing 10 fields from physical registration form:**
        *   `pob` (Nơi sinh) - Absent.
        *   `ethnic` (Dân tộc) - Absent.
        *   `religion` (Tôn giáo) - Absent.
        *   `faculty` (Khoa) - Absent.
        *   `contactAddress` (Địa chỉ liên hệ hiện tại) - Absent.
        *   `fatherYob` (Năm sinh cha) - Absent.
        *   `fatherJob` (Nghề nghiệp cha) - Absent.
        *   `motherYob` (Năm sinh mẹ) - Absent.
        *   `motherJob` (Nghề nghiệp mẹ) - Absent.
        *   `familyContact` (Địa chỉ/Điện thoại liên hệ khi cần - Mục II.3) - Absent.
    *   **Missing 1 field from extended system metadata:**
        *   `emergencyContact` (Liên hệ khẩn cấp mở rộng - SDMS Extension) - Absent.
    *   **Missing 2 fields for admin review details:**
        *   `reviewedByUserId` (UUID soft reference to UserAccount) - Absent.
        *   `reviewNote` (TEXT comment) - Absent.
    *   **Missing 4 fields for commitment acceptance logging:**
        *   `commitmentAccepted` (BOOLEAN) - Absent.
        *   `commitmentAcceptedAt` (TIMESTAMP) - Absent.
        *   `commitmentVersion` (VARCHAR) - Absent.
        *   `clientIpAddress` (VARCHAR) - Absent.
    *   **Redundant field:**
        *   `priorityCategory` (flat enum column) is still present. Under `APPLICATION-06`, it is deprecated in favor of the $1:N$ relation `ApplicationPriority`.

### B. `VerificationDocument.java`
*   **File Path:** [VerificationDocument.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/entity/VerificationDocument.java)
*   **Status:** ⚠️ **MISMATCH (FAIL)**
*   **Evidence of Gaps:**
    *   **Missing fields:** `note` (TEXT comment) and `verifiedAt` (TIMESTAMP).
    *   **Enum naming mismatches:** It maps to `DocumentType` and `DocumentStatus` instead of the frozen names `VerificationDocumentType` and `VerificationStatus`.

### C. `RegistrationEligibility.java`
*   **File Path:** [RegistrationEligibility.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/registration/entity/RegistrationEligibility.java)
*   **Status:** ⚠️ **MISMATCH (FAIL)**
*   **Evidence of Gaps:**
    *   **Missing fields:** `email` (VARCHAR), `studentCode` (VARCHAR, Nullable), and `target` (VARCHAR / Enum). These are required to validate imported eligibility lists from the school registry.

### D. Missing Entities
The following entities frozen under `APPLICATION-06` are **completely absent** from the active codebase (i.e. they do not exist under any other package):
1.  **`ApplicationPriority.java`**: **NOT FOUND**. Truly absent from source code.
    *   *Role:* Holds the multiple priority categories associated with an application (1:N relationship).
2.  **`ApplicationGeneratedDocument.java`**: **NOT FOUND**. Truly absent from source code.
    *   *Role:* Manages the auto-generated PDF files (`REGISTRATION_FORM` and `COMMITMENT_FORM`).
3.  **`DormitoryApplicationStatusHistory.java`**: **NOT FOUND**. Truly absent from source code.
    *   *Role:* Logs all state transitions of `DormitoryApplication` for audit tracking.

---

## 2. Enum Re-Audit (Check 06)

*   **`ApplicationStatus.java`**:
    *   **File Path:** [ApplicationStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/enums/ApplicationStatus.java)
    *   **Status:** ⚠️ **MISMATCH (FAIL)**
    *   **Evidence:** Contains the status `REVISION_REQUIRED`. Under `APPLICATION-06`, the supplementary review loop is eliminated; applications are either approved (`APPROVED` / `WAITING_LIST` / `WAITING_PAYMENT`) or rejected (`REJECTED`), forcing the student to submit a new application.
*   **`PriorityCategory.java`**:
    *   **File Path:** [PriorityCategory.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/enums/PriorityCategory.java)
    *   **Status:** ⚠️ **MISMATCH (FAIL)**
    *   **Evidence:** Implements 8 categories + `NONE` with incorrect scores (e.g. `ETHNIC_MINORITY` is 75 instead of 70, `REMOTE_AREA` is 70 instead of 60, `PARTY_MEMBER` is 65 instead of 50). These must be aligned with the 7 priority groups of the STU form.
*   **Missing Enums:**
    *   **`GeneratedDocumentType.java`**: **NOT FOUND**. Truly absent.
    *   **`VerificationDocumentType.java`**: **NOT FOUND**. Truly absent (currently named legacy `DocumentType`).
    *   **`VerificationStatus.java`**: **NOT FOUND**. Truly absent (currently named legacy `DocumentStatus`).
    *   **`RegistrationTarget.java`**: **NOT FOUND**. Truly absent.

---

## 3. Repository Re-Audit (Check 07)

*   **`DormitoryApplicationRepository.java`**:
    *   **File Path:** [DormitoryApplicationRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/repository/DormitoryApplicationRepository.java)
    *   **Status:** ⚠️ **MISMATCH (FAIL)**
    *   **Evidence:** Relies on the old flat priority columns and outdated enums (such as `ApplicationStatus` containing `REVISION_REQUIRED`).
*   **Missing Repositories:**
    The following repositories are **completely absent** from the active codebase:
    1.  `ApplicationPriorityRepository.java`: **NOT FOUND**.
    2.  `ApplicationGeneratedDocumentRepository.java`: **NOT FOUND**.
    3.  `DormitoryApplicationStatusHistoryRepository.java`: **NOT FOUND**.

---

## 4. Flyway Schema Re-Audit (Check 08)

*   **Audit:** The migration directory `src/main/resources/db/migration` contains migrations up to `V15__student_face_registration_support.sql`.
*   **Status:** ❌ **MISSING (FAIL)**
*   **Evidence:** The refactoring script `V16__application_module_refactor.sql` is completely missing. The database schema lacks all columns, indexes, constraints, and tables required to support multiple priorities, status logs, generated PDFs, and expanded eligibility lists.

---

## 5. PASS / WARNING / FAIL

*   **Status:** **FAIL**. The active source code is out of sync with the frozen database and domain model specifications. Multiple entity classes, enum values, repositories, and the Flyway migration script are missing.

---

## 6. FILES TO MODIFY

*   `src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplication.java`
*   `src/main/java/com/sdms/backend/modules/application/entity/VerificationDocument.java`
*   `src/main/java/com/sdms/backend/modules/registration/entity/RegistrationEligibility.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/ApplicationStatus.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/PriorityCategory.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/DormitoryApplicationRepository.java`

---

## 7. FILES TO CREATE

*   `src/main/resources/db/migration/V16__application_module_refactor.sql`
*   `src/main/java/com/sdms/backend/modules/application/entity/ApplicationPriority.java`
*   `src/main/java/com/sdms/backend/modules/application/entity/ApplicationGeneratedDocument.java`
*   `src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplicationStatusHistory.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/GeneratedDocumentType.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/VerificationDocumentType.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/VerificationStatus.java`
*   `src/main/java/com/sdms/backend/modules/registration/enums/RegistrationTarget.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/ApplicationPriorityRepository.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/ApplicationGeneratedDocumentRepository.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/DormitoryApplicationStatusHistoryRepository.java`

---

## 8. FILES TO DELETE

*   `src/main/java/com/sdms/backend/modules/application/enums/DocumentType.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/DocumentStatus.java`

---

## 9. Final Decision

**APPLICATION-07 FAIL**
