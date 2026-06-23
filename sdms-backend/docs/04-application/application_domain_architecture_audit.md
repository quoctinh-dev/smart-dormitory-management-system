# SDMS Application & Registration Domain Architecture Audit (v1.0)

This document standardizes the domain architecture, state transitions, and integration boundaries for the Application and Registration modules in the Smart Dormitory Management System (SDMS).

---

## 1. Executive Summary

This architecture design freezes the core business rules for dormitory applications and registration periods. It guarantees absolute compatibility with the frozen Auth, Student, Payment, and Room modules, establishing a decoupled, event-driven monolith boundary.

---

## 2. Registration Period Design

The `RegistrationPeriod` domain controls KTX admission windows:
* **Lifecycle States:** `DRAFT` (creation), `ACTIVE` (open for submission), `CLOSED` (submission window closed).
* **Admission Window Check:** Application submission is allowed only when `active = true` and `startDate <= current_time <= endDate`.
* **Quota Control:** Prevents excessive submissions when the total applications exceed the period `quota`.

---

## 3. Registration Eligibility Design

Eligibility checking varies by applicant category to protect database size and maintain security:
* **Group A (Freshmen):** Verified against the pre-uploaded `registration_eligibilities` (Freshman Eligibility List) via CCCD check. Entry: Public Web.
* **Group B (Current Students - New):** Verified against pre-uploaded eligible student records in `registration_eligibilities`. Entry: Public Web.
* **Group C (Returning Students):** Bypasses the eligibility list. Authenticates directly via Student Mobile App. The existence of an active `UserAccount` with `Role.STUDENT` and a checked-out `Student` profile (status `INACTIVE` or `GRADUATED`) constitutes natural eligibility.

---

## 4. Application Lifecycle (PAYMENT-10 Sync)

The state machine for `DormitoryApplication` transitions strictly using these states:
* **`PENDING`:** Initial state after submission.
* **`UNDER_REVIEW`:** Selected by Admin for document verification.
* **`APPROVED`:** Transition state when Admin approves the application. Immediately triggers bed assignment and billing.
* **`WAITING_PAYMENT`:** Set immediately after bed assignment and bills are generated, starting the 3-day payment window.
* **`REJECTED`:** Set if the application is rejected during review. No supplement request is supported; the student must submit a new application.
* **`EXPIRED`:** Transitions if the 3-day payment window expires without payment. Bed is released.
* **`WAITING_LIST`:** Set if the application is approved but no beds are available in KTX.

---

## 5. Priority & Waiting List Design

* **PriorityCategory Enum:** Contains predefined priority rules and weights (Martyr Child = 100, Wounded Soldier Child = 95, Orphan = 85, Poor Household = 80, Ethnic Minority = 70, Remote Area = 60, Party Member = 50).
* **PriorityScore:** Tracks the maximum score of verified priority documents. Used to sort the review queue: `priorityScore DESC` then `submittedAt ASC`.
* **Waiting List Promotion:** The `WaitingListPromotionJob` scans `WAITING_LIST` applications, allocates released beds, generates bills, and transitions applications to `WAITING_PAYMENT`.

---

## 6. Assignment Strategy (Trigger Point)

* **Trigger Point:** `StudentHousingAssignment` must be created in `RESERVED` status during the **`APPROVED`** transition stage. 
* **Justification:** Students must be allocated a physical bed and have it reserved *before* they pay to prevent overbooking and double-allocating (preserving transaction integrity). If room allocation fails $\rightarrow$ status changes to `WAITING_LIST` (no assignment is created yet).

---

## 7. Payment Integration Strategy

* **Bill Creation:** Triggered immediately when `housingAssignmentService.reserveBed()` succeeds. 
* **State Transition:** Once bills are created, the application transitions to `WAITING_PAYMENT`.
* **Decoupled Success Flow:** When payment is verified $\rightarrow$ Payment module updates `Bill` to `PAID` $\rightarrow$ Publishes `PaymentSuccessEvent`. The listener in the Application/Student boundary consumes the event to create/update the student profile and account. The application status remains `WAITING_PAYMENT` in the DB to avoid tight dependency coupling.

---

## 8. Renewal Strategy

* **New Application Creation:** Yes! Group C (returning students) **must** submit a new `DormitoryApplication` record for each new semester/year (marked as `RegistrationType.RENEWAL`). This is required to verify updated credentials, calculate priority scores for the current period, and track room assignations.
* **Profile Reuse:** While the application is new, the existing `Student` profile and `UserAccount` are reused (Rule 6). Duplicate creation is strictly forbidden.

---

## 9. Boundary Analysis

* **Application Module:** Manages periods, eligibility, applications, and documents verification.
* **Room Module:** Controls beds, room occupancy, assignments, check-ins, and waiting list promotions.
* **Payment Module:** Manages bills, payments, and gateway webhooks.
* **Student & Auth Modules:** Manage identity profiles, credentials, and activation states.

---

## 10. PASS / WARNING / FAIL

* **Status:** **PASS**. All check points comply with the frozen module specifications of SDMS, ensuring solid boundary decoupling and high concurrency safety.

---

## 11. Final Decision

**APPLICATION-01 PASS. APPLICATION BUSINESS FROZEN.**
