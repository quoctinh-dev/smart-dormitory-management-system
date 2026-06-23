# SDMS Application Form, Commitment Form & PDF Generation Business Design (v1.0)

This document standardizes the business rules, data models, field sources, PDF generation flows, and database structures required to translate the physical dormitory registration and commitment paper forms into the digital Smart Dormitory Management System (SDMS).

---

## 1. Form Field Extraction (Document 01: Phiếu đăng ký lưu trú)

All data fields present on the physical paper form are cataloged below:

*   **A. Personal Information (Thông tin cá nhân):**
    *   `fullName` (Họ và tên): Full name of the applicant.
    *   `gender` (Giới tính): MALE, FEMALE, OTHER.
    *   `dob` (Ngày sinh): Date of birth (DD/MM/YYYY).
    *   `pob` (Nơi sinh): Province/City of birth.
    *   `ethnic` (Dân tộc): e.g., Kinh, Tày, Nùng.
    *   `religion` (Tôn giáo): e.g., Không, Phật giáo, Công giáo.
    *   `studentCode` (MSSV): Student ID.
    *   `faculty` (Khoa): Department/Faculty.
    *   `phone` (Điện thoại): Mobile contact number.
    *   `cccd` (CCCD/CMND): Citizen ID.
    *   `issueDate` (Ngày cấp): Date of issue.
    *   `issuePlace` (Nơi cấp): Issuing authority (e.g., Cục Cảnh sát QLHC về TTXH).
    *   `permanentAddress` (Hộ khẩu thường trú): Address registered in the residency book.
    *   `contactAddress` (Địa chỉ liên hệ): Current temporary address or contact address.
    *   `portraitPhoto` (Ảnh 3x4): JPG/PNG upload.

*   **B. Family Information (Thông tin gia đình):**
    *   `fatherName` (Họ tên cha) | `fatherYob` (Năm sinh cha) | `fatherJob` (Nghề nghiệp cha) | `fatherPhone` (Điện thoại cha).
    *   `motherName` (Họ tên mẹ) | `motherYob` (Năm sinh mẹ) | `motherJob` (Nghề nghiệp mẹ) | `motherPhone` (Điện thoại mẹ).

*   **C. Emergency Contact (Liên hệ khẩn cấp):**
    *   `emergencyContact` (Địa chỉ/Điện thoại liên hệ khẩn cấp): Emergency contact person and phone number.

---

## 2. Commitment Rule Extraction (Document 02: Bản cam kết)

The physical commitment form includes 11 clauses that applicants must sign and comply with:

| Clause | Category / Rule | Student Responsibility | Penalty / Sanction |
| :---: | :--- | :--- | :--- |
| **01** | **Chấp hành pháp luật & nội quy** | Complies with Vietnamese laws, school policies, and KTX regulations. | Demerit points, warning letters, or immediate termination. |
| **02** | **Đóng phí lưu trú & dịch vụ** | Pays KTX room fees and utilities (electricity, water) before deadlines. | Late payment penalty, suspension of access card, or eviction. |
| **03** | **Bảo vệ tài sản KTX** | Uses KTX facilities properly; prohibits vandalizing or remodeling rooms. | Compensation for damages, demerit points, or suspension. |
| **04** | **An toàn phòng chống cháy nổ** | Strictly prohibits cooking inside rooms, using unsafe heating coils, or storing fuels. | Immediate eviction, fine, or handover to local police. |
| **05** | **Vệ sinh môi trường** | Cleans room daily, disposes of trash in public collection bins. | Warning, deduction of training/demerit points. |
| **06** | **An ninh trật tự & Nghiêm cấm tệ nạn** | Strictly forbids gambling, drugs, alcohol, and hosting overnight guests without permission. Curfew: 23:00. | Permanent expulsion from KTX, notification to university. |
| **07** | **Không tàng trữ chất cấm** | Strictly bans weapons, firecrackers, toxic materials, and narcotics. | Immediate eviction, permanent blacklist, police investigation. |
| **08** | **Hoạt động cộng đồng** | Participates in KTX community events and mandatory fire drills. | Deduction of residency training points (prevents renewal). |
| **09** | **Tự quản lý tài sản cá nhân** | Responsible for protecting personal valuables (laptops, phones, money). | KTX Board is not liable; warning on negligence. |
| **10** | **Check-in/Check-out** | Performs checkout procedures, returns keys/cards, restores room state. | Fines, withholding academic certificates, or blacklisting. |
| **11** | **Chung sống văn minh** | Respects roommate differences, maintains standard hygiene/behavior. | Room relocation, demerit points, or expulsion. |

---

## 3. Field Mapping Matrix

For each field, the source and permission are mapped according to the applicant's group:

*   **[A] Student Input:** Applicant fills the form.
*   **[B] Autocomplete:** Pre-filled automatically by the system.
*   **[C] Eligibility Source:** Fetched from `RegistrationEligibility` table.
*   **[D] Profile Source:** Fetched from `Student` profile database.
*   **[E] Read-only / Editable:** Access permission.

| Field Name | Group A (Freshman) | Group B (Current New) | Group C (Returning) |
| :--- | :---: | :---: | :---: |
| `fullName` | **C** (Read-only) | **C** (Read-only) | **D** (Read-only) |
| `gender` | **A** (Editable) | **A** (Editable) | **D** (Read-only) |
| `dob` | **A** (Editable) | **A** (Editable) | **D** (Read-only) |
| `pob` | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| `ethnic` | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| `religion` | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| `cccd` | **C** (Read-only) | **C** (Read-only) | **D** (Read-only) |
| `issueDate` | **A** (Editable) | **A** (Editable) | **D** (Read-only) |
| `issuePlace` | **A** (Editable) | **A** (Editable) | **D** (Read-only) |
| `studentCode` | *N/A (Empty)* | **C** (Read-only) | **D** (Read-only) |
| `faculty` | **A** (Editable) | **C** (Read-only) | **D** (Read-only) |
| `phone` | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| `email` | **C** (Read-only) | **C** (Read-only) | **D** (Editable) |
| `permanentAddress` | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| `contactAddress` | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| Parent details | **A** (Editable) | **A** (Editable) | **D** (Editable) |
| `emergencyContact` | **A** (Editable) | **A** (Editable) | **D** (Editable) |

---

## 4. Group A/B/C Business Logic Differences

### A. Group A (Freshman)
*   **Student Code:** Absent or nullable. The applicant has not been matriculated into the school database yet.
*   **Verification:** Verified strictly via pre-uploaded CCCD.
*   **System Setup:** Once payment is made, the system triggers the automatic generation of a new `Student` profile and `UserAccount`.

### B. Group B (Current New Students)
*   **Student Code:** Mandatory. The student must have an existing record in the school.
*   **Verification:** Verified via CCCD matching. `studentCode` is linked to check academic standing (must not be under suspension).
*   **System Setup:** Upon payment, a `Student` profile is created inside KTX (linking to their pre-existing academic record), and a `UserAccount` is provisioned.

### C. Group C (Returning Students)
*   **Student Code:** Pre-existing and read-only.
*   **Verification:** Naturally eligible through app authentication.
*   **System Setup:** Re-registers a new application (Renewal) to update priority scores and request a bed, but reuses the existing `Student` profile and `UserAccount`.

---

## 5. Verification Document Matrix

Students must upload scans or photos of files during registration:

| Document Type | Group A | Group B | Group C | Mandatory / Optional |
| :--- | :---: | :---: | :---: | :--- |
| **`PORTRAIT_PHOTO`** | Yes | Yes | Yes | **Mandatory** (For gate access setup and ID card) |
| **`CCCD_FRONT`** | Yes | Yes | No | **Mandatory** for Group A & B |
| **`CCCD_BACK`** | Yes | Yes | No | **Mandatory** for Group A & B |
| **`COMMITMENT_FORM`** | Yes | Yes | Yes | **Mandatory** (Must print, sign, and upload) |
| **`PRIORITY_CERTIFICATE`** | Optional | Optional | Optional | **Mandatory only if claiming priority scores** |

---

## 6. Priority Category Matrix

Predefined categories extracted from physical rules, supporting documents, and database calculations:

| Category | Score | Required Document Type | Verification Rules |
| :--- | :---: | :--- | :--- |
| `MARTYR_CHILD` | **100** | `MARTYR_CERTIFICATE` | Must match applicant parent's name. |
| `WOUNDED_SOLDIER_CHILD` | **95** | `WOUNDED_SOLDIER_CERTIFICATE` | Must verify parent's card status. |
| `DISABLED_STUDENT` | **90** | `DISABILITY_CERTIFICATE` | Issued by local People's Committee. |
| `ORPHAN` | **85** | `ORPHAN_CERTIFICATE` / Death Certs | Confirming both parents are deceased. |
| `POOR_HOUSEHOLD` | **80** | `POVERTY_CERTIFICATE` | Poverty Book valid for the current year. |
| `ETHNIC_MINORITY` | **70** | `ETHNIC_CERTIFICATE` | Birth Certificate confirming ethnic origin. |
| `REMOTE_AREA` | **60** | `REMOTE_AREA_CERTIFICATE` | CT08 showing residency in special area. |
| `PARTY_MEMBER` | **50** | `PARTY_MEMBER_CERTIFICATE` | Party Membership Card or confirmation. |

---

## 7. PDF Generation Design

### A. PDF 01: Dormitory Registration Form (`REGISTRATION_FORM`)
*   **Generation Timing:** Triggered instantly upon submitting the application.
*   **Data Source:** The transient profile fields filled by the applicant.
*   **Naming Convention:** `APP-FORM-{applicationCode}.pdf`.
*   **Target Directory:** Private object storage: `/periods/{periodId}/applications/{applicationCode}/registration_form.pdf`.
*   **Template Structure:** A standard 1-page form containing personal, family, emergency details, and checked priority categories. Contains a barcode encoding the `applicationCode`.

### B. PDF 02: Commitment Form (`COMMITMENT_FORM`)
*   **Generation Timing:** Generated concurrently with the registration form.
*   **Data Source:** Merges the student's name, CCCD, and dob into the 11-clause commitment template.
*   **Naming Convention:** `APP-COMMIT-{applicationCode}.pdf`.
*   **Target Directory:** `/periods/{periodId}/applications/{applicationCode}/commitment_form.pdf`.
*   **Template Structure:** A 2-page document listing the 11 clauses (curfew, hygiene, payments, etc.) and a signature box at the bottom.

---

## 8. Generated Document Strategy

To support multiple documents without bloating the `DormitoryApplication` entity with flat URL fields, a dedicated entity `ApplicationGeneratedDocument` is introduced:

*   **Properties:**
    *   `documentId` (UUID PK)
    *   `applicationId` (UUID FK to `DormitoryApplication`)
    *   `documentType` (`GeneratedDocumentType` Enum: `REGISTRATION_FORM`, `COMMITMENT_FORM`)
    *   `fileUrl` (String): Storage path/URL.
    *   `templateVersion` (String): Track which legal version of the rules was used.
    *   `generatedAt` (LocalDateTime).

---

## 9. Database Impact Analysis & Migration Expansion

Comparing these business requirements to our database schema (from `APPLICATION-03`), we need to expand `dormitory_applications` to house the additional form fields and create the `application_generated_documents` table.

### Expanded V16 Schema Script: `V16__application_module_refactor.sql`

```sql
-- =========================================================================
-- SDMS APPLICATION MODULE DATABASE REFACTOR - V16 (UPDATED)
-- =========================================================================

-- 1. Cập nhật bảng registration_eligibilities (Hỗ trợ danh sách import)
ALTER TABLE registration_eligibilities
    ADD COLUMN email VARCHAR(100),
    ADD COLUMN student_code VARCHAR(50),
    ADD COLUMN target VARCHAR(50) DEFAULT 'FRESHMAN';

-- 2. Cập nhật bảng dormitory_applications (Thêm đầy đủ các trường biểu mẫu và đối chiếu)
ALTER TABLE dormitory_applications
    ADD COLUMN reviewed_by_user_id UUID,
    ADD COLUMN review_note TEXT,
    ADD COLUMN student_code VARCHAR(50),
    ADD COLUMN pob VARCHAR(100),
    ADD COLUMN ethnic VARCHAR(50),
    ADD COLUMN religion VARCHAR(50),
    ADD COLUMN faculty VARCHAR(100),
    ADD COLUMN contact_address TEXT,
    ADD COLUMN father_yob INTEGER,
    ADD COLUMN father_job VARCHAR(100),
    ADD COLUMN mother_yob INTEGER,
    ADD COLUMN mother_job VARCHAR(100);

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

-- 6. Tạo bảng application_generated_documents (Quản lý các tài liệu PDF sinh tự động)
CREATE TABLE application_generated_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    template_version VARCHAR(10) NOT NULL DEFAULT 'V1.0',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_gen_doc_application
        FOREIGN KEY (application_id)
            REFERENCES dormitory_applications(application_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_gen_doc_application_id ON application_generated_documents(application_id);

-- 7. Ràng buộc dữ liệu & Tối ưu Index
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

## 10. PASS / WARNING / FAIL

*   **Status:** **PASS**. The business forms have been exhaustively translated into application models, Group A/B/C differences are successfully mapped, and the database schema updates cleanly support auto-generated PDF storage and additional profile fields.

---

## 11. Final Decision

**APPLICATION-DOC-01 PASS**
