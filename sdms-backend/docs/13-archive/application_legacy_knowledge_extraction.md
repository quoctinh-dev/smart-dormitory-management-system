# SDMS Legacy Application Knowledge Extraction Audit (v1.0)

This document extracts and analyzes the business logic, entity inventory, and gaps from the legacy `application_stu` reference module to prepare for the development of the new SDMS Application Module.

---

## 1. Executive Summary

The legacy `application_stu` module acts as a **reference-only** code base. It contains the business workflows for student registration, priority score calculation, document verification, and integration with room and payment modules. 
This audit maps the legacy entities and behaviors to the new SDMS modular monolith architecture, ensuring compliance with frozen modules (Auth, Student, Payment, Room).

---

## 2. Legacy Entity Inventory

Inside `application_stu/entity`:
1. **`DormitoryApplication`:** The central aggregate root representing a resident application.
   * *Key attributes:* `applicationCode` (Unique business key), `cccd`, `fullName`, `gender`, `email`, `phone`, `studentCode` (nullable), `priorityScore`, `paymentDeadline`, `revisionDeadline`, `status` (`ApplicationStatus`), `applicationPdfUrl`.
2. **`RegistrationPeriod`:** Represents registration semesters/periods.
   * *Key attributes:* `name`, `target` (`RegistrationTarget`), `startDate`, `endDate`, `quota`, `active`.
3. **`RegistrationEligibility`:** Restricts registration by mapping CCCD to a registration period.
4. **`ApplicationPriority`:** Maps selected priority categories (e.g. `POOR_HOUSEHOLD`) to the application. Uses `Long ID` (must be updated to UUID).
5. **`PriorityDocument`:** Holds verification proof documents for priority categories. Uses `Long ID`.
6. **`VerificationDocument`:** Holds standard identity/portrait verification files.

---

## 3. Approved SDMS Business Flow (PAYMENT-10 Sync)

The application process flows through these logical states:
1. **Application Submitted:** Student submits application. Status = `PENDING`.
2. **Under Review:** Admin processes the application. Status = `UNDER_REVIEW`.
3. **Approved:** Admin validates documents and approves the application. Status = `APPROVED`.
4. **Assignment RESERVED:** The system allocates a bed, creating a `StudentHousingAssignment` in `RESERVED` state.
5. **WAITING_PAYMENT:** Application status transitions to `WAITING_PAYMENT` (initiating the 3-day payment deadline window).
6. **Payment Success:** Student pays successfully. Bill changes to `PAID`. (Application status remains `WAITING_PAYMENT`).
7. **Student(PENDING_CHECKIN):** `PaymentEventListener` consumes `PaymentSuccessEvent` and creates the `Student` profile with status = `PENDING_CHECKIN`.
8. **UserAccount(PENDING_ACTIVATION):** `PaymentEventListener` creates the `UserAccount` with status = `PENDING_ACTIVATION`.

---

## 4. Applicant Categories Analysis

SDMS categorizes applicants into three groups:
* **Group A (Freshmen):** First-year students who have never resided in KTX and do not have an existing Student profile or UserAccount. They register via the **Public Website**.
* **Group B (Current Students - New):** Sophomores, juniors, or seniors who have never resided in KTX and do not have an existing Student profile or UserAccount. They register via the **Public Website**.
* **Group C (Returning Students):** Students who previously resided in KTX, already possess a Student profile and UserAccount, and have a historical stay record. They apply for renewal via the **Student App**.

---

## 5. Priority & Waiting List Analysis

* **Priority Calculation:** When an admin verifies a priority document as `VALID`, the service invokes `recalculatePriorityScore()`. The application's `priorityScore` is updated to the maximum score of the verified priority category.
* **Review Queue Sort Order:** Applications are sorted by priority score descending and submission time ascending:
  `findByStatusOrderByPriorityScoreDescSubmittedAtAsc(ApplicationStatus.PENDING)`.
* **Waiting List:** If bed allocation fails due to lack of beds, status becomes `WAITING_LIST`. It remains eligible for the auto-promotion scheduler job when beds are released.

---

## 6. Compatibility Matrix

| Legacy Concept | Compatibility Status | Required Remediation |
| :--- | :--- | :--- |
| **Package Structure** | **Incompatible** | Migrating imports from `com.stu.dormitory` to `com.sdms.backend`. |
| **Primary Keys (IDs)** | **Incompatible** | Change all `Long` auto-incrementing IDs to `UUID` Primary Keys. |
| **Database Engines** | **Compatible** | Code uses JPA and Hibernate annotations, which map natively to PostgreSQL. |
| **Payment Integration** | **Compatible** | Ensure Payment Success does **not** modify Application status directly, avoiding cross-module pollution. |
| **Security Context** | **Incompatible** | Replace old role references with the new `Role.STAFF` and `Role.ADMIN` enums. |

---

## 7. What To Keep

* **The Business Rules:** The 3-day deadlines, sorting rules, and status transition paths.
* **Priority scoring mapping:** Categories and scores (e.g. con liệt sĩ = 100, hộ nghèo = 80).
* **Document types:** CCCD, portrait, commitment, and priority certificates.
* **Optimistic Locking:** Keeps `@Version` on `DormitoryApplication` to prevent race conditions during parallel admin reviews.

---

## 8. What To Remove

* All occurrences of `Long` primary keys on child entities.
* Legacy package paths.
* Direct tight dependencies on deleted or heavily modified helper classes from the old repository.

---

## 9. Gap Analysis

1. **UUID Standardization:** The legacy tables used `IDENTITY` sequence keys for priorities and documents. We must use UUIDs for all keys in the new SDMS.
2. **Modular Mono Integration:** Payment success does **not** update application status to `APPROVED` or trigger database mutations on it.
3. **Database Schema Versioning:** Flyway scripts must start from `V16__...` as `V15` was already registered in the database migrations.

---

## 10. PASS / WARNING / FAIL

* **Status:** **PASS**. The legacy package provides a complete and consistent business reference. The required modifications are purely technical (UUIDs, package renames, integration hooks matching SDMS) rather than structural business changes.

---

## 11. Final Architecture Decision

**APPLICATION-00 PASS. READY FOR APPLICATION-01 ARCHITECTURE AUDIT.**
