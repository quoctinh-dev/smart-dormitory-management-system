# Student Event Integration

## 1. Event Integration Overview
The Student Module uses event-driven integration to receive check-in notifications from the Room Module. This avoids coupling the check-in process directly with the student profile context:

```
[HousingAssignmentService.checkIn] (Room Module)
                 ↓
      Publishes CheckInCompletedEvent(studentId, assignmentId)
                 ↓
[StudentEventListener.handleCheckInCompleted] (Student Module)
                 ↓
      Transitions Student status to ACTIVE
```

---

## 2. Event Lifecycle & Transaction Boundaries
* **Publisher**: [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java#L143) publishes `CheckInCompletedEvent` when a staff member confirms check-in.
* **Consumer**: [StudentEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/student/event/StudentEventListener.java#L29) handles the event.
* **Transaction Boundary**: The listener utilizes `@Transactional(propagation = Propagation.REQUIRES_NEW)` and `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`:
  - This ensures that the student status update is performed in an independent transaction.
  - The student state is updated only **after** the Room Module transaction commits successfully.
  - If the student profile update fails, the Room Module transaction remains committed, avoiding check-in rollback issues.
