# SDMS Application Database & Flyway Design Audit (v1.0)

This document performs a comprehensive audit of the database schema and Flyway migration state for the Application Module of the Smart Dormitory Management System (SDMS), identifying gaps against the frozen domain model (APPLICATION-02) and proposing the final database schema modifications.

---

## 1. Current Schema Audit

The Application Module is governed by four tables defined across migrations `V1__init_foundation_schema.sql`, `V5__registration_module.sql`, `V6__add_unique_constraint_to_active_registration.sql`, and `V10__update_dormitory_applications_waiting_list.sql`.

### A. `registration_periods` (Existing)
*   **Columns:**
    *   `period_id` (UUID PK): Default `uuid_generate_v4()`.
    *   `period_name` (VARCHAR(100)): Registration period name.
    *   `start_date` (TIMESTAMP): Start of the enrollment window.
    *   `end_date` (TIMESTAMP): End of the enrollment window.
    *   `is_active` (BOOLEAN): Status of the period (default TRUE).
    *   `registration_type` (VARCHAR(50)): Open vs. Restricted (added in `V5`).
    *   `created_at` / `updated_at` (TIMESTAMP).
*   **Constraints & Indexes:**
    *   `idx_unique_active_registration_period` (Unique index on `is_active = TRUE`, added in `V6`).

### B. `registration_eligibilities` (Existing)
*   **Columns:**
    *   `eligibility_id` (UUID PK): Default `uuid_generate_v4()`.
    *   `period_id` (UUID FK): References `registration_periods(period_id)`.
    *   `cccd` (VARCHAR(20)): Citizen ID.
    *   `full_name` (VARCHAR(100)): Student full name.
    *   `created_at` / `updated_at` (TIMESTAMP).
*   **Constraints & Indexes:**
    *   `fk_eligibility_period` (FK to `registration_periods(period_id)` ON DELETE CASCADE).
    *   `uk_eligibility_period_cccd` (Unique index on `(period_id, cccd)`).
    *   `idx_eligibility_cccd` (Index on `cccd`).

### C. `dormitory_applications` (Existing)
*   **Columns:**
    *   `application_id` (UUID PK): Default `uuid_generate_v4()`.
    *   `version` (BIGINT): Optimistic locking version.
    *   `period_id` (UUID FK): References `registration_periods(period_id)`.
    *   `full_name` (VARCHAR(100)), `dob` (DATE), `gender` (VARCHAR(10)), `cccd` (VARCHAR(20)).
    *   `issue_date` (DATE), `issue_place` (VARCHAR(100)).
    *   `email` (VARCHAR(100)), `phone` (VARCHAR(20)), `permanent_address` (TEXT).
    *   `father_name` (VARCHAR(100)), `father_phone` (VARCHAR(20)), `mother_name` (VARCHAR(100)), `mother_phone` (VARCHAR(20)), `emergency_contact` (VARCHAR(20)).
    *   `status` (VARCHAR(20)): PENDING, UNDER_REVIEW, APPROVED, etc.
    *   `priority_category` (VARCHAR(50)): Flat priority classification.
    *   `priority_score` (INTEGER): Total score (default 0).
    *   `application_code` (VARCHAR(50) UNIQUE).
    *   `application_pdf_url` (TEXT).
    *   `waiting_list_used` (BOOLEAN): Default FALSE (added in `V10`).
    *   `payment_deadline` (TIMESTAMP): Expiry date for bills (added in `V10`).
    *   `approved_at` (TIMESTAMP): Approval date (added in `V10`).
    *   `created_at` / `updated_at` (TIMESTAMP).
*   **Constraints & Indexes:**
    *   `idx_dorm_app_status_waiting` (Index on `(status, gender) WHERE status = 'WAITING_LIST'`, added in `V10`).
    *   `idx_dorm_app_payment_deadline` (Index on `payment_deadline WHERE status = 'WAITING_PAYMENT'`, added in `V10`).

### D. `verification_documents` (Existing)
*   **Columns:**
    *   `document_id` (UUID PK): Default `uuid_generate_v4()`.
    *   `application_id` (UUID FK): References `dormitory_applications(application_id)`.
    *   `document_type` (VARCHAR(50)), `file_url` (TEXT).
    *   `status` (VARCHAR(20)): Default `PENDING`.
    *   `created_at` / `updated_at` (TIMESTAMP).

---

## 2. Gap Analysis

When comparing the frozen Domain Model (v2.0) against the current database schema, the following gaps are identified:

| Entity / Target | Domain Model (Expected) | Database (Actual) | Gap Type | Description / Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **`RegistrationEligibility`** | `email`, `studentCode`, `target` | *None* | **Missing Columns** | Necessary to support school-wide list imports for verification. |
| **`DormitoryApplication`** | `reviewedByUserId` (UUID) | *None* | **Missing Column** | Soft reference to the administrator who reviewed the profile. |
| **`DormitoryApplication`** | `reviewNote` (TEXT) | *None* | **Missing Column** | Necessary to log reviewer feedback (e.g. rejection reason). |
| **`DormitoryApplication`** | `studentCode` (VARCHAR) | *None* | **Missing Column** | Stored transiently during registration for Group B & C verification. |
| **`DormitoryApplication`** | `(periodId, cccd)` unique check | *None* | **Missing Constraint** | Students must not submit multiple applications in the same period. |
| **`VerificationDocument`** | `note` (TEXT) | *None* | **Missing Column** | Required to specify document-level validation errors. |
| **`VerificationDocument`** | `verifiedAt` (TIMESTAMP) | *None* | **Missing Column** | Audit tracking of when a document was processed. |
| **`ApplicationPriority`** | Multiple priorities (1:N) | Flat `priority_category` | **Schema Gap** | Students may qualify for multiple categories. Needs a new table. |
| **`StatusHistory`** | Transition Audit Trail | *None* | **Schema Gap** | Needs a status history table to trace lifecycle transitions. |

---

## 3. Required Database Changes

To close the gaps, the following updates must be executed:

1.  **Modify `registration_eligibilities`**: Add columns `email` (VARCHAR), `student_code` (VARCHAR), and `target` (VARCHAR).
2.  **Modify `dormitory_applications`**: 
    *   Add `reviewed_by_user_id` (UUID) as a soft reference.
    *   Add `review_note` (TEXT) to hold rejection/approval comments.
    *   Add `student_code` (VARCHAR(50), nullable) to hold the applicant's existing student code.
    *   *Note on `priority_category`:* The flat column `priority_category` on `dormitory_applications` will be deprecated/marked legacy, superseded by the new `application_priorities` table.
3.  **Modify `verification_documents`**: Add `note` (TEXT) and `verified_at` (TIMESTAMP).
4.  **Create `application_priorities` table**: To support multiple priority categories per application.
5.  **Create `dormitory_application_status_history` table**: To record the status transition trail of applications.

---

## 4. Index Strategy

To secure data integrity and speed up scheduler batch jobs:

1.  **`idx_dorm_app_cccd`**: B-Tree index on `dormitory_applications(cccd)` for checking previous applications quickly.
2.  **`idx_dorm_app_student_code`**: B-Tree index on `dormitory_applications(student_code)` for administrative queries.
3.  **`idx_dorm_app_waiting_list_promotion`**: Compounded conditional index on `dormitory_applications(gender, priority_score DESC, created_at ASC) WHERE status = 'WAITING_LIST'` to optimize the `WaitingListPromotionJob`.
4.  **`idx_app_priority_application_id`**: B-Tree index on `application_priorities(application_id)` for quick joins.
5.  **`idx_status_history_application_id`**: B-Tree index on `dormitory_application_status_history(application_id)` to list application history.

---

## 5. Constraint Strategy

1.  **Unique Application per Period**: 
    *   *Constraint:* `CREATE UNIQUE INDEX uk_period_cccd ON dormitory_applications(period_id, cccd);`
    *   *Justification:* Prevents a student from submitting multiple applications for the same registration window.
2.  **Unique Priority Categories**:
    *   *Constraint:* `CONSTRAINT uk_app_priority_category UNIQUE (application_id, priority_category)` on `application_priorities`.
    *   *Justification:* Prevents assigning the same priority category multiple times on a single application.
3.  **Cascading Deletes**:
    *   Entities belonging to the `DormitoryApplication` aggregate (`ApplicationPriority`, `VerificationDocument`, `DormitoryApplicationStatusHistory`) must be deleted automatically if the parent application is removed (mainly for developer test cleaning).
    *   *Constraint:* `FOREIGN KEY REFERENCES dormitory_applications(...) ON DELETE CASCADE`.
4.  **Decoupled Soft Reference Guard**:
    *   `reviewed_by_user_id` inside `dormitory_applications` and `changed_by_user_id` inside `dormitory_application_status_history` remain UUID fields **without** database-level foreign keys pointing to `user_accounts`. This keeps the Auth Module decoupled.

---

## 6. V16 Migration Plan

The SQL script `V16__application_module_refactor.sql` is designed below:

```sql
-- =========================================================================
-- SDMS APPLICATION MODULE DATABASE REFACTOR - V16
-- =========================================================================

-- 1. Cập nhật bảng registration_eligibilities (Hỗ trợ danh sách import)
ALTER TABLE registration_eligibilities
    ADD COLUMN email VARCHAR(100),
    ADD COLUMN student_code VARCHAR(50),
    ADD COLUMN target VARCHAR(50) DEFAULT 'FRESHMAN';

-- 2. Cập nhật bảng dormitory_applications (Bổ sung cột nghiệp vụ và đối chiếu)
ALTER TABLE dormitory_applications
    ADD COLUMN reviewed_by_user_id UUID,
    ADD COLUMN review_note TEXT,
    ADD COLUMN student_code VARCHAR(50);

-- 3. Cập nhật bảng verification_documents (Bổ sung thông tin duyệt tài liệu)
ALTER TABLE verification_documents
    ADD COLUMN note TEXT,
    ADD COLUMN verified_at TIMESTAMP;

-- 4. Tạo bảng application_priorities (Hỗ trợ sinh viên có nhiều ưu tiên)
CREATE TABLE application_priorities (
    application_priority_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    priority_category VARCHAR(50) NOT NULL,
    priority_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_priority_application
        FOREIGN KEY (application_id)
            REFERENCES dormitory_applications(application_id)
            ON DELETE CASCADE,
            
    CONSTRAINT uk_app_priority_category
        UNIQUE (application_id, priority_category)
);

CREATE INDEX idx_app_priority_application_id ON application_priorities(application_id);

-- 5. Tạo bảng dormitory_application_status_history (Ghi nhận vết chuyển đổi trạng thái)
CREATE TABLE dormitory_application_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by_user_id UUID,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    
    CONSTRAINT fk_status_history_application
        FOREIGN KEY (application_id)
            REFERENCES dormitory_applications(application_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_status_history_application_id ON dormitory_application_status_history(application_id);

-- 6. Ràng buộc dữ liệu & Tối ưu Index
-- Đảm bảo mỗi CCCD chỉ được nộp tối đa 1 hồ sơ trong 1 đợt
CREATE UNIQUE INDEX uk_period_cccd ON dormitory_applications(period_id, cccd);

-- Tối ưu tìm kiếm nhanh theo CCCD và mã số sinh viên trên hồ sơ
CREATE INDEX idx_dorm_app_cccd ON dormitory_applications(cccd);
CREATE INDEX idx_dorm_app_student_code ON dormitory_applications(student_code);

-- Tối ưu hóa Job quét danh sách chờ theo điểm số và thời gian nộp
CREATE INDEX idx_dorm_app_waiting_list_promotion 
    ON dormitory_applications(gender, priority_score DESC, created_at ASC) 
    WHERE status = 'WAITING_LIST';
```

---

## 7. PASS / WARNING / FAIL

*   **Status:** **PASS**. The gap analysis is exhaustive, constraints and indexes are optimized for the waiting list job and data integrity, and the Flyway migration script `V16` has been carefully formulated.

---

## 8. Final Decision

**APPLICATION-03 PASS**
