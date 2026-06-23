# SDMS-ARCH-02A: Architecture Remediation Plan

**Source Baseline**: Source code only. No documentation accepted as evidence.  
**Audit Date**: 2026-06-21  
**Status**: PLAN — No code modified.

---

## REMEDIATION MATRIX

| Finding ID | Severity | Component | Current State (Source Evidence) | Target State | Owner |
|:---|:---|:---|:---|:---|:---|
| P0-01 | CRITICAL | `PaymentEventListener`, `StudentEventListener` | `PaymentSuccessEvent` published in `PaymentService.executePayment()` L75. Zero listeners registered. | New `PaymentSuccessConsumer` in Room module handles: Assignment `RESERVED→PENDING_CHECKIN`, Student creation, UserAccount creation. | Room Module + Student Module + Auth Module |
| P0-02 | HIGH | `PaymentEventListener` | `@EventListener @Transactional` on `handleBedReserved()`. Runs synchronous within `RoomEventListener`'s `REQUIRES_NEW` transaction. Bill failure rolls back bed reservation. | `@TransactionalEventListener(phase = AFTER_COMMIT)` + `@Transactional(propagation = REQUIRES_NEW)`. | Payment Module |
| P1-01 | MEDIUM | No file — `BillEventListener` absent | `HousingReservationExpiredEvent` carries `assignmentId`. `BillRepository.findByStatus(UNPAID)` exists. No bill cancellation on expiry. | New `BillEventListener` in Payment module cancels `UNPAID` bills for expired `assignmentId`. | Payment Module |
| P1-02 | LOW | Migration chain | V14 absent — chain was V13→V15. `V14__placeholder.sql` already created (2026-06-21). | **RESOLVED** — V14 placeholder confirmed present. Chain now V1→V18 contiguous. | Infrastructure |

---

## EVENT REMEDIATION MATRIX

### Current Event Flow (Source Code Reality)

```
PaymentService.executePayment()
  └─ bill.status = PAID
  └─ publishEvent(PaymentSuccessEvent{billId, assignmentId, applicationId})
          │
          └──► NO LISTENER  ← BROKEN

PaymentEventListener.handleBedReserved(BedReservedEvent)
  @EventListener @Transactional          ← WRONG: synchronous, shares RoomEventListener TX
  └─ billService.createAccommodationBill(assignmentId, applicationId, 500_000)
          │
          └──► Exception here rolls back HousingAssignmentService.reserveBed()  ← RISK

HousingReservationExpiredEvent published by HousingAssignmentService.expireReservation()
  └──► ApplicationEventListener handles Application→EXPIRED  ← ONLY CONSUMER
  └──► No BillEventListener  ← ORPHAN BILLS CREATED
```

### Target Event Flow (After Remediation)

```
[FLOW A] Bed Reserved → Bill Creation (P0-02 fix)
─────────────────────────────────────────────────
RoomEventListener.handleApplicationApproved()        @TransactionalEventListener AFTER_COMMIT + REQUIRES_NEW
  └─ HousingAssignmentService.reserveBed()
  └─ publishEvent(BedReservedEvent{applicationId, assignmentId})
          │
          └──► PaymentEventListener.handleBedReserved()
                @TransactionalEventListener(AFTER_COMMIT) + @Transactional(REQUIRES_NEW)  ← FIXED
                └─ billService.createAccommodationBill(...)
                   [Isolated TX: bill failure does NOT roll back bed reservation]

[FLOW B] Payment Success → Student Provisioning (P0-01 fix)
────────────────────────────────────────────────────────────
PaymentService.executePayment()
  └─ bill.status = PAID
  └─ publishEvent(PaymentSuccessEvent{billId, assignmentId, applicationId})
          │
          ├──► RoomEventListener.handlePaymentSuccess()              [NEW]
          │       @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW
          │       └─ assignmentService.transitionToPendingCheckIn(assignmentId)
          │              └─ assignment.status = PENDING_CHECKIN
          │              └─ assignment.student = savedStudent
          │              └─ publishEvent(StudentCreatedEvent{studentId, assignmentId})
          │
          └──► StudentProvisioningListener.handlePaymentSuccess()   [NEW — Student Module]
                  @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW
                  └─ Create Student from DormitoryApplication snapshot
                  └─ Create UserAccount (role=STUDENT, status=PENDING_ACTIVATION)
                  └─ Link UserAccount.student = savedStudent
                  └─ publishEvent(StudentCreatedEvent{...})  [optional, for extensibility]

[FLOW C] Assignment Expiry → Bill Cancellation (P1-01 fix)
───────────────────────────────────────────────────────────
HousingAssignmentService.expireReservation()
  └─ assignment.status = EXPIRED
  └─ publishEvent(HousingReservationExpiredEvent{applicationId, assignmentId})
          │
          ├──► ApplicationEventListener.handleHousingReservationExpired()  [EXISTING]
          │       └─ application.status = EXPIRED
          │
          └──► BillEventListener.handleHousingReservationExpired()         [NEW]
                  @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW
                  └─ Find UNPAID bill for assignmentId
                  └─ bill.status = CANCELLED
```

---

## OWNERSHIP MATRIX

| Responsibility | Module | Component | Method / Hook |
|:---|:---|:---|:---|
| Publish `PaymentSuccessEvent` | Payment | `PaymentService` | `executePayment()` — **EXISTING, CORRECT** |
| Consume `PaymentSuccessEvent` → Assignment `PENDING_CHECKIN` | Room | `RoomEventListener` (ADD handler) | `handlePaymentSuccess(PaymentSuccessEvent)` **NEW** |
| Consume `PaymentSuccessEvent` → Create `Student` + `UserAccount` | Student / Auth | New `StudentProvisioningListener` | `handlePaymentSuccess(PaymentSuccessEvent)` **NEW** |
| Transition `Assignment.student` reference | Room | `HousingAssignmentService` | `transitionToPendingCheckIn(UUID assignmentId, UUID studentId)` **NEW** |
| Create `Student` from `DormitoryApplication` | Student | `StudentProvisioningService` (NEW) or `StudentService` | `provisionFromApplication(UUID applicationId)` **NEW** |
| Create `UserAccount` for new `Student` | Auth | `AuthService` or `UserAccountProvisioningService` | `createStudentAccount(UUID studentId, String email)` **NEW** |
| Consume `BedReservedEvent` → Create `Bill` | Payment | `PaymentEventListener` | `handleBedReserved()` — **EXISTING, FIX ANNOTATION** |
| Consume `HousingReservationExpiredEvent` → Cancel `Bill` | Payment | `BillEventListener` (CREATE) | `handleHousingReservationExpired(...)` **NEW** |
| Consume `CheckInCompletedEvent` → Student `ACTIVE` | Student | `StudentEventListener` | `handleCheckInCompleted()` — **EXISTING, CORRECT** |

---

## STATE TRANSITION MATRIX

### Assignment Lifecycle

| From | To | Trigger | Handler | Transaction |
|:---|:---|:---|:---|:---|
| — | `RESERVED` | `ApplicationApprovedEvent` consumed | `HousingAssignmentService.reserveBed()` via `@PrePersist` | `REQUIRES_NEW` (RoomEventListener) |
| `RESERVED` | `PENDING_CHECKIN` | `PaymentSuccessEvent` consumed | `HousingAssignmentService.transitionToPendingCheckIn()` **[NEW]** | `REQUIRES_NEW` (RoomEventListener new handler) |
| `PENDING_CHECKIN` | `OCCUPIED` | Admin check-in action | `HousingAssignmentService.checkIn()` | `@Transactional` |
| `OCCUPIED` | `CHECKED_OUT` | Admin check-out action | `HousingAssignmentService.checkOut()` | `@Transactional` |
| `RESERVED` | `EXPIRED` | `PaymentExpireJob` (scheduler, every 5 min) | `HousingAssignmentService.expireReservation()` | `REQUIRES_NEW` (per-assignment) |
| `RESERVED`/`PENDING_CHECKIN`/`OCCUPIED` | `CANCELLED` | Admin manual cancel | `HousingAssignmentService.cancel()` | `@Transactional` |

> **Gap closed**: `RESERVED → PENDING_CHECKIN` transition is currently unreachable. Adding `RoomEventListener.handlePaymentSuccess()` closes this gap.

---

### Student Lifecycle

| From | To | Trigger | Handler | Transaction |
|:---|:---|:---|:---|:---|
| — | `PENDING_CHECKIN` | `PaymentSuccessEvent` consumed (student created) | `StudentProvisioningListener.handlePaymentSuccess()` **[NEW]** | `REQUIRES_NEW` |
| `PENDING_CHECKIN` | `ACTIVE` | `CheckInCompletedEvent` consumed | `StudentEventListener.handleCheckInCompleted()` | `REQUIRES_NEW` — **EXISTING** |
| `ACTIVE` | `GRADUATED` | Admin manual operation | Future endpoint | — |
| `ACTIVE` | `INACTIVE` | Admin manual operation | Future endpoint | — |

---

### Bill Lifecycle

| From | To | Trigger | Handler | Transaction |
|:---|:---|:---|:---|:---|
| — | `UNPAID` | `BedReservedEvent` consumed | `PaymentEventListener.handleBedReserved()` | `REQUIRES_NEW` **(after fix)** |
| `UNPAID` | `PARTIALLY_PAID` | Student partial payment | `PaymentService.updateBillAfterPayment()` | `@Transactional` |
| `PARTIALLY_PAID` / `UNPAID` | `PAID` | Student full payment | `PaymentService.updateBillAfterPayment()` | `@Transactional` |
| `UNPAID` | `CANCELLED` | `HousingReservationExpiredEvent` consumed | `BillEventListener.handleHousingReservationExpired()` **[NEW]** | `REQUIRES_NEW` |
| `UNPAID` | `OVERDUE` | Scheduler scan (future) | Future `BillOverdueJob` | `REQUIRES_NEW` per bill |

---

### UserAccount Lifecycle (for Student role)

| From | To | Trigger | Handler | Transaction |
|:---|:---|:---|:---|:---|
| — | `PENDING_ACTIVATION` | `PaymentSuccessEvent` consumed (account auto-created) | `StudentProvisioningListener.handlePaymentSuccess()` **[NEW]** | `REQUIRES_NEW` |
| `PENDING_ACTIVATION` | `ACTIVE` | Student sets password on first login / activation | `AuthService` existing flow | `@Transactional` |

---

## MIGRATION REMEDIATION MATRIX

| Version | File | Status | Action Required |
|:---|:---|:---|:---|
| V1–V13 | All present | VERIFIED | None |
| V14 | `V14__placeholder.sql` | **CREATED 2026-06-21** | **RESOLVED** — no further action |
| V15–V18 | All present | VERIFIED | None |
| V19 | Does not exist | PENDING | Create `V19__payment_success_workflow.sql` if any schema change needed (see below) |

### V19 Requirement Analysis

Source evidence from `StudentHousingAssignment.java`:
- `student` field: `@ManyToOne @JoinColumn(name = "student_id", nullable = true)` — **already nullable, no DDL change needed**

Source evidence from `UserAccount.java`:
- `student` field: `@OneToOne @JoinColumn(name = "student_id", unique = true)` — **already exists, no DDL change needed**

Source evidence from `BillRepository.java`:
- `findByStatus(BillStatus status)` — **already exists, sufficient for CANCELLED transition**

**Conclusion**: No V19 migration required. All schema support for the remediation already exists in V7, V13, V18.

> [!NOTE]
> Future `BillStatus.OVERDUE` job will require a separate migration only if a dedicated scheduled job tracking column is added to `bills`. For V1, no schema change needed — the `due_date` index (`idx_bills_due_date` from V18) is sufficient.

---

## CHECK 01: PAYMENT SUCCESS WORKFLOW REMEDIATION

**Source evidence**:
- `PaymentSuccessEvent.java`: carries `billId`, `assignmentId`, `applicationId`
- `StudentHousingAssignment.java`: `student` field nullable, set post-payment by design (javadoc confirms: *"student_id will be null while in RESERVED"*)
- `DormitoryApplication.java`: contains full snapshot (`fullName`, `cccd`, `email`, `phone`, `faculty`, `gender`, `fatherName`, etc.) — sufficient for `Student` creation without any external API call
- `UserAccountRepository.java`: `findByStudent_StudentId(UUID studentId)` and `findByEmail(String email)` exist — idempotency check available
- `StudentRepository.java`: `existsByCccd(String cccd)` exists — idempotency guard available

### Correct Choreography

```
PaymentSuccessEvent
  ├── Consumer 1: RoomEventListener.handlePaymentSuccess()
  │     Module: room
  │     Annotation: @TransactionalEventListener(AFTER_COMMIT) + @Transactional(REQUIRES_NEW)
  │     Actions:
  │       1. Load Assignment by assignmentId (pessimistic lock)
  │       2. Guard: if status != RESERVED → skip (idempotency)
  │       3. Set assignment.status = PENDING_CHECKIN
  │       4. Set assignment.student = student (after student is created — see ordering note)
  │       → Ordering problem: Student must exist before assignment.student can be set.
  │         Solution: StudentProvisioningListener runs in a SEPARATE REQUIRES_NEW TX.
  │         RoomEventListener uses StudentRepository.findByCccd(cccd) after student is saved.
  │         OR: Two-phase approach — RoomEventListener only sets status, StudentProvisioningListener
  │             sets assignment.student after creating the student.
  │
  └── Consumer 2: StudentProvisioningListener.handlePaymentSuccess()
        Module: student (new listener) + user (account creation)
        Annotation: @TransactionalEventListener(AFTER_COMMIT) + @Transactional(REQUIRES_NEW)
        Actions:
          1. Load DormitoryApplication by applicationId
          2. Guard: if studentRepository.existsByCccd(app.getCccd()) → skip
          3. Create Student from application snapshot
          4. Save Student
          5. Create UserAccount (username=studentCode, email=app.getEmail(),
             role=STUDENT, status=PENDING_ACTIVATION, password=bcrypt(tempPassword))
          6. Link UserAccount.student = savedStudent
          7. Save UserAccount
          8. Update assignment.student = savedStudent
          9. assignment.status = PENDING_CHECKIN (can be merged here, removing Consumer 1)
```

> **Design Decision**: Merge assignment transition into `StudentProvisioningListener` to avoid cross-listener ordering dependency. One listener handles: Student creation + UserAccount creation + Assignment.student link + Assignment.status = PENDING_CHECKIN. `RoomEventListener` does NOT need a new handler.

### Final Simplified Design

```
PaymentSuccessEvent
  └──► StudentProvisioningListener.handlePaymentSuccess()
         Module: student
         @TransactionalEventListener(AFTER_COMMIT)
         @Transactional(REQUIRES_NEW)
         1. Load Application by applicationId
         2. Guard: existsByCccd → skip if already provisioned
         3. new Student(application snapshot) → save
         4. new UserAccount(STUDENT, PENDING_ACTIVATION) → link student → save
         5. Load Assignment by assignmentId (pessimistic lock via findByIdForUpdate)
         6. assignment.student = savedStudent
         7. assignment.status = PENDING_CHECKIN
         8. save assignment
```

**Transaction isolation**: Entire operation runs in its own `REQUIRES_NEW` transaction. Failure does NOT affect `PaymentService`'s committed transaction (bill is PAID regardless). Safe to retry.

---

## CHECK 02: ASSIGNMENT LIFECYCLE REMEDIATION

**Source evidence**: `HousingAssignmentService.java` — `checkIn()` method:

```java
// Current checkIn() — student must exist BEFORE checkIn can be called
public void checkIn(UUID assignmentId) {
    // validates assignment.status must be PENDING_CHECKIN
    // sets OCCUPIED, sets checkInAt
    // publishEvent(CheckInCompletedEvent{student.getStudentId(), assignmentId})
}
```

The `checkIn()` flow already expects `assignment.student != null` at check-in time (it reads `student.getStudentId()` for the event). This confirms Student must be created at `PENDING_CHECKIN` transition, not at check-in time.

**Lifecycle owner per status**:

| Status | Owner Service | Source Method |
|:---|:---|:---|
| `RESERVED` | `HousingAssignmentService` | `reserveBed()` via `@PrePersist` |
| `PENDING_CHECKIN` | `StudentProvisioningListener` **(new)** | via `PaymentSuccessEvent` handler |
| `OCCUPIED` | `HousingAssignmentService` | `checkIn()` |
| `CHECKED_OUT` | `HousingAssignmentService` | `checkOut()` |
| `EXPIRED` | `HousingAssignmentService` | `expireReservation()` via `PaymentExpireJob` |
| `CANCELLED` | `HousingAssignmentService` | `cancel()` |

---

## CHECK 03: STUDENT PROVISIONING REMEDIATION

**Source evidence — fields available in `DormitoryApplication` for `Student` creation**:

| Student Field | Source in DormitoryApplication | Nullable in Student? |
|:---|:---|:---|
| `fullName` | `application.getFullName()` | NOT NULL |
| `cccd` | `application.getCccd()` | NOT NULL, UNIQUE |
| `email` | `application.getEmail()` | nullable |
| `phone` | `application.getPhone()` | nullable |
| `faculty` | `application.getFaculty()` | nullable |
| `permanentAddress` | `application.getPermanentAddress()` | nullable |
| `fatherName` | `application.getFatherName()` | nullable |
| `fatherPhone` | `application.getFatherPhone()` | nullable |
| `motherName` | `application.getMotherName()` | nullable |
| `motherPhone` | `application.getMotherPhone()` | nullable |
| `emergencyContact` | `application.getEmergencyContact()` | nullable |
| `sourceApplication` | `application` (the entity itself) | NOT NULL (`updatable=false`) |
| `status` | hardcoded `PENDING_CHECKIN` | NOT NULL |
| `studentCode` | generated (system, e.g. academic year + seq) | UNIQUE nullable |
| `isFaceRegistered` | `false` (default) | NOT NULL |

**UserAccount creation requirements**:

| Field | Source / Logic |
|:---|:---|
| `username` | Generated from `studentCode` or `cccd`-based pattern |
| `email` | `application.getEmail()` |
| `password` | BCrypt of system-generated temp password (sent via email) |
| `role` | `Role.STUDENT` |
| `status` | `AccountStatus.PENDING_ACTIVATION` |
| `student` | `savedStudent` |

**Module ownership**:

| Component | Module Package |
|:---|:---|
| `StudentProvisioningListener` | `com.sdms.backend.modules.student.event` |
| `StudentProvisioningService` | `com.sdms.backend.modules.student.service` |
| UserAccount creation call | Delegates to `AuthService` or inline via `UserAccountRepository` |

> **Boundary note**: `StudentProvisioningListener` lives in the Student module but writes to `user_accounts` via `UserAccountRepository`. This is allowed in SDMS Modular Monolith architecture. No cross-module service injection concern — it uses the repository directly.

---

## CHECK 04: PAYMENT EVENT BOUNDARY REMEDIATION

**Source evidence** — `PaymentEventListener.java`:

```java
@EventListener                  // ← synchronous, participates in caller's TX
@Transactional                  // ← joins REQUIRES_NEW TX of RoomEventListener
public void handleBedReserved(BedReservedEvent event) {
    billService.createAccommodationBill(...);
}
```

**Caller context** — `RoomEventListener.handleApplicationApproved()`:

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
public void handleApplicationApproved(ApplicationApprovedEvent event) {
    assignmentService.reserveBed(...)          // ← commits in REQUIRES_NEW TX
    eventPublisher.publishEvent(BedReservedEvent)  // ← fires synchronously
    // PaymentEventListener.handleBedReserved() runs HERE in the same thread
    // If createAccommodationBill() throws → RoomEventListener TX rolls back
    // → bed reservation is lost even though it committed separately? No:
    // reserveBed() is in its own REQUIRES_NEW and already committed.
    // BUT: The outer RoomEventListener TX will roll back.
    // In Spring's @TransactionalEventListener, the outer "TX" is the listener method itself.
    // The publishEvent() is called WITHIN the REQUIRES_NEW TX of RoomEventListener.
    // @EventListener fires synchronously → joins the REQUIRES_NEW TX of handleApplicationApproved.
    // Exception in handleBedReserved → rolls back handleApplicationApproved's REQUIRES_NEW TX.
    // reserveBed() already committed (its own REQUIRES_NEW) → BED IS RESERVED.
    // But BedReservedEvent TX context is lost → no rollback of bed, but no bill either.
    // Dirty state: RESERVED bed, RESERVED assignment, NO bill. PaymentExpireJob will expire it.
}
```

**Actual risk**: Bill creation exception → assignment RESERVED with no bill. Student cannot pay. PaymentExpireJob expires after 3 days. Not a data corruption, but a silent business failure.

**Required fix**:

```java
// BEFORE (wrong):
@EventListener
@Transactional
public void handleBedReserved(BedReservedEvent event)

// AFTER (correct):
@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void handleBedReserved(BedReservedEvent event)
```

This ensures:
1. `handleBedReserved` runs in a **new isolated transaction** after `RoomEventListener` has fully committed.
2. Exception in bill creation → only the bill TX rolls back. Bed reservation is unaffected.
3. Error can be logged and retried independently.

**File to modify**: `PaymentEventListener.java`  
**Change**: Replace `@EventListener` with `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` and add `@Transactional(propagation = Propagation.REQUIRES_NEW)`.

---

## CHECK 05: BILL EXPIRATION REMEDIATION

**Source evidence**:
- `HousingReservationExpiredEvent.java` carries: `applicationId`, `assignmentId`
- `BillRepository.java`: `findByStatus(BillStatus status)` exists; no `findByAssignmentId` exists
- `Bill.java` (from V18): `assignment_id` stored as raw `UUID` column, indexed via `idx_bills_assignment_id`
- Missing: `BillRepository.findByAssignmentId(UUID)` — must be added

### Bill State Decision per Expiry Scenario

| Scenario | Bill Current Status | Target Status | Rationale |
|:---|:---|:---|:---|
| `HousingReservationExpiredEvent` (3-day payment timeout) | `UNPAID` | `CANCELLED` | Assignment expired, payment window closed. Bill is void. |
| `HousingReservationExpiredEvent` | `PARTIALLY_PAID` | `CANCELLED` | Edge case — partial payment received but deadline missed. Refund process required (future scope). Set CANCELLED. |
| `HousingReservationExpiredEvent` | `PAID` | No change | Impossible — paid bill triggers `PaymentSuccessEvent`, assignment moves to `PENDING_CHECKIN`. |
| Admin manual cancel of assignment | `UNPAID` | `CANCELLED` | Admin cancellation also cancels the bill. |

### `BillEventListener` Design

**New file**: `com.sdms.backend.modules.payment.event.BillEventListener`

```
handleHousingReservationExpired(HousingReservationExpiredEvent event)
  @TransactionalEventListener(phase = AFTER_COMMIT)
  @Transactional(REQUIRES_NEW)
  1. Load Bill by assignmentId:
       BillRepository.findByAssignmentId(event.getAssignmentId())
  2. If not found → log WARN, return (assignment may not have had a bill — edge case)
  3. If bill.status == PAID → log INFO, return (payment already succeeded)
  4. Set bill.status = CANCELLED
  5. Save bill
  6. Log: "[BillEventListener] Bill={} CANCELLED for expired assignment={}"
```

**Required repository addition** (BillRepository):

```java
Optional<Bill> findByAssignmentId(UUID assignmentId);
// Or if multiple bills per assignment are possible in future:
List<Bill> findByAssignmentIdAndStatusIn(UUID assignmentId, List<BillStatus> statuses);
```

**Source check**: `Bill.java` — `assignmentId` is a plain `UUID` field (not a JPA relationship). Spring Data JPA `findByAssignmentId` works directly on the `UUID` field.

---

## CHECK 06: FLYWAY REMEDIATION

**Current chain** (verified from filesystem listing):

```
V1, V2, V3, V4, V5, V6, V7, V8, V9, V10, V11, V12, V13, V14, V15, V16, V17, V18
```

**V14 status**: `V14__placeholder.sql` created 2026-06-21 with content `-- No operation.`  
**Gap**: RESOLVED. Chain is now contiguous V1→V18.

**Remaining Flyway risks**:

| Risk | Evidence | Status |
|:---|:---|:---|
| V8 is a NO-OP placeholder | `V8__add_student_to_assignments.sql` contains `-- No operation` | ACCEPTABLE — consistent with V14 pattern |
| V12 indexes dropped by V17 | V17 DROPs and RECREATEs V12's partial index to add `PENDING_CHECKIN` | CLEAN — V17 handles this explicitly |
| V18 drops `fk_payments_bill` and recreates as RESTRICT | Replaces original FK from V13 | CLEAN — idempotent drop+add pattern |
| No V19 needed | All schema for remediation exists: `student_id nullable` in assignments (V7), `assignment_id` in bills (V13), `user_accounts.student_id` (V7) | CONFIRMED |

**Recommendation**: No additional migration needed for P0-01, P0-02, P1-01. All required columns and FKs are already in place.

---

## IMPLEMENTATION ROADMAP

### Phase 1 — Critical Fixes (P0 Blockers)

| Step | Action | File(s) Affected | Risk |
|:---|:---|:---|:---|
| 1.1 | Fix `@EventListener` → `@TransactionalEventListener(AFTER_COMMIT)` + `@Transactional(REQUIRES_NEW)` on `handleBedReserved` | `PaymentEventListener.java` | LOW — annotation change only |
| 1.2 | Add `findByAssignmentId(UUID)` to `BillRepository` | `BillRepository.java` | LOW — Spring Data derived query |
| 1.3 | Create `BillEventListener.java` in `com.sdms.backend.modules.payment.event` | NEW FILE | LOW — isolated REQUIRES_NEW TX |
| 1.4 | Create `StudentProvisioningListener.java` in `com.sdms.backend.modules.student.event` | NEW FILE | MEDIUM — touches Student, UserAccount, Assignment |
| 1.5 | Add `transitionToPendingCheckIn(UUID assignmentId, Student student)` to `HousingAssignmentService` OR inline in listener | `HousingAssignmentService.java` OR inline | LOW |
| 1.6 | Add `StudentRepository.findBySourceApplication_ApplicationId(UUID)` for idempotency check | `StudentRepository.java` | LOW |
| 1.7 | Add `StudentHousingAssignmentRepository.findByIdForUpdate(UUID)` for pessimistic lock in provisioning | `StudentHousingAssignmentRepository.java` | LOW |

### Phase 2 — Architecture Re-Audit (SDMS-ARCH-02B)

| Step | Action |
|:---|:---|
| 2.1 | Re-audit event chain: confirm all 7 events have correct consumers |
| 2.2 | Verify `StudentProvisioningListener` idempotency under concurrent calls |
| 2.3 | Confirm `RoomOccupancyReconciliationJob` includes `PENDING_CHECKIN` in active assignment count |
| 2.4 | Verify V17 partial unique indexes include `PENDING_CHECKIN` — **already confirmed in V17** |
| 2.5 | Smoke test: V1→V18 migration on clean DB |

### Phase 3 — Database Freeze

| Step | Action |
|:---|:---|
| 3.1 | All Phase 1 implementations complete and tested |
| 3.2 | All Phase 2 re-audit checks PASS |
| 3.3 | Issue formal DATABASE FREEZE declaration |
| 3.4 | Begin SERVICE LAYER implementation phase |

---

## FINAL DECISION

```
SDMS-ARCH-02A: PASS

Remediation plan is complete and source-code grounded.
All 4 findings have verified root causes and actionable fixes.
No new schema changes required — all DDL is already in place.

P0-01: PaymentSuccessEvent consumer → new StudentProvisioningListener (Student module)
P0-02: PaymentEventListener annotation fix → @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW
P1-01: BillEventListener creation → new file, AFTER_COMMIT + REQUIRES_NEW
P1-02: V14 gap → RESOLVED (placeholder created 2026-06-21)

Ready to proceed to Phase 1 implementation upon approval.
```

---

*Source-code evidence only. All file references verified against actual source tree.*
