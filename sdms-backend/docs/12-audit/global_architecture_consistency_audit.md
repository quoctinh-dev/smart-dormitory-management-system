# SDMS Global Architecture Consistency Audit

**Technical Role**: Lead Systems Architect | Lead Software Engineer  
**Status**: **PASS**  
**Audit Date**: 2026-06-21  

---

## 1. Module Ownership Matrix

As a modular monolith, boundaries are enforced at the Service and Application Event layers while maintaining a shared database schema:

| Module Name | Owned Aggregate Roots | Owned Repositories | Core Services | Published Event |
| :--- | :--- | :--- | :--- | :--- |
| **Auth Module** | `UserAccount` | `UserAccountRepository` | `AuthService`<br>`JwtService` | None (consumes only) |
| **Student Module** | `Student` | `StudentRepository` | `StudentService` | `StudentCreatedEvent` |
| **Application Module** | `DormitoryApplication` | `DormitoryApplicationRepository`<br>`DormitoryApplicationStatusHistoryRepository` | `ApplicationReviewService`<br>`ApplicationPriorityService` | `ApplicationApprovedEvent` |
| **Room Module** | `Room`, `Bed`, `StudentHousingAssignment` | `RoomRepository`<br>`BedRepository`<br>`StudentHousingAssignmentRepository` | `HousingAssignmentService` | `BedReservedEvent`<br>`BedReservationFailedEvent`<br>`HousingReservationExpiredEvent`<br>`CheckInCompletedEvent`<br>`BedReleasedEvent` |
| **Payment Module** | `Bill`, `Payment` | `BillRepository`<br>`PaymentRepository` | `BillService`<br>`PaymentService` | `PaymentSuccessEvent` |

---

## 2. Event Choreography & Transaction Boundaries

Cross-module workflows are fully decoupled using Spring Application Events. To isolate failures, cross-module listeners run in independent transactions after the parent commits:

| Event Name | Publishing Service | Subscriber Listener | Transaction Propagation | Phase |
| :--- | :--- | :--- | :--- | :--- |
| `ApplicationApprovedEvent` | `ApplicationReviewService` | `RoomEventListener` | `REQUIRES_NEW` | `AFTER_COMMIT` |
| `BedReservedEvent` | `HousingAssignmentService` | `PaymentEventListener`<br>`ApplicationEventListener` | `REQUIRES_NEW`<br>`REQUIRES_NEW` | `AFTER_COMMIT` |
| `BedReservationFailedEvent`| `HousingAssignmentService` | `ApplicationEventListener` | `REQUIRES_NEW` | `AFTER_COMMIT` |
| `PaymentSuccessEvent` | `PaymentService` | `StudentEventListener` | `REQUIRES_NEW` | `AFTER_COMMIT` |
| `StudentCreatedEvent` | `StudentService` | `AuthEventListener`<br>`RoomEventListener` | `REQUIRES_NEW`<br>`REQUIRES_NEW` | `AFTER_COMMIT` |
| `HousingReservationExpiredEvent`| `HousingAssignmentService` | `ApplicationEventListener`<br>`BillEventListener` | `REQUIRES_NEW`<br>`REQUIRES_NEW` | `AFTER_COMMIT` |
| `CheckInCompletedEvent` | `HousingAssignmentService` | `StudentEventListener` | `REQUIRES_NEW` | `AFTER_COMMIT` |
| `BedReleasedEvent` | `HousingAssignmentService` | `ApplicationEventListener` | `REQUIRES_NEW` | `AFTER_COMMIT` |

---

## 3. End-to-End State Machine Consistency

The SDMS system models student registration and residence via state machines. No conflicting transitions exist:

```
[ApplicationStatus]
PENDING ──> UNDER_REVIEW ──> APPROVED ──> WAITING_PAYMENT ──> APPROVED (Complete)
                                 │              │
                                 └──> WAITING_  └──> EXPIRED (Released)
                                      LIST ──> APPROVED
[AssignmentStatus]
RESERVED ──> OCCUPIED (Checked-in) ──> CHECKED_OUT (Completed)
   │
   └──> EXPIRED (Payment timeout)

[StudentStatus]
PENDING_CHECKIN ──> ACTIVE (Occupying bed) ──> INACTIVE / GRADUATED

[AccountStatus]
PENDING_ACTIVATION ──> ACTIVE (Password setup complete)

[BillStatus]
UNPAID ──> PARTIALLY_PAID ──> PAID
   │
   └──> CANCELLED / OVERDUE
```

---

## 4. Key Architectural Risks & Mitigations

### 4.1 Asynchronous Event Failures (High Risk)
* **Cause**: Event listeners execute in separate transaction contexts (`REQUIRES_NEW`) triggered `AFTER_COMMIT`. If a downstream listener fails (e.g. student profile creation throws unique constraint violation on CCCD), the payment commit is NOT rolled back.
* **Impact**: The student has paid the bill, but their profile and user credentials are not created, leaving them unable to log in or check in.
* **Mitigation**: Implement an Event Outbox Pattern or persistent Event Logs (such as using a transactional inbox/outbox library) to guarantee event delivery retries and flag failed consumer runs for manual review in an Admin Dashboard.

### 4.2 Webhook Idempotency (Medium Risk)
* **Cause**: Gateway callback duplicate requests (retries).
* **Impact**: Double entry records.
* **Mitigation**: Locked down using pessimistic writes (`findByIdForUpdate` on `bills`) and database unique index validation constraints on `gateway_transaction_id` and `transaction_code`.

### 4.3 Concurrent Bed Allocation Race Conditions (Low Risk)
* **Cause**: Multiple approvals trying to occupy the same remaining bed.
* **Mitigation**: Handled successfully by Room module pessimistic locks (`findByIdForUpdate` on `Room`) and bed unique constraint check constraints (`V12__add_active_assignment_bed_unique_constraint.sql`).
