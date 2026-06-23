# Student Lifecycle Design

## 1. StudentStatus Lifecycle
The student resident state transitions are managed using the frozen [StudentStatus](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/student/enums/StudentStatus.java) enum:

```
[Payment Success]
       ↓
PENDING_CHECKIN (Payment completed, waiting to check in)
       ↓  (CheckInCompletedEvent)
ACTIVE (Residing in dormitory room)
       ↓
INACTIVE (Checked out, expelled, or terminated)
       ↓
GRADUATED (Completed academic studies and left)
```

### State Definitions
* **`PENDING_CHECKIN`**: Student has completed accommodation payment. The profile and credentials are created, but physical check-in is pending.
* **`ACTIVE`**: Student has checked in physically and resides in their assigned dormitory bed.
* **`INACTIVE`**: Student has checked out, or residency was terminated due to policy violations.
* **`GRADUATED`**: Student has completed their curriculum and moved out permanently.

---

## 2. Check-In & Check-Out State Transitions
* **Check-In Flow**:
  - Staff processes check-in in the Room Module $\rightarrow$ `HousingAssignmentService.checkIn()` executes.
  - Assignment and Bed status are updated to `OCCUPIED`.
  - Room Module publishes a `CheckInCompletedEvent`.
  - Student Module's `StudentEventListener` handles the event asynchronously (`Propagation.REQUIRES_NEW`).
  - Student status is updated to `ACTIVE`.
* **Check-Out Flow**:
  - Staff processes check-out in the Room Module $\rightarrow$ `HousingAssignmentService.checkOut()` executes.
  - Assignment status becomes `CHECKED_OUT`, and Bed status becomes `AVAILABLE`.
  - The Student Module status transitions to `INACTIVE` or remains active if they have another active assignment (restricted by unique index rule: 1 Student = 1 Active Assignment).
