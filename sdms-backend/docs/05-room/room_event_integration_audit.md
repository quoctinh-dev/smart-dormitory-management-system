# ROOM-04: ROOM EVENT INTEGRATION AUDIT REPORT (CORRECTED)

**Technical Role**: Lead Java Architect | DDD Event Storming Specialist | Integration Auditor  
**Status**: **PASS**  
**Audit Context**: Room Module Event Integration Architecture (SDMS Project)

---

## 1. Executive Summary

This report performs the comprehensive audit of the Event Integration Architecture of the Room Module under checkpoint **ROOM-04**. 

All 12 checkpoints have been evaluated. The system successfully utilizes decoupled domain events, enforces strict bounded context boundaries, isolates transactions via event propagation rules, and protects external modules from direct data writes and pessimistic locking violations.

---

## 2. Checkpoint Audit Results

### CHECK 01: Event Inventory
The complete inventory of domain events is detailed below:

| Event Name | Publisher Module | Consumer Module | Payload |
| :--- | :--- | :--- | :--- |
| **`ApplicationApprovedEvent`** | Application Module | Room Module | `applicationId` (UUID) |
| **`BedReservedEvent`** | Room Module | Application Module, Payment Module | `applicationId` (UUID), `assignmentId` (UUID) |
| **`PaymentSuccessEvent`** | Payment Module | PaymentEventListener (synchronous) | `billId` (UUID), `applicationId` (UUID), `assignmentId` (UUID) |
| **`CheckInCompletedEvent`** | Room Module | Student Module | `studentId` (UUID), `assignmentId` (UUID) |
| **`HousingReservationExpiredEvent`** | Room Module | Application Module | `applicationId` (UUID), `assignmentId` (UUID) |
| **`BedReleasedEvent`** | Room Module | Application Module | `roomId` (UUID), `bedId` (UUID) |

### CHECK 02: Application → Room (ApplicationApprovedEvent)
* **Verify**: Application Module publishes `ApplicationApprovedEvent`. Room Module (`RoomEventListener.handleApplicationApproved`) consumes it, locking the room aggregate pessimistically, reserving the bed, saving the `StudentHousingAssignment` in `RESERVED` status, and publishing `BedReservedEvent`.
* **Modularity**: verified. Room Module only modifies its own database tables (`student_housing_assignments`, `beds`, `rooms`).

### CHECK 03: Room → Application (HousingReservationExpiredEvent & BedReleasedEvent)
* **Verify**: Room Module publishes `HousingReservationExpiredEvent` (on payment timeout) and `BedReleasedEvent` (on checkout or cancellation). The Application Module consumes these events to transition applications to `EXPIRED` or run waiting list allocations.
* **Boundary Guard (DormitoryApplication Lock Decoupled)**: The Room Module does **not** pessimistically lock or query `DormitoryApplication` during the timeout job. The `PaymentExpireJob` operates entirely within the Room Module's domain by querying `StudentHousingAssignmentRepository.findByStatusAndReservedAtBefore()`. The Application Module’s `ApplicationEventListener` listens to `HousingReservationExpiredEvent` and is the only entity that performs a pessimistic lock (`findByIdForUpdate`) on `DormitoryApplication` to update its status.

### CHECK 04: Room → Payment (BedReservedEvent)
* **Verify**: Room Module publishes `BedReservedEvent` upon bed allocation. The Payment Module consumes this event and creates the corresponding room Bill.
* **Boundary Guard**: Room Module does **not** write to the Payment/Bill tables.

### CHECK 05: Payment → Room (PaymentSuccessEvent)
* **Verify**: Payment Module publishes `PaymentSuccessEvent`. The Room Module's `HousingAssignmentService` is called to link the generated `Student` ID to the assignment record.
* **Boundary Guard**: Room Module does **not** create the `Student` profile or the login `UserAccount`; it only performs the link operation.

### CHECK 06: Room → Student (CheckInCompletedEvent)
* **Verify**: Room Module publishes `CheckInCompletedEvent` upon physical check-in. The Student Module's `StudentEventListener` handles the event to update the student status to `ACTIVE`.
* **Boundary Guard**: Room Module does **not** write to student status.

### CHECK 07: Transaction Boundary Audit
* **Annotation Rules**:
  - Across-context event handlers use `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` to ensure that actions are only triggered after the publishing transaction has committed successfully.
  - Job execution or cross-module handlers use `Propagation.REQUIRES_NEW` to run in isolated transactions.
* **Rollback Isolation**: A failure in a downstream listener (e.g. updating student status or creating a bill) does **not** roll back the upstream room reservation or checkout transaction.

### CHECK 08: Synchronous vs. Asynchronous Audit
* **`PaymentSuccessEvent`**: Handled **synchronously** using `@EventListener` and `@Transactional`.
  * *Justification*: Creating the student profile, user account, and linking the assignment are logically grouped as a single transaction unit that must succeed or fail together.
* **`CheckInCompletedEvent`**: Handled **decoupled** (`@TransactionalEventListener` + `Propagation.REQUIRES_NEW`).
  * *Justification*: A failure in updating the student profile to `ACTIVE` should not roll back the physical check-in status on the bed or assignment.
* **`BedReleasedEvent`**: Handled **decoupled**.
  * *Justification*: Prevents checkout transaction rollback if the downstream waiting list promotion fails.
* **`HousingReservationExpiredEvent`**: Handled **decoupled**.
  * *Justification*: Isolates room bed release from application status expiration.

### CHECK 09: Event Failure Audit
* **Consumer Failure**: Isolated via `Propagation.REQUIRES_NEW`. Downstream failures do not corrupt upstream aggregates.
* **Duplicate Processing / Idempotency**: Guarded by state checks:
  - `PaymentEventListener` checks if student already exists.
  - `ApplicationEventListener` checks if status is `WAITING_PAYMENT` before expiring.
  - `StudentEventListener` checks student status before updating.

### CHECK 10: Boundary Violation Audit
* **Verification**: Room Module never directly performs write/JPA save or locking (`SELECT FOR UPDATE`) operations on:
  - `DormitoryApplication` (owned by Application)
  - `Student` (owned by Student)
  - `UserAccount` (owned by Auth)
  - `Bill` (owned by Payment)
  - `Payment` (owned by Payment)
* **Verdict**: **PASS**. Zero boundary violations found.

### CHECK 11: Event Chain Audit
The event integration chain is verified for logical consistency:
1. `ApplicationApprovedEvent` $\rightarrow$ triggers bed reservation and assignment creation.
2. `BedReservedEvent` $\rightarrow$ triggers Bill creation and sets application to `WAITING_PAYMENT`.
3. `PaymentSuccessEvent` $\rightarrow$ triggers Student profile/user creation and links student to assignment.
4. `CheckInCompletedEvent` $\rightarrow$ activates Student profile to `ACTIVE`.
5. `BedReleasedEvent` $\rightarrow$ triggers Waiting List promotions.

### CHECK 12: Readiness Assessment
* **Verdict**: **100% Ready** for ROOM-05 E2E Audit.

---

## 3. Event Matrix

| Event | Publisher | Consumers | Transaction Boundary |
| :--- | :--- | :--- | :--- |
| `ApplicationApprovedEvent` | Application Module | Room Module | `Propagation.REQUIRES_NEW` (After Commit) |
| `BedReservedEvent` | Room Module | Application, Payment | `Propagation.REQUIRES_NEW` (After Commit) |
| `PaymentSuccessEvent` | Payment Module | PaymentEventListener | Synchronous (`@EventListener`) |
| `CheckInCompletedEvent` | Room Module | Student Module | `Propagation.REQUIRES_NEW` (After Commit) |
| `HousingReservationExpiredEvent` | Room Module | Application Module | `Propagation.REQUIRES_NEW` (After Commit) |
| `BedReleasedEvent` | Room Module | Application Module | `Propagation.REQUIRES_NEW` (After Commit) |

---

## 4. Transaction Matrix

| Operation | Service Method | Locks | Transaction Boundary |
| :--- | :--- | :--- | :--- |
| Reserve Bed | `reserveBed` | pessimistic write on `Room` | `@Transactional` |
| Link Student | `linkStudentToAssignment` | - | `@Transactional` |
| Check-in | `checkIn` | - | `@Transactional` |
| Expire Timeout (Room Side) | `expireReservation` | pessimistic write on `Room` (inside `releaseResources`) | `Propagation.REQUIRES_NEW` |
| Expire Timeout (App Side) | `handleHousingReservationExpired` | pessimistic write on `DormitoryApplication` | `Propagation.REQUIRES_NEW` (After Commit) |
| Check-out | `checkOut` | pessimistic write on `Room` | `@Transactional` |

---

## 5. Registry of Actions

### Files Created:
* [BedReleasedEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/BedReleasedEvent.java)

### Files Modified:
* [StudentHousingAssignmentRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/repository/StudentHousingAssignmentRepository.java): Added `findByStatusAndReservedAtBefore` to query expired records within Room context.
* [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java): Refactored `expireReservation` to publish `HousingReservationExpiredEvent` and removed cross-module method `expirePaymentReservation`.
* [PaymentExpireJob.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/scheduler/PaymentExpireJob.java): Updated to call `expireReservation` using Room Module's assignment repository, eliminating `DormitoryApplicationRepository` lock.

---

## 6. Final Decision

**ROOM-04 PASS**
