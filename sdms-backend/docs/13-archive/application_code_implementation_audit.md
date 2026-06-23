# SDMS Application Code Implementation Audit (v1.0)

This document performs the final code audit for the Application Module of the Smart Dormitory Management System (SDMS), comparing the active Java codebase (entities, repositories, enums) and Flyway scripts against the approved `APPLICATION-06` Database Freeze specification.

---

## 1. Entity Audit

The Java classes in `com.sdms.backend.modules.application.entity` and `com.sdms.backend.modules.registration.entity` have been audited:

| Entity Class | Status | Mismatches / Missing Fields | Action Required |
| :--- | :---: | :--- | :--- |
| **`DormitoryApplication`** | ⚠️ **MISMATCH** | 1. **Missing 11 physical form fields:** `pob`, `ethnic`, `religion`, `faculty`, `contactAddress`, `fatherYob`, `fatherJob`, `motherYob`, `motherJob`, `familyContact`. <br>2. **Missing 2 review fields:** `reviewedByUserId` (soft reference), `reviewNote`. <br>3. **Missing 4 commitment audit fields:** `commitmentAccepted`, `commitmentAcceptedAt`, `commitmentVersion`, `clientIpAddress`. <br>4. **Redundant field:** `priorityCategory` (flat category) is still present. | Modify class to add missing fields and replace flat priority category with relationship. |
| **`VerificationDocument`** | ⚠️ **MISMATCH** | 1. **Missing 2 fields:** `note` (TEXT) and `verifiedAt` (TIMESTAMP).<br>2. **Enum mismatch:** Uses `DocumentStatus` and `DocumentType` instead of `VerificationStatus` and `VerificationDocumentType`. | Modify class to use revamped enums and add review fields. |
| **`ApplicationPriority`** | ❌ **MISSING** | Entity does not exist in the codebase. | Create entity. |
| **`ApplicationGeneratedDocument`** | ❌ **MISSING** | Entity does not exist in the codebase. | Create entity. |
| **`DormitoryApplicationStatusHistory`** | ❌ **MISSING** | Entity does not exist in the codebase. | Create entity. |
| **`RegistrationEligibility`** | ⚠️ **MISMATCH** | **Missing 3 fields:** `email` (VARCHAR), `studentCode` (VARCHAR), `target` (`RegistrationTarget`). | Modify class to add eligibility list import fields. |

---

## 2. Enum Audit

The enums in `com.sdms.backend.modules.application.enums` and `com.sdms.backend.modules.registration.enums` are out of sync:

*   **`ApplicationStatus` (⚠️ MISMATCH):** Still contains `REVISION_REQUIRED`. This violates the frozen lifecycle design (Change 01 in `APPLICATION-01 FINAL CORRECTION PATCH`), which simplified the review process to eliminate supplementation cycles.
*   **`PriorityCategory` (⚠️ MISMATCH):** Implements 8 categories + `NONE` instead of the 7 priority groups matching the Saigon Technology University (STU) form.
*   **`DocumentType` & `DocumentStatus` (⚠️ MISMATCH):** Need to be renamed or mapped to `VerificationDocumentType` and `VerificationStatus` for consistency.
*   **`GeneratedDocumentType` (❌ MISSING):** Enum does not exist in the codebase.
*   **`VerificationDocumentType` (❌ MISSING):** Enum does not exist in the codebase.
*   **`RegistrationTarget` (❌ MISSING):** Enum does not exist in the registration module's packages.

---

## 3. Repository Audit

*   **`DormitoryApplicationRepository` (⚠️ MISMATCH):** Query methods are implemented but rely on outdated fields and enums (e.g. `ApplicationStatus`).
*   **Missing Repositories (❌ MISSING):** 
    *   `ApplicationPriorityRepository`
    *   `ApplicationGeneratedDocumentRepository`
    *   `DormitoryApplicationStatusHistoryRepository`
    are missing from `com.sdms.backend.modules.application.repository`.

---

## 4. Flyway Migration Audit

*   **Audit:** The Flyway script `V16__application_module_refactor.sql` is **missing** from `src/main/resources/db/migration/`.
*   **Status:** The database schema has not been updated to support the revised entities, constraints, composite unique indexes, or priority tables.

---

## 5. Integration Boundary Audit

*   **Check:** Does the Application code directly update `Bill`, `Payment`, `Bed`, or `Room` records in JPA or SQL?
*   **Result:** **PASS**. There are no service or controller implementations written yet in the new `application` module, hence no architectural boundary violations exist.

---

## 6. Group A/B/C Compatibility

*   **Check:** Does the schema design support Group A, B, and C applicants properly?
*   **Result:** **PASS** (Design-wise). The schema structure is designed to handle nullable `studentCode` for Group A freshmen, prefilled details for Group B, and authenticated profiles for Group C. However, it cannot be run until the physical database changes are implemented.

---

## 7. PASS / WARNING / FAIL

*   **Status:** **FAIL**. The code implementation is out of sync with the frozen database and domain model specifications. Multiple entity classes, enum values, repositories, and the Flyway migration script are missing.

---

## 8. FILES TO MODIFY

*   `src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplication.java`
*   `src/main/java/com/sdms/backend/modules/application/entity/VerificationDocument.java`
*   `src/main/java/com/sdms/backend/modules/registration/entity/RegistrationEligibility.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/ApplicationStatus.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/PriorityCategory.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/DormitoryApplicationRepository.java`

---

## 9. FILES TO CREATE

*   `src/main/resources/db/migration/V16__application_module_refactor.sql`
*   `src/main/java/com/sdms/backend/modules/application/entity/ApplicationPriority.java`
*   `src/main/java/com/sdms/backend/modules/application/entity/ApplicationGeneratedDocument.java`
*   `src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplicationStatusHistory.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/GeneratedDocumentType.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/VerificationDocumentType.java`
*   `src/main/java/com/sdms/backend/modules/application/enums/VerificationStatus.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/ApplicationPriorityRepository.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/ApplicationGeneratedDocumentRepository.java`
*   `src/main/java/com/sdms/backend/modules/application/repository/DormitoryApplicationStatusHistoryRepository.java`

---

## 10. FILES TO DELETE

*   `src/main/java/com/sdms/backend/modules/application/enums/DocumentType.java` (superseded by `VerificationDocumentType`)
*   `src/main/java/com/sdms/backend/modules/application/enums/DocumentStatus.java` (superseded by `VerificationStatus`)

---

## 11. Final Decision

**APPLICATION-07 FAIL**
