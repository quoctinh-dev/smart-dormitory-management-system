# APPLICATION-11: END-TO-END WORKFLOW AUDIT REPORT (CORRECTED)

## 1. EXECUTIVE SUMMARY
This report presents the corrected end-to-end integration and workflow audit for the **Smart Dormitory Management System (SDMS)**.

The audit validates the integration flows, transaction boundary isolations, domain event dispatch chains, state transitions, and failure recoverability mechanisms across all five active core modules (`Application`, `Room`, `Payment`, `Student`, and `Auth`).

All evaluations below are aligned with the frozen SDMS business rules.

### Final Verdict
* **Overall Verdict**: **APPLICATION-11 PASS**
* **Integration Readiness**: The event-driven architecture is fully wired. Decoupled listeners handle cross-module integration (synchronously or asynchronously based on `@Async` declarations) while ensuring Bounded Context decoupling.

---

## 2. CHECKPOINT EVALUATIONS

### CHECK 01: Group A End-to-End Flow
* **Status**: **PASS**
* **Verification Details**:
  * **Eligibility**: Verified via [RegistrationEligibilityController](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/registration/controller/RegistrationEligibilityController.java). Freshman candidates are imported via Excel and validated.
  * **Create Application**: In [ApplicationService.createDraft](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/service/ApplicationService.java), creates a record in `PENDING` database state (acting as Draft).
  * **Upload Documents**: Student uploads CCCD Front/Back, Portrait, and Commitment files, which are validated during submit.
  * **Generate PDFs**: Form and commitment PDFs are generated asynchronously (`@Async`) to ensure UI responsiveness.
  * **Submit**: Formally submits the application, publishes `ApplicationSubmittedEvent`.
  * **Review & Approve**: The administrator reviews documents via [ApplicationReviewController](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/controller/ApplicationReviewController.java). Upon approval, transitions the application to `APPROVED` (Review stage) and publishes `ApplicationApprovedEvent`.
  * **Reserve Bed**: [RoomEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/RoomEventListener.java) handles `ApplicationApprovedEvent` post-commit and invokes `HousingAssignmentService.reserveBed` to search, lock, and reserve a physical bed.
  * **WAITING_PAYMENT**:
    * RoomEventListener publishes `BedReservedEvent`.
    * [ApplicationEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/event/ApplicationEventListener.java) catches `BedReservedEvent` and transitions the application to `WAITING_PAYMENT` status, setting a payment deadline.
    * [PaymentEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java) catches `BedReservedEvent` and triggers `BillService.createAccommodationBill` to create a bill.
  * **Payment Success**: Student completes payment. [PaymentService](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java) transitions the bill status to `PAID` and publishes `PaymentSuccessEvent`.
  * **Student & UserAccount Creation**: `PaymentEventListener.handlePaymentSuccess` receives this event **synchronously**:
    * **No status modification for DormitoryApplication**: The application status is NOT modified upon payment success; it remains in `WAITING_PAYMENT`. Payment completion is tracked exclusively through `Bill.status = PAID`.
    * Creates `Student` profile in `PENDING_CHECKIN` state.
    * Creates `UserAccount` profile in `PENDING_ACTIVATION` state.
    * Links the student to the housing assignment.
  * **Auth Account Activation**: Accounts in `PENDING_ACTIVATION` status cannot log in. The user must hit `POST /api/v1/auth/activate` to transition `UserAccount.status` to `ACTIVE` and be issued JWT authentication tokens.

---

### CHECK 02: Group B End-to-End Flow
* **Status**: **PASS**
* **Verification Details**:
  * Public registration flows bypass eligibility list constraints when the active registration period is configured as `OPEN_REGISTRATION`.
  * All remaining steps (Application, Review, Bed Reservation, Bill Generation, Payment, Student link, Auth account activation) execute identically to the Group A workflow.

---

### CHECK 03: Group C End-to-End Flow
* **Status**: **PASS**
* **Verification Details**:
  * Renewal flows match the student identity against the eligibility table populated specifically for the renewal period.
  * Once validated, the renewal application, document verification, bed assignment, bill calculation, and billing transitions proceed using the standard event integrations.

---

### CHECK 04: Application → Room Integration
* **Status**: **PASS**
* **Verification Details**:
  * Mapped exclusively through Spring Application Events.
  * [ApplicationReviewService](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/service/ApplicationReviewService.java) publishes `ApplicationApprovedEvent`.
  * [RoomEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/RoomEventListener.java) handles the event, triggering bed reservation and publishing `BedReservedEvent`.
  * Decoupling is preserved; the Application module does not reference `BedRepository` or `RoomRepository` directly.

---

### CHECK 05: Room → Payment Integration
* **Status**: **PASS**
* **Verification Details**:
  * Upon successful bed reservation, [RoomEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/RoomEventListener.java) publishes `BedReservedEvent`.
  * [PaymentEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java) catches `BedReservedEvent` and calls `BillService.createAccommodationBill` to automatically create a bill record.
  * Simultaneously, [ApplicationEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/event/ApplicationEventListener.java) transitions the application state to `WAITING_PAYMENT`.

---

### CHECK 06: Payment → Student Integration
* **Status**: **PASS**
* **Verification Details**:
  * [PaymentService](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java) publishes `PaymentSuccessEvent` when the bill status transitions to `PAID`.
  * [PaymentEventListener](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java) processes this event **synchronously** (there is no `@Async` annotation on `handlePaymentSuccess`).
  * It creates the `Student` record (`PENDING_CHECKIN`), produces a `UserAccount` record (`PENDING_ACTIVATION`), and links them to the active assignment.

---

### CHECK 07: Auth Integration
* **Status**: **PASS**
* **Verification Details**:
  * Accounts in `PENDING_ACTIVATION` state are blocked from authentication.
  * Triggering `POST /api/v1/auth/activate` transitions the account's state: `PENDING_ACTIVATION` -> `ACTIVE` and issues valid JWT access/refresh tokens.

---

### CHECK 08: State Machine Audit
* **Status**: **PASS**
* **Transitions**:
  * **ApplicationStatus**: `PENDING` -> `UNDER_REVIEW` -> `APPROVED` (Review phase) -> `WAITING_PAYMENT` (Placed bed, active state awaiting payment). Payment completion does not trigger further transitions; the application remains in `WAITING_PAYMENT`. In case of payment timeout, it transitions to `EXPIRED` via scheduled background job.
  * **StudentStatus**: `PENDING_CHECKIN` -> `ACTIVE` (after check-in) -> `CHECKED_OUT` (after checkout).
  * **AccountStatus**: `PENDING_ACTIVATION` -> `ACTIVE` (via activation endpoint) -> `LOCKED`.
* No illegal or unmapped state transitions exist in the audited E2E flow.

---

### CHECK 09: Event Chain Audit
* **Status**: **PASS**
* **Publishers and Consumers**:
  * `ApplicationSubmittedEvent`: Published by `ApplicationService`.
  * `ApplicationApprovedEvent`: Published by `ApplicationReviewService` -> Consumed by `RoomEventListener`.
  * `BedReservedEvent`: Published by `RoomEventListener` -> Consumed by `ApplicationEventListener` (updates to `WAITING_PAYMENT`) and `PaymentEventListener` (triggers Bill creation).
  * `BedReservationFailedEvent`: Published by `RoomEventListener` -> Consumed by `ApplicationEventListener` (updates to `WAITING_LIST`).
  * `PaymentSuccessEvent`: Published by `PaymentService` -> Consumed by `PaymentEventListener` (**Synchronous**).

---

### CHECK 10: Failure Scenario Audit
* **Status**: **PASS**
* **Verification Details**:
  * **Review Rejected**: Application status transitions to `REJECTED`, no bed assignment occurs, and no bills are generated.
  * **Bed Reservation Failed**: If rooms are full, `RoomEventListener` publishes `BedReservationFailedEvent`, and the application is moved to `WAITING_LIST`.
  * **Payment Failed**: If payment fails, transaction rollbacks ensure the bill remains `UNPAID` and no Student/UserAccount records are created.
  * **Activation Failed**: If user account activation fails, the account remains `PENDING_ACTIVATION`, blocking JWT validation.
  * **Payment Timeout (Timeout Rollback)**: A cron task triggers `HousingAssignmentService.expirePaymentReservation`, releasing physical beds (reverting bed status to `AVAILABLE` and decrementing room occupied count) and transitioning the application status to `EXPIRED`.

---

### CHECK 11: Boundary Audit
* **Status**: **PASS**
* **Verification Details**:
  * Bounded context separation between modules is strictly enforced.
  * Inter-module calls across `Application`, `Room`, and `Payment` occur solely through decoupled event publishers and listeners. No direct cross-context repository injections exist.

---

### CHECK 12: Readiness Assessment
* **Status**: **PASS**
* **Readiness Evaluation**:
  * **Frontend Integration**: Ready. Controllers expose well-typed, validated DTO responses wrapped in unified `ApiResponse<?>` schemas.
  * **Mobile App Integration**: Ready. Endpoints support standard OAuth2/JWT Bearer Token verification.
  * **IoT Integration**: Ready. State transition to `ACTIVE` (Check-In) publishes check-in details, which can interface with IoT door lock cards.
  * **Face Module Integration**: Ready. Unified student codes (`STU-*`) can map to Face AI biometric profile registrations.

---

## 3. RISK ANALYSIS
* **Decoupled Error Trapping**: Inter-module events (e.g. `ApplicationApprovedEvent` -> `BedReservedEvent`) are decoupled, preventing failures in secondary workflows (like room allocation) from crashing primary transaction writes (like administrator approvals).

---

## 4. MODULE READINESS MATRIX

| Module | API Readiness | Integration Readiness | Database Integrity | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | High | High | High | **READY** |
| **User** | High | High | High | **READY** |
| **Student** | High | High | High | **READY** |
| **Application** | High | High | High | **READY** |
| **Room** | High | High | High | **READY** |
| **Payment** | High | High | High | **READY** |

---

## 5. FINAL DECISION
**APPLICATION-11 PASS**
