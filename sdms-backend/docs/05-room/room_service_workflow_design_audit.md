# ROOM-03: ROOM SERVICE & WORKFLOW DESIGN AUDIT REPORT (CORRECTED)

**Technical Role**: Lead Java Architect | DDD Domain Auditor | Workflow Integrity Specialist  
**Status**: **PASS**  
**Audit Context**: Room Module Service & Workflow Design (SDMS Project)

---

## 1. Executive Summary

This report performs the corrected comprehensive audit of the Room Module's Service Layer, Transaction Design, Event Integration, and Business Workflows under checkpoint **ROOM-03**, conforming strictly to the frozen SDMS business specifications.

---

## 2. Checkpoint Audit Results

### CHECK 01: Service Inventory
The Room module service inventory is partitioned to isolate responsibilities:
*   **`HousingAssignmentService`**: Enforces residency transaction rules, handles assignment-student linkage, physical check-ins, check-outs, and handles reservation timeout rollbacks.
*   **`RoomAllocationService`** (encapsulated in `HousingAssignmentService` allocation logic): Finds available rooms matching the candidate's gender policy, locks the room entity, selects an available bed, and persists the reservation.
*   **`CheckInService`** (encapsulated in `HousingAssignmentService` check-in logic): Updates assignment status to `OCCUPIED` and Bed to `OCCUPIED`, recalculates room capacity, and publishes `CheckInCompletedEvent`.
*   **`CheckOutService`** (encapsulated in `HousingAssignmentService` check-out logic): Updates assignment status to `CHECKED_OUT` and Bed to `AVAILABLE`, decrements room occupied beds, and publishes `BedReleasedEvent`.
*   **`ReservationExpirationService`** (encapsulated in `HousingAssignmentService` timeout logic): Audits pending payments, releases reserved beds to `AVAILABLE`, decrements room occupied beds, sets assignment to `EXPIRED`, and publishes `HousingReservationExpiredEvent`.

### CHECK 02: Bed Reservation Workflow
*   **Event flow**: `ApplicationApprovedEvent` (published by Application Module) $\rightarrow$ `RoomEventListener.handleApplicationApproved()` $\rightarrow$ `HousingAssignmentService.reserveBed()` $\rightarrow$ locks `Room` $\rightarrow$ marks `Bed` and `StudentHousingAssignment` as `RESERVED` $\rightarrow$ publishes `BedReservedEvent`.
*   **Modularity**: Room Module holds database ownership of `StudentHousingAssignment` and `Bed`.

### CHECK 03: Payment Success Workflow (CORRECTED)
*   **Event flow**: `PaymentSuccessEvent` (published by Payment Module) is handled synchronously by `PaymentEventListener`. Within the same transaction flow, the listener creates the `Student` profile (`PENDING_CHECKIN`), creates the `UserAccount` (`PENDING_ACTIVATION`), and calls `HousingAssignmentService.linkStudentToAssignment()` to link the student ID to the assignment (setting the assignment status to `PENDING_CHECKIN`).
*   **Application Status Rule**: Payment success **MUST NOT** modify the `DormitoryApplication` status (it remains `WAITING_PAYMENT`). Payment completion is tracked solely via `Bill.status = PAID`.
*   **Modularity**: Room Module does **NOT** write/create the `Student` record; it only links the generated `Student` ID to the existing assignment record.

### CHECK 04: Check-In Workflow
*   **Flow**: Physical check-in performed by staff $\rightarrow$ triggers `HousingAssignmentService.checkIn()` $\rightarrow$ transitions assignment to `OCCUPIED`, `Bed` to `OCCUPIED`, and publishes `CheckInCompletedEvent`.
*   **Modularity**: Student module listens to `CheckInCompletedEvent` and updates `Student.status` to `ACTIVE`. Room Module does not write to the student status.

### CHECK 05: Check-Out Workflow
*   **Flow**: Physical check-out performed $\rightarrow$ triggers `HousingAssignmentService.checkOut()` $\rightarrow$ releases bed status to `AVAILABLE`, decrements room's `occupiedBeds` count, transitions assignment to `CHECKED_OUT`, and publishes `BedReleasedEvent`.

### CHECK 06: Payment Timeout Workflow (CORRECTED)
*   **Flow**: Scanning scheduler executes `PaymentExpireJob` $\rightarrow$ calls `HousingAssignmentService.expirePaymentReservation()` $\rightarrow$ releases bed (`AVAILABLE`), decrements room's `occupiedBeds`, transitions assignment status from `RESERVED` to `EXPIRED` (cancellations remain reserved for manual actions), and publishes `HousingReservationExpiredEvent`.
*   **Modularity**: Room Module does **NOT** directly modify the application's status. The Application Module listens to `HousingReservationExpiredEvent` and transitions `DormitoryApplication.status` to `EXPIRED`.

### CHECK 07: Waiting List Reallocation
*   **Flow**: `BedReleasedEvent` is published by Room Module $\rightarrow$ Application Module handles `BedReleasedEvent` $\rightarrow$ identifies the next highest ranking candidate from `WAITING_LIST` (by priority score and submission date) $\rightarrow$ publishes `ApplicationApprovedEvent` for that candidate, restarting the allocation loop.
*   **Modularity**: Room Module does **NOT** evaluate waiting list rankings; it only publishes the event that space has been freed.

### CHECK 08: Transaction Design
*   **Declarative Transactions**: Standard operations use `@Transactional` within the service boundary.
*   **Propagation Isolation**: High-concurrency, job-driven methods (`expirePaymentReservation`, `promoteFromWaitingList`) execute in `Propagation.REQUIRES_NEW` transactions to isolate execution. If one transaction fails, it does not rollback the whole batch.
*   **Locking**: Uses Pessimistic Write Lock (`SELECT FOR UPDATE`) via `findByIdForUpdate` on `Room` and `DormitoryApplication` to guard critical checks and state transitions.

### CHECK 09: Concurrency Audit
*   **Double Reservation**: Blocked by room pessimistic lock during bed search and protected by PostgreSQL partial index `uk_active_assignment_application`.
*   **Lost Update**: Prevented by locking the `Room` aggregate root, forcing serialized updates on `Room.occupiedBeds`.
*   **Double Check-In / Check-Out**: Prevented by assignment validators (`AssignmentValidator`) verifying state preconditions before executing checks.

### CHECK 10: State Transition Audit (CORRECTED)
All state transition paths are verified as legal:
*   **`AssignmentStatus`**:
    - `RESERVED` $\rightarrow$ `PENDING_CHECKIN` (student linked on payment)
    - `PENDING_CHECKIN` $\rightarrow$ `OCCUPIED` (checked in)
    - `OCCUPIED` $\rightarrow$ `CHECKED_OUT` (checked out)
    - `RESERVED` $\rightarrow$ `EXPIRED` (on payment timeout)
    - `RESERVED` / `PENDING_CHECKIN` $\rightarrow$ `CANCELLED` (on manual cancellation)
*   **`BedStatus`**: `AVAILABLE` $\rightarrow$ `RESERVED` $\rightarrow$ `OCCUPIED` $\rightarrow$ `AVAILABLE`. `AVAILABLE` $\leftrightarrow$ `MAINTENANCE` / `BLOCKED`.
*   **`RoomStatus`**: `AVAILABLE` $\leftrightarrow$ `FULL`. `AVAILABLE` / `FULL` $\rightarrow$ `MAINTENANCE` / `CLOSED`.

### CHECK 11: Event Integration Audit (CORRECTED)
*   **ApplicationApprovedEvent**: Publisher: `ApplicationModule` | Consumer: `RoomModule`
*   **BedReservedEvent**: Publisher: `RoomModule` | Consumers: `ApplicationModule`, `PaymentModule`
*   **PaymentSuccessEvent**: Publisher: `PaymentModule` | Consumer: `PaymentEventListener` (synchronously handles database operations for Student, Auth, and Room)
*   **CheckInCompletedEvent**: Publisher: `RoomModule` | Consumer: `StudentModule`
*   **HousingReservationExpiredEvent**: Publisher: `RoomModule` | Consumer: `ApplicationModule`
*   **BedReleasedEvent**: Publisher: `RoomModule` | Consumer: `ApplicationModule`

### CHECK 12: Readiness Assessment
*   **Readiness**: **100% Ready**. Service design and workflow event structures are completely verified.

---

## 3. Workflow Proposal
All workflow flows (Reservation, Payment Link, Check-in, Check-out, and Expiration) are implemented via Spring Application events.

---

## 4. Transaction Proposal
Pessimistic write locking on `Room` (`roomRepository.findByIdForUpdate`) is enforced for bed allocation, bed release, and self-healing reconciliation to eliminate race conditions.

---

## 5. Event Proposal
Domain events publish changes across package boundaries to keep modules decoupled:
*   `CheckInCompletedEvent` carries `studentId` and `assignmentId`.
*   `HousingReservationExpiredEvent` carries `applicationId` and `assignmentId`.
*   `BedReleasedEvent` carries `roomId` and `bedId`.

---

## 6. Registry of Actions

### Files Created:
* [BedReleasedEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/BedReleasedEvent.java)

### Files Modified:
* [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java): Updated to publish `BedReleasedEvent` during bed release actions.

---

## 7. Final Decision

**ROOM-03 PASS**
