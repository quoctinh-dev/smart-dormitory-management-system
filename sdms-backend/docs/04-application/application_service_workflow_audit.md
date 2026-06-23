# APPLICATION-08: SERVICE LAYER & BUSINESS WORKFLOW AUDIT

## 1. Executive Summary
This document presents the business workflow and service layer audit for the **Application Module** of the Smart Dormitory Management System (SDMS). 

### Frozen Context
- Auth Module, Student Module, Payment Module, Room Module: **FROZEN**
- Application Database & Entities: **FROZEN**
- Reference legacy folder `application_stu` is excluded from compilation and preserved for reference only.

### Final Status
- **Overall Verdict**: **APPLICATION-08 FAIL**
- **Key Finding**: The active compiled classpath (`com.sdms.backend.modules.application`) contains only entity, enum, repository, and basic validation classes. **The core service layer (e.g., `ApplicationService`, `ApplicationReviewService`, `PdfService`) is completely missing in the compiled codebase.** Furthermore, required domain events and handlers have not been implemented, and legacy code in `application_stu` is incompatible with the frozen domain enums (e.g., it references the deleted `REVISION_REQUIRED` status).

---

## 2. Detailed Audit Checkpoints

### CHECK 01: Create Application Workflow
* **Status**: **FAIL**
* **Audit Notes**:
  - The compiled codebase has no service for creating dormitory applications.
  - The legacy `ApplicationService` under `application_stu` handles creation synchronously, including PDF generation and Cloudinary uploads, which is a major design flaw that blocks the HTTP response thread.
  - It does not support specialized workflows or inputs for **Group A** (Freshmen without MSSV), **Group B** (Non-resident senior students with MSSV), or **Group C** (Current residents submitting renewal applications).

### CHECK 02: RegistrationEligibility Validation
* **Status**: **WARNING**
* **Audit Notes**:
  - `RegistrationService.checkEligibility` in [RegistrationService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/registration/service/RegistrationService.java#L41-L80) is implemented and correctly checks whether a CCCD is eligible (returns `eligible=true` automatically for `OPEN_REGISTRATION` and queries the database for restricted periods).
  - However, `RegistrationEligibilityService.importEligibility` in [RegistrationEligibilityService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/registration/service/RegistrationEligibilityService.java#L36-L88) only extracts `cccd` and `fullName` from the uploaded Excel file. It does **not** populate the new nullable fields `email`, `student_code`, and `target` which are necessary to support target-specific checks.

### CHECK 03: Application Review Workflow
* **Status**: **FAIL**
* **Audit Notes**:
  - No active application review service exists in `modules/application`.
  - The reference `ApplicationReviewService` under `application_stu` is incompatible with the frozen enums because it references `ApplicationStatus.REVISION_REQUIRED`, which has been completely removed from the frozen [ApplicationStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/enums/ApplicationStatus.java).

### CHECK 04: Priority Processing Workflow
* **Status**: **WARNING**
* **Audit Notes**:
  - Entity structures ([ApplicationPriority](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/entity/ApplicationPriority.java)) and enums ([PriorityCategory](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/enums/PriorityCategory.java)) are correctly implemented.
  - The sorting logic for waiting list ranking (`ORDER BY priorityScore DESC, createdAt ASC`) is correctly defined in [DormitoryApplicationRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/repository/DormitoryApplicationRepository.java#L30-L40).
  - However, there is no service layer logic to dynamically recalculate priority scores when verification documents are validated.

### CHECK 05: Room Assignment Workflow
* **Status**: **PASS**
* **Audit Notes**:
  - Room/bed assignment and reservation are handled in the `Room` module by [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java#L64-L103) (`reserveBed`).
  - The `Application` module does not interact with or modify the physical `Bed` status directly, satisfying the decoupling rule.
  - *Gap*: The integration that triggers `reserveBed` after application approval has not been connected via Domain Events.

### CHECK 06: Payment Workflow
* **Status**: **PASS**
* **Audit Notes**:
  - Handled cleanly in the `Payment` module. Upon successful payment transaction, a `PaymentSuccessEvent` is published.
  - **Payment processing does not change the Application Status**, strictly complying with Check 06 rules.

### CHECK 07: Student Creation Workflow
* **Status**: **PASS**
* **Audit Notes**:
  - Verified in [PaymentEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L35-L62): the `Student` profile and `UserAccount` are created inside `handlePaymentSuccess`, ensuring that **no Student record is created before a successful payment is made**.

### CHECK 08: Account Activation Workflow
* **Status**: **PASS**
* **Audit Notes**:
  - The student account is created with status `PENDING_ACTIVATION` and the CCCD as the temporary password.
  - The login endpoint blocks logins for `PENDING_ACTIVATION` accounts (throwing `ACCOUNT_PENDING_ACTIVATION`).
  - Activation is handled securely in [AuthService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/auth/service/AuthService.java#L54-L84) by verifying the temporary password and setting the account to `ACTIVE` upon new password registration.

### CHECK 09: PDF Generation Workflow
* **Status**: **FAIL**
* **Audit Notes**:
  - No PDF engine exists in the compiled classpath. The legacy `PdfService` uses synchronous I/O and does not support versioning or type segregation (`REGISTRATION_FORM` vs `COMMITMENT_FORM`).

### CHECK 10: Domain Event Audit
* **Status**: **FAIL**
* **Audit Notes**:
  - Out of the five requested events, only [PaymentSuccessEvent](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentSuccessEvent.java) is defined.
  - Missing events: `ApplicationSubmittedEvent`, `ApplicationApprovedEvent`, `BedReservedEvent`, `BillCreatedEvent`.
  - *Arch Verification*: `PaymentSuccessEvent` is handled **synchronously** (via default `@EventListener` in the same thread), which is the correct architecture as frozen in APPLICATION-06.

### CHECK 11: Transaction Audit
* **Status**: **PASS**
* **Audit Notes**:
  - Class-level and method-level `@Transactional` declarations are correct.
  - Core methods like `expirePaymentReservation`, `promoteFromWaitingList`, and `reconcileRoomOccupancy` use `Propagation.REQUIRES_NEW` to isolate transaction scopes, avoid deadlocks, and quickly release locks.

### CHECK 12: Boundary Validation
* **Status**: **PASS**
* **Audit Notes**:
  - The `Application` module does not own or map direct relationships to `Student`, `UserAccount`, `Bill`, `Payment`, `Room`, or `Bed`. decoulping is respected.

---

## 3. Implementation Checklist

### FILES TO MODIFY
1. **[pom.xml](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/pom.xml)**: Clean up compiler exclusions once service code is implemented.
2. **[RegistrationEligibilityService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/registration/service/RegistrationEligibilityService.java)**: Update `importEligibility` to extract `student_code`, `email`, and `target` from Excel columns.

### FILES TO CREATE
1. **`ApplicationService.java`** in `modules/application/service`: Create active submission workflow supporting asynchronous PDF generation and target group checks.
2. **`ApplicationReviewService.java`** in `modules/application/service`: Review workflow without the deprecated `REVISION_REQUIRED` state.
3. **`PdfService.java`** in `modules/application/service`: PDF generation using asynchronous task processing.
4. **Events**:
   - `ApplicationSubmittedEvent.java`
   - `ApplicationApprovedEvent.java`
   - `BedReservedEvent.java`
   - `BillCreatedEvent.java`
5. **Event Listeners**:
   - `ApplicationEventListener.java` (Inside `modules/application` to handle application review events).
   - `RoomEventListener.java` (Inside `modules/room` to reserve beds).
   - `PaymentEventListener.java` updates to link events.

---

## 4. Final Decision
**APPLICATION-08 FAIL**
*Reason*: Missing entire Application Module service layer, PDF generation engine, and required Domain Events in the active compilation scope.
