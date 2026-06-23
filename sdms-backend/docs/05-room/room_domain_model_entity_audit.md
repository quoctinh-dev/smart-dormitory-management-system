# ROOM-02: ROOM DOMAIN MODEL & ENTITY DESIGN AUDIT REPORT

**Technical Role**: Lead Java Architect | Database Architect | DDD Specialist  
**Status**: **PASS**  
**Audit Context**: Room Module Architecture Refactor (SDMS Project)

---

## 1. Executive Summary

This report performs the comprehensive audit of the Room Module's Domain Model, Entity Design, Relationship Design, Database Design, and Flyway Schema under checkpoint **ROOM-02**. 

All 12 checkpoints have been audited, refined, and resolved to ensure correct modularity, event-driven decoupling, and status alignment.

---

## 2. Checkpoint Audit Results

### CHECK 01: Aggregate Root Design
* **Physical Infrastructure Aggregate**: **`Room`** is identified as the Aggregate Root for the physical layout. `Building` and `Floor` are structural lookup entities, while `Bed` resides inside the `Room` boundary. Since transactional safety (concurrency locks for allocation) occurs at the room level, `Room` serves as the transactional boundary lock.
* **Residency Transaction Aggregate**: **`StudentHousingAssignment`** is the Aggregate Root representing the lease transaction lifecycle. It references physical entities (`Bed`) and external entities (`Student`, `DormitoryApplication`).
* **Waiting List**: No database entity `WaitingList` is created. Instead, the waiting list is modeled as a query projection of `DormitoryApplication` records with status `WAITING_LIST` managed by the Application module.

### CHECK 02: Entity Design
The entity fields are audited and confirmed:
* **`Building`**: `buildingId` (UUID), `code` (VARCHAR, unique, non-null), `name` (VARCHAR, non-null), `description` (TEXT), `status` (BuildingStatus).
* **`Floor`**: `floorId` (UUID), `floorNumber` (INT, non-null), `occupancyPolicy` (OccupancyPolicy, non-null), `building` (Building, ManyToOne LAZY).
* **`Room`**: `roomId` (UUID), `roomCode` (VARCHAR, non-null), `capacity` (INT, non-null), `occupiedBeds` (INT, non-null, default 0), `status` (RoomStatus), `floor` (Floor, ManyToOne LAZY).
* **`Bed`**: `bedId` (UUID), `bedCode` (VARCHAR, non-null), `status` (BedStatus), `note` (VARCHAR), `room` (Room, ManyToOne LAZY).
* **`StudentHousingAssignment`**: `assignmentId` (UUID), `application` (DormitoryApplication, ManyToOne LAZY), `student` (Student, nullable, ManyToOne LAZY), `bed` (Bed, ManyToOne LAZY), `status` (AssignmentStatus), `reservedAt` (TIMESTAMP), `checkInAt` (TIMESTAMP), `checkOutAt` (TIMESTAMP), `expectedCheckOutAt` (TIMESTAMP).

### CHECK 03: Relationship Design & Student Mapping (WARNING 1 AUDIT)
* **Hierarchy**: `Building` $\rightarrow$ `Floor` (1:N, Lazy mapped on child), `Floor` $\rightarrow$ `Room` (1:N, Lazy mapped on child), `Room` $\rightarrow$ `Bed` (1:N, Lazy mapped on child).
* **Associations**:
  - `StudentHousingAssignment` $\rightarrow$ `DormitoryApplication` (ManyToOne, FetchType.LAZY, nullable = false, ownership side).
  - `StudentHousingAssignment` $\rightarrow$ `Student` (ManyToOne, FetchType.LAZY, nullable = true to support payment pending phase, ownership side).
  - `StudentHousingAssignment` $\rightarrow$ `Bed` (ManyToOne, FetchType.LAZY, nullable = false, ownership side).
* **Cascade Policy**: No cascades (`CascadeType.REMOVE` or `CascadeType.PERSIST`) are configured across boundary associations to prevent accidental deletions of external profiles. Lifecycle deletion constraints are validated programmatically.
* **Warning 1 Audit (Student Active Assignment Guard)**:
  - Conceptually, at any given time, **1 Student can have only 1 Active Assignment**.
  - Although the relation from `StudentHousingAssignment` $\rightarrow$ `Student` is `@ManyToOne` (since a student can have multiple historical assignments over their academic years), we enforce the single-active assignment rule using a PostgreSQL partial unique index:
    ```sql
    CREATE UNIQUE INDEX uk_active_assignment_student 
    ON student_housing_assignments(student_id) 
    WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED') AND student_id IS NOT NULL;
    ```
  - This prevents multiple active assignments per student while allowing historical/inactive ones (`CHECKED_OUT`, `CANCELLED`, `EXPIRED`) to exist under the same `student_id`.

### CHECK 04: Assignment Status Design
* **Final Proposal**: The database enum is expanded to: `RESERVED`, `PENDING_CHECKIN`, `OCCUPIED`, `CHECKED_OUT`, `CANCELLED`, `EXPIRED`.
* **Rationale**:
  - `RESERVED`: Bed allocated, waiting for payment (student is `null`).
  - `PENDING_CHECKIN`: Payment successful, student profile generated and linked to the assignment, waiting for physical check-in.
  - `OCCUPIED` (Active): Resident checked in and currently residing. Keeping `OCCUPIED` ensures backwards compatibility and avoids breaking compilation for existing codebase logic checking resident occupation.
  - `CHECKED_OUT`: Residency terminated.
  - `CANCELLED`: Declined/canceled manually.
  - `EXPIRED`: Reservation expired due to payment timeout.

### CHECK 05: Bed Status Design
* **Status Set**: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `BLOCKED`.
* **Audit**: Added **`BLOCKED`** to support administrative/seasonal locks on beds without falsely marking them under mechanical/maintenance repair.

### CHECK 06: Room Status Design
* **Status Set**: `AVAILABLE`, `FULL`, `MAINTENANCE`, `CLOSED`.
* **Audit**: Fully covers all organizational and capacity states.

### CHECK 07: Database Normalization
* **3NF Verification**: All schemas conform to Third Normal Form (3NF).
* **Controlled Denormalization**: `Room.occupiedBeds` is stored as a derived value for performance. Any concurrency anomalies are prevented via Room pessimistic write locking (`findByIdForUpdate`) and self-healing job reconciliation (`reconcileRoomOccupancy`).

### CHECK 08: Constraint Design
* **Unique Constraints**:
  - `uk_building_floor` on `floors(building_id, floor_number)`
  - `uk_floor_room_code` on `rooms(floor_id, room_code)`
  - `uk_room_bed_code` on `beds(room_id, bed_code)`
* **Active Guard Indexes**:
  - `uk_active_assignment_application` on `student_housing_assignments(application_id)` where status in active states.
  - `uk_active_assignment_student` on `student_housing_assignments(student_id)` where status in active states and student is not null.
  - `uk_active_assignment_bed` on `student_housing_assignments(bed_id)` where status in active states.
* **Check Constraints**: Added in `V17__room_module_refactor.sql`:
  - `chk_room_occupied_beds`: `occupied_beds >= 0 AND occupied_beds <= capacity`
  - `chk_room_capacity_positive`: `capacity > 0`

### CHECK 09: Concurrency & Locking Design (WARNING 2 AUDIT)
* **Double Reservation & Allocation**: Solved by pessimistic write lock (`SELECT FOR UPDATE`) on the `Room` entity prior to checking bed availability, creating a transaction serialization boundary at the room level.
* **Warning 2 Audit (Lock Room vs. Lock Bed Concurrency Trade-off)**:
  - *Bed locking*: If we only lock the `Bed` entity during reservation, two concurrent transactions could successfully book separate beds in the *same* room. However, when writing the denormalized `occupiedBeds` count back to the `Room` entity, a **Lost Update** anomaly would occur.
  - *Room locking*: Locking the `Room` entity pessimistically (`findByIdForUpdate`) locks all capacity checks and updates for that room.
  - *Concurrency Impact*: Dormitory rooms typically have small capacities (2, 4, 6, or 8 beds), so contention on a single room code is extremely low. Thus, locking at the `Room` level provides high consistency, eliminates Lost Updates on capacity counters, and avoids lock-ordering deadlocks (e.g., Transaction 1 locks Bed A then Room, Transaction 2 locks Room then Bed B) while maintaining high overall application concurrency.
* **Unique Bed Occupation**: Prevented by the unique partial index `uk_active_assignment_bed` at the DB level, and checked in `existsByBed_BedIdAndStatusIn` validation in `HousingAssignmentService`.

### CHECK 10: Boundary Audit
* **Modularity Verification**: The Room module holds only ID association mappings/soft references to `Student` and `DormitoryApplication` through Lazy ManyToOne relationships. It never directly updates external entities or contains logic belonging to other domains. 
* **Events**:
  - **Student Activation**: Room publishes `CheckInCompletedEvent`. Student module handles it to update `Student` status to `ACTIVE`.
  - **Application Expiration**: Room publishes `HousingReservationExpiredEvent`. Application module handles it to update `DormitoryApplication` status to `EXPIRED`.

### CHECK 11: Flyway Design
* The refactor script `V17__room_module_refactor.sql` has been created under `src/main/resources/db/migration/` to redefine the partial active unique indexes (including `PENDING_CHECKIN`) and enforce safety check constraints.

### CHECK 12: Readiness Score
* **Readiness**: **100% Ready**. With entities, enums, database indexes, and events cleanly defined and decoupled, the Room module is ready for the service and controller integration phase.

---

## 3. Entity Proposal
[StudentHousingAssignment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/entity/StudentHousingAssignment.java) uses:
```java
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AssignmentStatus status;
```
Enums `AssignmentStatus` and `BedStatus` have been updated.

---

## 4. Database Proposal
```sql
CREATE UNIQUE INDEX uk_active_assignment_application 
ON student_housing_assignments(application_id) 
WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED');
```

---

## 5. Enum Proposal
```java
public enum AssignmentStatus {
    RESERVED,
    PENDING_CHECKIN,
    OCCUPIED,
    CHECKED_OUT,
    CANCELLED,
    EXPIRED
}

public enum BedStatus {
    AVAILABLE,
    RESERVED,
    OCCUPIED,
    MAINTENANCE,
    BLOCKED
}
```

---

## 6. Registry of Actions

### Files Created:
* [V17__room_module_refactor.sql](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/resources/db/migration/V17__room_module_refactor.sql)
* [HousingReservationExpiredEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/HousingReservationExpiredEvent.java)
* [CheckInCompletedEvent.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/event/CheckInCompletedEvent.java)
* [StudentEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/student/event/StudentEventListener.java)

### Files Modified:
* [AssignmentStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/enums/AssignmentStatus.java)
* [BedStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/enums/BedStatus.java)
* [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java)
* [ApplicationEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/event/ApplicationEventListener.java)

---

## 7. Final Decision

**ROOM-02 PASS**
