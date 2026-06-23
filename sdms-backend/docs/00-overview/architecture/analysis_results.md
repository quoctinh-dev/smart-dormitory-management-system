# SDMS Code Audit & Resolution Report

This report documents the resolution of modularity boundaries, status alignment, and the official ROOM-02, ROOM-03, ROOM-04, ROOM-05, and ROOM-05A audits.

## ROOM-05A Final Verdict: PASS
The source-code-based end-to-end audit of the Room Module and all integration points has been completed and documented in [room_code_based_e2e_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/room_code_based_e2e_audit.md).

---

## Key Resolutions & Implementations

### 1. WARNING 1: AssignmentStatus Lifecycle Sync (ROOM-02)
* **Refactor**: Expanded `AssignmentStatus` to include `PENDING_CHECKIN` and `EXPIRED` to perfectly match the business lifecycle while retaining `OCCUPIED` (active stay) for full codebase backward compatibility.
* **Flyway Script**: Created [V17__room_module_refactor.sql](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/resources/db/migration/V17__room_module_refactor.sql) to recreate active unique indexes including `PENDING_CHECKIN`.

### 2. WARNING 2: Student.ACTIVE Modularity (ROOM-02 & ROOM-03)
* **Modularity**: Created [CheckInCompletedEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/CheckInCompletedEvent.java).
* **Decoupled Update**: Room publishes this event, and the Student Module’s [StudentEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/student/event/StudentEventListener.java) handles updating `Student` to `ACTIVE` in a separate transaction context, preserving domain separation.

### 3. WARNING 3: Payment Timeout & Application Status Ownership (ROOM-02 & ROOM-03)
* **Modularity**: Created [HousingReservationExpiredEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/HousingReservationExpiredEvent.java).
* **Decoupled Update**: Room releases local assignment and bed records, and publishes the event. The Application Module’s [ApplicationEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/event/ApplicationEventListener.java) handles transitioning `DormitoryApplication` to `EXPIRED`.

### 4. Bed Released Integration & Concurrency locks (ROOM-03)
* **Bed Release**: Created [BedReleasedEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/BedReleasedEvent.java) and integrated it into the resource release block of `HousingAssignmentService` so that the Application Module can monitor vacating beds and schedule waiting list promotions.
* **Concurrency Locking**: Locked the Room entity (`findByIdForUpdate`) to protect denormalized occupancy counters (`occupiedBeds`) and prevent concurrency anomalies.

### 5. Critical Workflow Corrections
* **Payment Success Workflow**: Confirmed that payment completion does not directly change `DormitoryApplication` status (remains `WAITING_PAYMENT`). It is tracked via `Bill.status = PAID`.
* **Consumer Model**: Verified `PaymentEventListener` synchronously handles `PaymentSuccessEvent` (creating the Student, UserAccount, and linking the assignment in the same transaction flow).
* **Timeout Status**: Confirmed that reservation timeout transitions assignment status from `RESERVED` $\rightarrow$ `EXPIRED`.

### 6. Event Storming & Integration Audit (ROOM-04)
* **Event Inventory**: Audited all 6 domain events (`ApplicationApprovedEvent`, `BedReservedEvent`, `PaymentSuccessEvent`, `CheckInCompletedEvent`, `HousingReservationExpiredEvent`, `BedReleasedEvent`) for their publisher, consumers, payload, and transaction boundaries.
* **Decoupling Validation**: Verified that the Room Module has **zero** direct write violations to external tables like `DormitoryApplication`, `Student`, `UserAccount`, `Bill`, and `Payment`.

### 7. DormitoryApplication Lock Boundary Correction (ROOM-04 WARNING RESOLVED)
* **Audited Warning**: Resolved the boundary lock issue where the Room Module locked `DormitoryApplication` via `applicationRepository.findByIdForUpdate`.
* **Implementation Fix**: 
  - Added `findByStatusAndReservedAtBefore` to `StudentHousingAssignmentRepository` so that `PaymentExpireJob` in the Room Module queries expired reservations entirely using Room-owned aggregates.
  - Refactored `HousingAssignmentService.expireReservation` to operate on `assignmentId` and publish `HousingReservationExpiredEvent` containing the `applicationId`.
  - The Application Module's `ApplicationEventListener` listens to `HousingReservationExpiredEvent` and is the **only** consumer that executes the pessimistic lock (`findByIdForUpdate`) on `DormitoryApplication` to update its status to `EXPIRED`.

### 8. Full End-to-End Workflow Integration (ROOM-05 & ROOM-05A)
* **Code-Based E2E Audit**: Executed the E2E verification mapping active Java classes, methods, and configurations directly to E2E flow steps (ApplicationApprovedEvent, BedReservedEvent, PaymentSuccessEvent, CheckInCompletedEvent, HousingReservationExpiredEvent, BedReleasedEvent). Sourced exact code locations for all concurrency controls and verified modular boundaries at the source-code level.

---

## Compile Status
* **Status**: `BUILD SUCCESS` (Verified compiling successfully).
