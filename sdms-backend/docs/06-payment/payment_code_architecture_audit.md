# SDMS Payment Module Code-Based Architecture Audit

**Technical Role**: Technical Governance Officer | Lead Systems Architect  
**Status**: **FAIL** (Architectural violations detected)  
**Audit Date**: 2026-06-21  

---

## 1. Bounded Context & Boundary Validation

### 1.1 Intent vs. Implementation
The Payment module is designed to own bills, payment transactions, webhook processing, gateway integrations, and payment status updates. It should **not** own student demographics, user credentials, or bed assignment operations.

However, the source code reveals critical domain leaks:

| Violating Class | Line Numbers | Target Repositories / Services | Violation Description |
| :--- | :--- | :--- | :--- |
| `PaymentEventListener` | [L35-36](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L35-L36) | `StudentRepository`, `UserAccountRepository` | Imports repositories belonging to external Student and Auth modules. |
| `PaymentEventListener` | [L77-78](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L77-L78) | `StudentRepository.findByCccd` | Directly queries student records to determine registration status. |
| `PaymentEventListener` | [L81-82](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L81-L82) | `UserAccountRepository.findByEmail` | Directly queries credential account records. |
| `PaymentEventListener` | [L96-113](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L96-L113) | `createNewStudent()` | Instantiates and saves `Student` entity in Payment transaction context. |
| `PaymentEventListener` | [L115-126](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L115-L126) | `createNewUserAccount()` | Instantiates and saves `UserAccount` entity in Payment transaction context. |
| `PaymentEventListener` | [L85](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java#L85) | `housingAssignmentService.linkStudentToAssignment` | Triggers Room module data updates directly from the Payment event handler. |

### 1.2 Boundary Verdict: FAIL
The Payment Module directly queries, modifies, and instantiates objects belonging to the Student, Auth, and Room domains. This violates modular boundaries and creates direct coupling, defeating the purpose of event-driven decoupling.

---

## 2. Payment & Bill Lifecycle Design

### 2.1 Bill Lifecycle
Active statuses in [BillStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillStatus.java): `UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`.
* **State Transition Rules**:
  * Upon bed reservation, bill status is initialized to `UNPAID` (`dueDate` set to `LocalDate.now().plusDays(3)`).
  * Payments update `paidAmount`. If `paidAmount < amount`, status becomes `PARTIALLY_PAID`. If `paidAmount >= amount`, status becomes `PAID`.
  * If a reservation times out, the corresponding bill remains unchanged in the database (dangling unpaid status). **Leak**: The Payment module does not listen to `HousingReservationExpiredEvent` to transition bills to `CANCELLED` or `OVERDUE`.

### 2.2 Payment Lifecycle
Active statuses in [PaymentStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentStatus.java): `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`, `REFUNDED`.
* **State Transition Rules**:
  * Gạo dịch trực tuyến bắt đầu ở trạng thái `PENDING` (không được kích hoạt tự động trong code hiện tại, chỉ hỗ trợ xử lý trực tiếp sang `SUCCESS`).
  * `createPaymentRecord` enforces unique transaction codes using a unique database index and a validation check. Duplicate codes throw HTTP 400.

---

## 3. Integration Audits

### 3.1 Application Module Integration
* **Trigger**: Bed reservation success triggers bill generation.
* **Mechanism**: `PaymentEventListener` catches `BedReservedEvent` and calls `billService.createAccommodationBill()`.
* **Waiting Payment State**: The application status changes to `WAITING_PAYMENT` in `ApplicationEventListener.handleBedReserved()`.

### 3.2 Student Module Integration
* **Target**: Creating Student profiles upon payment.
* **Violation**: `PaymentSuccessEvent` is consumed inside the Payment module, which directly creates a `Student` record. This business logic should belong to a listener within the Student module.

### 3.3 Auth Module Integration
* **Target**: Provisioning credential user accounts upon payment.
* **Violation**: `PaymentSuccessEvent` is consumed inside the Payment module, which directly inserts a `UserAccount` record with temporary passwords. This should be handled by a listener inside the Auth module.

### 3.4 Room Module Integration
* **Target**: Reservation expiration and releasing bed allocations.
* **Violation**: The expiration job `PaymentExpireJob` operates entirely inside the Room module, triggering `HousingReservationExpiredEvent`. The Payment module fails to consume this event, leaving unpaid bills active indefinitely.

---

## 4. Payment Gateway Integration (SePay / VietQR)

* **Idempotency Protection**: Enforced by unique constraint on `transaction_code` in [Payment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Payment.java#L39) and a programmatic check in `PaymentService.createPaymentRecord`.
* **Webhook Implementation**: Missing. The system currently lacks:
  * Public webhook controller (`/api/payments/webhook/sepay`).
  * API Key / Secret Signature validations.
  * Duplicate callback retry protection logic.

---

## 5. Event Catalog

| Event Name | Publisher Module | Subscriber Module | Action Taken |
| :--- | :--- | :--- | :--- |
| `BedReservedEvent` | Room | Payment | Creates `Bill` in `UNPAID` status. |
| `PaymentSuccessEvent` | Payment | Payment (Violating) | Direct creation of `Student` and `UserAccount`. |
| `HousingReservationExpiredEvent` | Room | Application | Transitions application status to `EXPIRED`. |

---

## 6. Architecture Risks & Mitigation Plans

* **Double Processing**: Concurrent callbacks on the same bill could result in excess payments.
  * *Mitigation in code*: Evaluated in [PaymentService.java:L97](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java#L97) using pessimistic locking `billRepository.findByIdForUpdate()`.
* **Race Conditions on Student Creation**: Concurrent callbacks could result in duplicate student profiles.
  * *Mitigation in code*: PROGRAM FAILURE. There is no synchronization lock on Student creation based on CCCD.
* **Lost Gateway Webhooks**:
  * *Mitigation in code*: Missing. Requires a daily reconciliation job polling SePay transaction logs.

---

## 7. Recommendations for Refactoring

1. **Decouple Student Creation**: Move `createNewStudent()` logic out of the Payment module and place a `PaymentSuccessEventListener` inside the Student module.
2. **Decouple Account Provisioning**: Move `createNewUserAccount()` logic out of the Payment module and place a listener inside the Auth module.
3. **Link Student Flow**: Room module listener should handle linking students to bed assignments upon Student profile creation.
4. **Implement Webhook Endpoint**: Create a dedicated webhook controller with payload signature validation and signature check.
5. **Bill Cancellation**: Implement a listener in the Payment module for `HousingReservationExpiredEvent` to set the corresponding bills to `CANCELLED`.
