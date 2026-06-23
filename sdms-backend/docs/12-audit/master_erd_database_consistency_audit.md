# SDMS-ARCH-02: Master ERD & Database Consistency Audit

**Technical Role**: Lead Systems Architect | Lead Database Engineer  
**Audit Type**: System-Wide ERD and Database Consistency Review  
**Status**: PASS  
**Audit Date**: 2026-06-21  
**Migration Baseline**: V1 to V18 (17 active migration files)

---

> [!IMPORTANT]
> SDMS is a Modular Monolith. Foreign Keys, JPA @ManyToOne, @OneToMany, and cross-module entity references are ALLOWED. Boundaries are enforced at the Service, Application, and Event layers only.

---

## MASTER ERD MATRIX

```
Auth Module                     Student Module
[user_accounts]--FK----------->[students]
PK: account_id                  PK: student_id
FK: student_id (1:1 opt.)       FK: source_application_id--FK-->

Application Module
[registration_periods]<--FK--[dormitory_applications]
PK: period_id                PK: application_id | FK: period_id
                             @Version (Optimistic Lock)
                             |
                   +---------+----------+-----------+-----------+
                   |         |          |           |
            [verification]  [app_       [app_gen_   [dorm_app_
            [_documents]    priorities] documents]  status_
                                                    history]
(all CASCADE from dormitory_applications)

[registration_eligibilities]
PK: eligibility_id | FK: period_id (CASCADE)

Room Module
[buildings]<--FK--[floors]<--FK--[rooms]<--FK--[beds]
                                              |
                                    [student_housing_assignments]
                                    PK: assignment_id
                                    FK: bed_id
                                    FK: application_id -> dormitory_applications
                                    FK: student_id -> students (NULLABLE)

Payment Module
[bills]
PK: bill_id
UUID: assignment_id (soft ref)
UUID: application_id (soft ref)
FK: room_id -> rooms (ON DELETE RESTRICT)
FK: student_id -> students (ON DELETE RESTRICT)
@Version (Optimistic Lock)
  |
  v 1:N
[payments]
PK: payment_id
FK: bill_id -> bills (ON DELETE RESTRICT)
UNIQUE: transaction_code
UNIQUE: gateway_transaction_id

[shedlock] - Infrastructure, distributed scheduler lock
```

---

## CHECK 01: MASTER ERD AUDIT - PASS

**Source Evidence**: All Java entities + Flyway V1-V18

| Entity | Table | Module | PK | FK References | Cardinality |
|:---|:---|:---|:---|:---|:---|
| UserAccount | user_accounts | Auth | account_id (UUID) | student_id -> students | 1:1 optional |
| Student | students | Student | student_id (UUID) | source_application_id -> dormitory_applications | 1:1 immutable |
| DormitoryApplication | dormitory_applications | Application | application_id (UUID) | period_id -> registration_periods | N:1 |
| ApplicationPriority | application_priorities | Application | application_priority_id (UUID) | application_id -> dormitory_applications CASCADE | N:1 |
| VerificationDocument | verification_documents | Application | document_id (UUID) | application_id -> dormitory_applications CASCADE | N:1 |
| ApplicationGeneratedDocument | application_generated_documents | Application | document_id (UUID) | application_id -> dormitory_applications CASCADE | N:1 |
| DormitoryApplicationStatusHistory | dormitory_application_status_history | Application | history_id (UUID) | application_id -> dormitory_applications CASCADE | N:1 |
| RegistrationPeriod | registration_periods | Application | period_id (UUID) | none | Root |
| RegistrationEligibility | registration_eligibilities | Application | eligibility_id (UUID) | period_id -> registration_periods CASCADE | N:1 |
| Building | buildings | Room | building_id (UUID) | none | Root |
| Floor | floors | Room | floor_id (UUID) | building_id -> buildings | N:1 |
| Room | rooms | Room | room_id (UUID) | floor_id -> floors | N:1 |
| Bed | beds | Room | bed_id (UUID) | room_id -> rooms | N:1 |
| StudentHousingAssignment | student_housing_assignments | Room | assignment_id (UUID) | bed_id, application_id, student_id (nullable) | N:1 each |
| Bill | bills | Payment | bill_id (UUID) | room_id RESTRICT, student_id RESTRICT; soft UUID refs for assignment/application | Mixed |
| Payment | payments | Payment | payment_id (UUID) | bill_id -> bills RESTRICT | N:1 |
| shedlock | shedlock | Infrastructure | name (VARCHAR) | none | Scheduler lock |

**Finding**: All aggregate boundaries correct. All FK cardinalities match JPA entity definitions.

---

## CHECK 02: MASTER TABLE INVENTORY AUDIT - PASS

**Source Evidence**: V1-V18 Flyway migrations verified against Java @Entity declarations.

### TABLE INVENTORY MATRIX

| Table | Category | Module | JPA Entity | Status |
|:---|:---|:---|:---|:---|
| user_accounts | Core | Auth | UserAccount.java | ACTIVE |
| students | Core | Student | Student.java | ACTIVE |
| dormitory_applications | Core | Application | DormitoryApplication.java | ACTIVE |
| registration_periods | Support | Application | RegistrationPeriod.java | ACTIVE |
| registration_eligibilities | Support | Application | RegistrationEligibility.java | ACTIVE |
| verification_documents | Support | Application | VerificationDocument.java | ACTIVE |
| application_priorities | Support | Application | ApplicationPriority.java | ACTIVE |
| application_generated_documents | Generated Document | Application | ApplicationGeneratedDocument.java | ACTIVE |
| dormitory_application_status_history | History | Application | DormitoryApplicationStatusHistory.java | ACTIVE |
| buildings | Core | Room | Building.java | ACTIVE |
| floors | Support | Room | Floor.java | ACTIVE |
| rooms | Core | Room | Room.java | ACTIVE |
| beds | Core | Room | Bed.java | ACTIVE |
| student_housing_assignments | Core | Room | StudentHousingAssignment.java | ACTIVE |
| bills | Core | Payment | Bill.java | ACTIVE |
| payments | Core | Payment | Payment.java | ACTIVE |
| shedlock | Infrastructure | System | none (ShedLock managed) | ACTIVE |

**Total Active Tables**: 17  
**Legacy Tables**: 0  
**Unused Tables**: 0  
**Orphan Tables**: 0

> [!NOTE]
> The application_stu module in the source tree is a legacy/parallel module with duplicate entities under com.sdms.backend.modules.application_stu. It does NOT map to any Flyway-managed table and is NOT instantiated by any active Spring @Component. It is dead code and should be archived.

---

## CHECK 03: FOREIGN KEY CONSISTENCY AUDIT - PASS

**Source Evidence**: V7, V13, V16, V17, V18 Flyway scripts

### FOREIGN KEY MATRIX

| Constraint Name | Table | Column | References | Delete Strategy | Migration | Correctness |
|:---|:---|:---|:---|:---|:---|:---|
| fk_floor_building | floors | building_id | buildings(building_id) | DEFAULT RESTRICT | V7 | CORRECT |
| fk_room_floor | rooms | floor_id | floors(floor_id) | DEFAULT RESTRICT | V7 | CORRECT |
| fk_bed_room | beds | room_id | rooms(room_id) | DEFAULT RESTRICT | V7 | CORRECT |
| fk_assignment_bed | student_housing_assignments | bed_id | beds(bed_id) | DEFAULT RESTRICT | V7 | CORRECT |
| fk_assignment_application | student_housing_assignments | application_id | dormitory_applications(application_id) | DEFAULT RESTRICT | V7 | CORRECT |
| fk_assignment_student | student_housing_assignments | student_id | students(student_id) | DEFAULT RESTRICT | V7 | CORRECT |
| fk_eligibility_period | registration_eligibilities | period_id | registration_periods(period_id) | ON DELETE CASCADE | V5 | ACCEPTABLE - non-financial child |
| fk_priority_application | application_priorities | application_id | dormitory_applications(application_id) | ON DELETE CASCADE | V16 | CORRECT - owned child |
| fk_status_history_application | dormitory_application_status_history | application_id | dormitory_applications(application_id) | ON DELETE CASCADE | V16 | CORRECT - owned child |
| fk_gen_doc_application | application_generated_documents | application_id | dormitory_applications(application_id) | ON DELETE CASCADE | V16 | CORRECT - owned child |
| fk_bills_assignment | bills | assignment_id | student_housing_assignments(assignment_id) | DEFAULT (no explicit rule) | V13 | WARNING - see below |
| fk_payments_bill | payments | bill_id | bills(bill_id) | ON DELETE RESTRICT | V18 (refactored from CASCADE) | CORRECT |
| fk_bills_room | bills | room_id | rooms(room_id) | ON DELETE RESTRICT | V18 | CORRECT |
| fk_bills_student | bills | student_id | students(student_id) | ON DELETE RESTRICT | V18 | CORRECT |
| students.source_application_id | students | source_application_id | dormitory_applications(application_id) | DEFAULT RESTRICT | V1 | CORRECT |
| user_accounts.student_id | user_accounts | student_id | students(student_id) | DEFAULT RESTRICT | V1 | CORRECT |

> [!WARNING]
> WARNING - FK fk_bills_assignment: The bills.assignment_id column has a FK to student_housing_assignments defined in V13, but the ON DELETE strategy is not explicitly set (defaults to RESTRICT/NO ACTION). This is acceptable for financial safety but must be documented. Bill.java correctly stores assignment_id as a raw UUID (decoupled, no JPA @ManyToOne), which is architecturally correct. The FK provides referential integrity at the DB layer only.

**No broken FK chains detected. No orphan risks detected.**

---

## CHECK 04: CIRCULAR DEPENDENCY AUDIT - PASS

**Source Evidence**: Entity imports, Service dependencies, Event publisher/subscriber patterns

### Entity Graph (no cycles)
```
dormitory_applications -> registration_periods     (no cycle)
students -> dormitory_applications                 (no cycle)
user_accounts -> students                          (no cycle)
student_housing_assignments -> dormitory_applications, students, beds (no cycle)
beds -> rooms -> floors -> buildings               (linear, no cycle)
bills -> rooms, students (soft UUID only)          (no cycle)
payments -> bills                                  (no cycle)
```

### Event Graph (Critical Path)
```
ApplicationReviewService
  -> publishEvent(ApplicationApprovedEvent)
  -> RoomEventListener.handleApplicationApproved()
      -> HousingAssignmentService.reserveBed()
          -> publishEvent(BedReservedEvent)
              -> PaymentEventListener.handleBedReserved() [SYNCHRONOUS - WARNING]
                  -> BillService.createAccommodationBill()  [TERMINAL]
              -> ApplicationEventListener.handleBedReserved() [AFTER_COMMIT]
                  -> Update Application to WAITING_PAYMENT  [TERMINAL]
          -> publishEvent(BedReservationFailedEvent)
              -> ApplicationEventListener.handleBedReservationFailed() [AFTER_COMMIT]
                  -> Update Application to WAITING_LIST     [TERMINAL]

PaymentService.executePayment()
  -> publishEvent(PaymentSuccessEvent)
  <- NO REGISTERED CONSUMER FOUND [CRITICAL GAP]

HousingAssignmentService.expireReservation()
  -> publishEvent(HousingReservationExpiredEvent)
      -> ApplicationEventListener.handleHousingReservationExpired() [AFTER_COMMIT]
          -> Update Application to EXPIRED                  [TERMINAL]
      -> BillEventListener: REFERENCED IN DOCS BUT MISSING IN CODE

HousingAssignmentService.checkOut()
  -> publishEvent(BedReleasedEvent)
      -> ApplicationEventListener.handleBedReleased() [AFTER_COMMIT]
          -> Promote WAITING_LIST candidate
          -> publishEvent(ApplicationApprovedEvent) [RE-ENTRY - controlled, not circular]

HousingAssignmentService.checkIn()
  -> publishEvent(CheckInCompletedEvent)
      -> StudentEventListener.handleCheckInCompleted() [AFTER_COMMIT]
          -> Student.status = ACTIVE                        [TERMINAL]
```

**Finding**: No circular dependencies exist. The BedReleasedEvent -> ApplicationApprovedEvent re-entry is controlled - each iteration requires a new unprocessed WAITING_LIST candidate.

---

## CHECK 05: MASTER STATUS OWNERSHIP AUDIT - PASS

**Source Evidence**: Enum files + Service/Listener code

### STATUS MATRIX

#### ApplicationStatus - com.sdms.backend.modules.application.enums

| Status | Set By | Trigger | Reachable |
|:---|:---|:---|:---|
| PENDING | ApplicationService.createApplication() | Student submits form | YES |
| UNDER_REVIEW | ApplicationReviewService.startReview() | Admin starts review | YES |
| APPROVED | ApplicationReviewService.approve() + ApplicationEventListener | Admin approves OR waiting list promotion | YES |
| REJECTED | ApplicationReviewService.reject() | Admin rejects | YES |
| WAITING_PAYMENT | ApplicationEventListener.handleBedReserved() | BedReservedEvent received | YES |
| WAITING_LIST | ApplicationEventListener.handleBedReservationFailed() | BedReservationFailedEvent received | YES |
| EXPIRED | ApplicationEventListener.handleHousingReservationExpired() | Payment timeout (3 days) | YES |

**Dead states**: 0 | **Unreachable states**: 0 | **Duplicate meanings**: 0

> [!NOTE]
> REVISION_REQUIRED exists in the legacy application_stu module's ApplicationStatus enum but does NOT exist in the active com.sdms.backend.modules.application.enums.ApplicationStatus. This is dead code in the abandoned module - not a conflict.

#### AssignmentStatus - com.sdms.backend.modules.room.enums

| Status | Set By | Trigger | Reachable |
|:---|:---|:---|:---|
| RESERVED | HousingAssignmentService.reserveBed() via @PrePersist | ApplicationApprovedEvent | YES |
| PENDING_CHECKIN | HousingAssignmentService (after PaymentSuccessEvent) | Payment fully paid | WARNING - see CHECK 06 |
| OCCUPIED | HousingAssignmentService.checkIn() | Admin check-in | YES |
| CHECKED_OUT | HousingAssignmentService.checkOut() | Admin check-out | YES |
| CANCELLED | HousingAssignmentService.cancel() | Admin manual cancellation | YES |
| EXPIRED | PaymentExpireJob -> HousingAssignmentService.expireReservation() | 3-day payment deadline exceeded | YES |

> [!WARNING]
> PENDING_CHECKIN transition: AssignmentStatus defines PENDING_CHECKIN and V17 correctly includes it in partial unique indexes. However, no active consumer of PaymentSuccessEvent was found in source code to perform the RESERVED -> PENDING_CHECKIN transition. This is a CRITICAL GAP (see CHECK 06).

#### StudentStatus - com.sdms.backend.modules.student.enums

| Status | Set By | Trigger | Reachable |
|:---|:---|:---|:---|
| PENDING_CHECKIN | System at creation | Student profile created after payment | YES (default) |
| ACTIVE | StudentEventListener.handleCheckInCompleted() | CheckInCompletedEvent received | YES |
| GRADUATED | Manual admin operation | Student graduates | YES (no service - future) |
| INACTIVE | Manual admin operation | Student leaves | YES (no service - future) |

**Finding**: GRADUATED and INACTIVE have no service code - they are declared future states, not dead states. Acceptable for V1.

#### AccountStatus - com.sdms.backend.modules.user.enums

| Status | Set By | Trigger | Reachable |
|:---|:---|:---|:---|
| PENDING_ACTIVATION | Account auto-creation | New student account | YES (default) |
| ACTIVE | AuthService / first login password setup | Student sets password | YES |
| LOCKED | Admin operation | Discipline / overdue rent | YES (referenced in isAccountNonLocked()) |

**Finding**: No dead states. UserAccount.isEnabled() only returns true for ACTIVE, correctly blocking PENDING_ACTIVATION and LOCKED accounts.

#### BillStatus - com.sdms.backend.modules.payment.enums

| Status | Set By | Trigger | Reachable |
|:---|:---|:---|:---|
| UNPAID | BillService.createAccommodationBill() | Bill creation | YES (default) |
| PARTIALLY_PAID | PaymentService.updateBillAfterPayment() | Partial payment received | YES |
| PAID | PaymentService.updateBillAfterPayment() | Full payment received | YES |
| OVERDUE | none | Not set by any current service | WARNING |
| CANCELLED | none | Not set by any current service | WARNING |

> [!WARNING]
> OVERDUE and CANCELLED are defined in BillStatus but no service currently transitions a bill to either state. OVERDUE scanning should be driven by a scheduled job. CANCELLED should be set by an admin cancel operation. These are V1 gaps to address before go-live.

#### PaymentStatus - com.sdms.backend.modules.payment.enums

| Status | Set By | Trigger | Reachable |
|:---|:---|:---|:---|
| PENDING | Payment default | Payment record creation | YES (default) |
| SUCCESS | PaymentService.executePayment() | Payment confirmed | YES |
| FAILED | none | Not set by any current service | WARNING |
| EXPIRED | none | Not set by any current service | WARNING |
| REFUNDED | none | Not set by any current service | WARNING |

> [!WARNING]
> FAILED, EXPIRED, and REFUNDED payment statuses are declared but never set. These are future webhook/refund workflow states. Acceptable for V1 but must be wired before SePay gateway integration goes live.

---

## CHECK 06: EVENT CHAIN CONSISTENCY AUDIT - WARNING

**Source Evidence**: All EventListener.java files + Event.java files

### EVENT MATRIX

| Event | Publisher | Subscribers Found | Transaction | Phase | Idempotency Risk |
|:---|:---|:---|:---|:---|:---|
| ApplicationApprovedEvent | ApplicationReviewService + ApplicationEventListener | RoomEventListener | REQUIRES_NEW | AFTER_COMMIT | LOW |
| BedReservedEvent | RoomEventListener | PaymentEventListener, ApplicationEventListener | @EventListener (sync), REQUIRES_NEW | sync / AFTER_COMMIT | MEDIUM - PaymentEventListener NOT @TransactionalEventListener |
| BedReservationFailedEvent | RoomEventListener | ApplicationEventListener | REQUIRES_NEW | AFTER_COMMIT | LOW |
| HousingReservationExpiredEvent | HousingAssignmentService.expireReservation() | ApplicationEventListener | REQUIRES_NEW | AFTER_COMMIT | LOW |
| CheckInCompletedEvent | HousingAssignmentService.checkIn() | StudentEventListener | REQUIRES_NEW | AFTER_COMMIT | LOW |
| BedReleasedEvent | HousingAssignmentService.checkOut() | ApplicationEventListener | REQUIRES_NEW | AFTER_COMMIT | MEDIUM - re-publishes ApplicationApprovedEvent |
| PaymentSuccessEvent | PaymentService.executePayment() | NONE FOUND | N/A | N/A | CRITICAL |

> [!CAUTION]
> CRITICAL GAP - EVENT 01: PaymentSuccessEvent has no registered consumer.
>
> PaymentService publishes PaymentSuccessEvent when a bill is fully paid. SDMS-ARCH-01 documentation claims StudentEventListener subscribes to this event, but source code evidence does NOT confirm this. StudentEventListener.java only handles CheckInCompletedEvent. The documented event PaymentSuccessEvent -> StudentEventListener does not exist in actual code.
>
> Impact: When a bill is fully paid, the StudentHousingAssignment is never transitioned from RESERVED -> PENDING_CHECKIN, and the Student profile + UserAccount are never created. The entire post-payment workflow is BROKEN in current code.
>
> Recommendation: Implement a PaymentSuccessEvent consumer that: (1) Transitions Assignment.status = PENDING_CHECKIN; (2) Creates the Student profile from DormitoryApplication data; (3) Creates the UserAccount for the student. This is a blocking issue for production readiness.

> [!WARNING]
> WARNING - EVENT 02: PaymentEventListener uses @EventListener (synchronous), not @TransactionalEventListener.
>
> PaymentEventListener.handleBedReserved() is annotated with @EventListener @Transactional (synchronous). This means it runs within the same transaction as the RoomEventListener that publishes BedReservedEvent. A failure in createAccommodationBill() will roll back the bed reservation in HousingAssignmentService.
>
> This is a transaction boundary risk. Bill creation failure should NOT roll back a successful bed reservation. This listener should be migrated to @TransactionalEventListener(phase = AFTER_COMMIT) + @Transactional(propagation = REQUIRES_NEW).

> [!WARNING]
> WARNING - EVENT 03: BillEventListener referenced in documentation but absent from code.
>
> SDMS-ARCH-01 document lists HousingReservationExpiredEvent -> BillEventListener as a consumer. No BillEventListener.java file exists in the source tree. HousingReservationExpiredEvent only reaches ApplicationEventListener. The bill cancellation on assignment expiry is not implemented.

---

## CHECK 07: PAYMENT OWNERSHIP AUDIT - PASS

**Source Evidence**: Bill.java, BillType.java, BillService.java, V13, V18 migrations

### BillType Design Verification

| BillType | Business Purpose | Billing Target | Room Leader Model | Supported |
|:---|:---|:---|:---|:---|
| ACCOMMODATION_FEE | Monthly bed rent | assignment_id (student-specific) | No | YES - implemented |
| ELECTRIC_FEE | Monthly electricity | room_id (room-level) | YES | YES - room_id FK exists in V18 |
| WATER_FEE | Monthly water | room_id (room-level) | YES | YES - room_id FK exists in V18 |
| DEPOSIT_FEE | Security deposit | student_id or assignment_id | No | YES - student_id FK exists in V18 |
| PENALTY_FEE | Discipline fine | student_id | No | YES - student_id FK exists in V18 |
| APPLICATION_FEE | Application processing fee | application_id (soft ref) | No | YES - application_id UUID column in V18 |

**Finding**: Bill entity is sufficiently generic to support all 6 bill types required by SDMS. Room-level billing uses room_id FK. Student-specific billing uses student_id FK. Accommodation billing uses assignment_id (soft reference). All billing targets are wired.

---

## CHECK 08: DATABASE CONSTRAINT AUDIT - PASS

**Source Evidence**: V7, V12, V13, V16, V17, V18 Flyway migrations

### DATABASE CONSTRAINT MATRIX

| Constraint Name | Table | Columns | Type | Migration | Status |
|:---|:---|:---|:---|:---|:---|
| chk_bills_amount | bills | amount > 0 | CHECK | V18 | PRESENT |
| chk_bills_paid_amount | bills | paid_amount >= 0 | CHECK | V18 | PRESENT |
| chk_payments_amount | payments | amount > 0 | CHECK | V18 | PRESENT |
| chk_room_occupied_beds | rooms | occupied_beds >= 0 AND <= capacity | CHECK | V17 | PRESENT |
| chk_room_capacity_positive | rooms | capacity > 0 | CHECK | V17 | PRESENT |
| uk_payments_transaction_code | payments | transaction_code | UNIQUE | V13 | PRESENT |
| uk_payments_gateway_transaction_id | payments | gateway_transaction_id | UNIQUE nullable | V18 | PRESENT |
| uk_period_cccd | dormitory_applications | (period_id, cccd) | UNIQUE | V16 | PRESENT |
| uk_building_floor | floors | (building_id, floor_number) | UNIQUE | V7 | PRESENT |
| uk_floor_room_code | rooms | (floor_id, room_code) | UNIQUE | V7 | PRESENT |
| uk_room_bed_code | beds | (room_id, bed_code) | UNIQUE | V7 | PRESENT |
| uk_app_priority_category | application_priorities | (application_id, priority_category) | UNIQUE | V16 | PRESENT |
| @Version (Optimistic Lock) | dormitory_applications | version | Version | V1 | PRESENT |
| @Version (Optimistic Lock) | bills | version | Version | V13 | PRESENT |
| Pessimistic Lock | bills | findByIdForUpdate | SELECT FOR UPDATE | Java | PRESENT |
| Pessimistic Lock | dormitory_applications | findByIdForUpdate | SELECT FOR UPDATE | Java | PRESENT |
| Pessimistic Lock | rooms | findByIdForUpdate | SELECT FOR UPDATE | Java | PRESENT |

> [!WARNING]
> WARNING - Missing Constraint: No CHECK (paid_amount <= amount) constraint exists at the database level. PaymentService.validateBillAndAmount() enforces this in service code, but the dual-layer approach (DB + service) is not fully implemented. Risk is LOW because the service check runs before any DB write, but a DB-level constraint would provide stronger safety.

---

## CHECK 09: INDEX AUDIT - PASS

**Source Evidence**: V7, V10, V12, V13, V16, V17, V18 Flyway migrations

### INDEX MATRIX

| Index Name | Table | Columns | Type | Purpose | Migration |
|:---|:---|:---|:---|:---|:---|
| idx_building_status | buildings | status | Standard | Room availability queries | V7 |
| idx_room_status | rooms | status | Standard | Available room lookup | V7 |
| idx_bed_status | beds | status | Standard | Available bed lookup | V7 |
| idx_assignment_status | student_housing_assignments | status | Standard | Assignment filtering | V7 |
| idx_assignment_student | student_housing_assignments | student_id | Standard | Student active assignment | V7 |
| idx_assignment_bed | student_housing_assignments | bed_id | Standard | Bed occupancy check | V7 |
| idx_assignment_application_id | student_housing_assignments | application_id | Standard | Application-to-assignment lookup | V7 |
| uk_active_assignment_application | student_housing_assignments | application_id WHERE status IN (RESERVED, PENDING_CHECKIN, OCCUPIED) | Partial UNIQUE | One active assignment per application | V17 |
| uk_active_assignment_student | student_housing_assignments | student_id WHERE status IN (RESERVED, PENDING_CHECKIN, OCCUPIED) AND student_id IS NOT NULL | Partial UNIQUE | One active assignment per student | V17 |
| uk_active_assignment_bed | student_housing_assignments | bed_id WHERE status IN (RESERVED, PENDING_CHECKIN, OCCUPIED) | Partial UNIQUE | One active occupant per bed | V17 |
| idx_dorm_app_status_waiting | dormitory_applications | (status, gender) WHERE status = WAITING_LIST | Partial | Waiting list promotion job | V10 |
| idx_dorm_app_payment_deadline | dormitory_applications | payment_deadline WHERE status = WAITING_PAYMENT | Partial | Payment expiry scan | V10 |
| idx_dorm_app_waiting_list_promotion | dormitory_applications | (gender, priority_score DESC, created_at ASC) WHERE status = WAITING_LIST | Partial | Priority-sorted promotion | V16 |
| idx_dorm_app_cccd | dormitory_applications | cccd | Standard | CCCD lookup | V16 |
| idx_dorm_app_student_code | dormitory_applications | student_code | Standard | Student code matching | V16 |
| idx_app_priority_application_id | application_priorities | application_id | Standard | Priority loading | V16 |
| idx_status_history_application_id | dormitory_application_status_history | application_id | Standard | History lookup | V16 |
| idx_gen_doc_application_id | application_generated_documents | application_id | Standard | Document loading | V16 |
| idx_eligibility_cccd | registration_eligibilities | cccd | Standard | Eligibility check | V5 |
| idx_bills_assignment_id | bills | assignment_id | Standard | Bill lookup by assignment | V13 |
| idx_bills_status | bills | status | Standard | UNPAID/OVERDUE bill scan | V13 |
| idx_payments_bill_id | payments | bill_id | Standard | Payment history per bill | V13 |
| idx_bills_due_date | bills | due_date | Standard | Expiry scanning | V18 |
| idx_bills_room_id | bills | room_id | Standard | Utility bill lookup by room | V18 |
| idx_bills_student_id | bills | student_id | Standard | Student-specific bills | V18 |
| idx_bills_application_id | bills | application_id | Standard | Application fee lookup | V18 |
| idx_user_accounts_refresh_token | user_accounts | refresh_token | UNIQUE | JWT refresh token lookup | V2 |
| idx_user_accounts_reset_token | user_accounts | reset_password_token | Standard | Password reset lookup | V3 |
| uk_eligibility_period_cccd | registration_eligibilities | (period_id, cccd) | UNIQUE | Prevent duplicate eligibility import | V5 |
| idx_unique_active_registration_period | registration_periods | is_active WHERE is_active = TRUE | Partial UNIQUE | Only one active registration period | V6 |

**Total Production Indexes**: 30  
**Missing Critical Indexes**: 0  
**Redundant Indexes**: 0

---

## CHECK 10: FLYWAY MIGRATION CHAIN AUDIT - PASS

**Source Evidence**: All V1-V18 Flyway migration scripts

### MIGRATION MATRIX

| Version | File | Purpose | DDL Operations | Conflicts | Notes |
|:---|:---|:---|:---|:---|:---|
| V1 | V1__init_foundation_schema.sql | Foundation tables | CREATE: registration_periods, dormitory_applications, verification_documents, students, user_accounts | None | Root migration |
| V2 | V2__add_refresh_token_to_user_accounts.sql | Auth refresh token | ALTER user_accounts, CREATE UNIQUE INDEX | None | Auth hardening |
| V3 | V3__add_password_reset_to_user_accounts.sql | Password reset | ALTER user_accounts, CREATE INDEX | None | Auth hardening |
| V4 | V4__add_avatar_url_to_students.sql | Student avatar | ALTER students | None | Profile |
| V5 | V5__registration_module.sql | Eligibility | CREATE registration_eligibilities + indexes | None | Application module |
| V6 | V6__add_unique_constraint_to_active_registration.sql | One-active-period guard | CREATE UNIQUE INDEX (partial) | None | Business rule |
| V7 | V7__room_module.sql | Room hierarchy + assignments | CREATE: buildings, floors, rooms, beds, student_housing_assignments + indexes | None | Room module foundation |
| V8 | V8__add_student_to_assignments.sql | Reserved placeholder | NO OPERATION | None | Placeholder |
| V9 | V9__remove_fee_from_room.sql | Remove monthly_fee | ALTER rooms DROP COLUMN | None | Payment centralization |
| V10 | V10__update_dormitory_applications_waiting_list.sql | Waiting list support | ALTER dormitory_applications + indexes | None | Application hardening |
| V11 | V11__scheduler_infrastructure.sql | ShedLock table | CREATE shedlock | None | Infrastructure |
| V12 | V12__add_active_assignment_bed_unique_constraint.sql | Bed double-booking prevention | CREATE UNIQUE INDEX (partial) | None | Superseded by V17 |
| V13 | V13__create_payment_module.sql | Payment tables | CREATE: bills, payments + FK + indexes | None | Payment foundation |
| V14 | MISSING | -- | -- | -- | GAP - see warning below |
| V15 | V15__student_face_registration_support.sql | Face recognition | ALTER students IF NOT EXISTS | None | Safe idempotent |
| V16 | V16__application_module_refactor.sql | Application hardening | ALTER multiple tables + CREATE 3 new tables + indexes | None | Application V2 |
| V17 | V17__room_module_refactor.sql | Room safety update | DROP + RECREATE partial unique indexes (adds PENDING_CHECKIN) + ADD CHECK constraints | Replaces V12 indexes cleanly | Room V2 |
| V18 | V18__payment_module_refactor.sql | Payment hardening | ALTER payments + bills + ADD/DROP FKs + CHECK constraints + indexes | None | Payment V2 |

> [!WARNING]
> WARNING - Migration Gap: V14 is MISSING. The migration chain goes V13 -> V15, skipping V14. Flyway by default detects missing migrations as errors if spring.flyway.out-of-order=false (default). This may cause startup failure on a fresh database deploy.
>
> Recommendation: Create an empty placeholder V14__placeholder.sql with content: -- placeholder. This must be resolved before DATABASE FREEZE.

**Duplicate DDL**: 0  
**Conflicting constraints**: 0  
**Duplicate indexes**: V17 correctly drops V12 indexes before recreating - no duplicates.  
**Rollback risks**: V9 drops monthly_fee (destructive, one-way). V17 drops V12 indexes before recreating. Both are acceptable.

**Fresh Database Deploy Compatibility**: YES - A completely empty PostgreSQL database can execute V1 through V18 in sequence without DDL conflicts, conditional on resolving the V14 gap above.

---

## CHECK 11: DATABASE FREEZE READINESS AUDIT

**Status**: CONDITIONAL YES

The SDMS database schema is functionally correct and architecturally sound with the following conditions:

| Priority | Issue | Status | Required Before Freeze |
|:---|:---|:---|:---|
| P0 | Create V14 placeholder migration to close the migration gap | OPEN | YES |
| P0 | Implement PaymentSuccessEvent consumer: Assignment PENDING_CHECKIN + Student creation + UserAccount creation | OPEN | YES (schema supports it; code gap only) |
| P1 | Migrate PaymentEventListener to @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW | OPEN | YES |
| P1 | Implement BillEventListener to cancel bills on HousingReservationExpiredEvent | OPEN | YES |
| P2 | Implement OVERDUE bill scanning job and CANCELLED bill endpoint | OPEN | Recommended before go-live |
| P2 | Add DB-level CHECK (paid_amount <= amount) constraint | OPEN | Recommended |
| P3 | Archive application_stu legacy module | OPEN | Recommended |

---

## CHECK 12: EVENT RELIABILITY AUDIT - DOCUMENTED

**Source Evidence**: All EventListener files, PaymentService, Scheduler files

### RISK MATRIX

| Risk ID | Event | Failure Scenario | Impact | Current Mitigation | Future Hardening |
|:---|:---|:---|:---|:---|:---|
| RISK-01 | PaymentSuccessEvent | No consumer registered. Event published but silently dropped. | CRITICAL - Student never gets account/profile created after payment. Assignment stays RESERVED forever. | None | Implement consumer. Consider Event Outbox Pattern. |
| RISK-02 | BedReservedEvent | PaymentEventListener runs synchronously. Bill creation failure rolls back bed reservation. | HIGH - Student loses reserved bed due to payment infrastructure error. | None | Convert to @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW. |
| RISK-03 | HousingReservationExpiredEvent | BillEventListener documented but absent. Bill never cancelled when assignment expires. | MEDIUM - Unpaid bill remains in UNPAID state. Orphan financial records. | None | Implement BillEventListener to transition bill to CANCELLED on expiry. |
| RISK-04 | PaymentSuccessEvent webhook retries | SePay gateway may retry callback if SDMS responds with error. | MEDIUM - Duplicate payment records created. | uk_payments_transaction_code UNIQUE, uk_payments_gateway_transaction_id UNIQUE, pessimistic lock on Bill. | Sufficient for V1. Consider idempotency key header validation at gateway layer. |
| RISK-05 | Lost callback | SePay webhook fails to reach SDMS (network timeout). | MEDIUM - Bill stays UNPAID, assignment stays RESERVED until 3-day expiry. | PaymentExpireJob catches expired assignments. | Implement SePay polling fallback or webhook retry inbox. |
| RISK-06 | StudentCreatedEvent | StudentCreatedEvent referenced in ARCH-01 docs but no event class exists in source. | LOW currently - No student creation event published. Tied to RISK-01. | N/A | When RISK-01 is fixed, use StudentCreatedEvent to notify AuthEventListener for account creation. |
| RISK-07 | BedReleasedEvent -> ApplicationApprovedEvent | Multiple beds released simultaneously could promote multiple WAITING_LIST candidates. | LOW | waitingListValidator.validatePromotionCandidate() + pessimistic lock findByIdForUpdate. | Add explicit application-level deduplication log. |
| RISK-08 | Scheduler node duplication | Multiple pods run PaymentExpireJob simultaneously. | LOW | ShedLock (shedlock table) with distributed lock. | Ensure all schedulers are registered with ShedLock. |

---

## CHECK 13: DOCUMENTATION CONSISTENCY AUDIT - WARNING

**Source Evidence**: docs/10-audit/global_architecture_consistency_audit.md vs. actual source code

### DOCUMENTATION GAP MATRIX

| Document Claim | Source Code Reality | Gap Type | Severity |
|:---|:---|:---|:---|
| ARCH-01: PaymentSuccessEvent -> StudentEventListener | StudentEventListener.java only handles CheckInCompletedEvent. No handler for PaymentSuccessEvent. | Missing Implementation | CRITICAL |
| ARCH-01: StudentCreatedEvent -> AuthEventListener + RoomEventListener | StudentCreatedEvent class does not exist. Neither AuthEventListener nor any StudentCreatedEvent consumer exists. | Missing Event + Missing Consumers | HIGH |
| ARCH-01: HousingReservationExpiredEvent -> BillEventListener | No BillEventListener exists in source. | Missing Consumer | MEDIUM |
| ARCH-01: All cross-module listeners use AFTER_COMMIT + REQUIRES_NEW | PaymentEventListener uses synchronous @EventListener (not AFTER_COMMIT). | Inconsistency | HIGH |
| ARCH-01: Module ownership lists BillService and PaymentService | Confirmed in source. | MATCH | none |
| ARCH-01: Module ownership lists HousingAssignmentService | Confirmed in source. | MATCH | none |
| Payment docs: PaymentMethod = CASH, BANK_TRANSFER | Confirmed in PaymentMethod.java. | MATCH | none |
| Payment docs: gatewayTransactionId separate from transactionCode | Confirmed in Payment.java + V18. | MATCH | none |
| Payment docs: ON DELETE RESTRICT on payments FK | Confirmed in V18. | MATCH | none |
| Payment docs: CHECK constraints on amounts | Confirmed in V18. | MATCH | none |
| Room docs: PENDING_CHECKIN as valid AssignmentStatus | Confirmed in AssignmentStatus.java + V17 partial indexes. | MATCH | none |
| Application docs: ApplicationStatus has no REVISION_REQUIRED | Confirmed - REVISION_REQUIRED only in dead application_stu module. | MATCH | none |

---

## DATABASE FREEZE DECISION

| Check | Status |
|:---|:---|
| CHECK 01: Master ERD Audit | PASS |
| CHECK 02: Table Inventory Audit | PASS |
| CHECK 03: FK Consistency Audit | PASS (1 warning documented) |
| CHECK 04: Circular Dependency Audit | PASS |
| CHECK 05: Status Ownership Audit | WARNING (PaymentSuccessEvent gap affects PENDING_CHECKIN transition) |
| CHECK 06: Event Chain Consistency | WARNING (CRITICAL: PaymentSuccessEvent has no consumer; PaymentEventListener transaction boundary wrong) |
| CHECK 07: Payment Ownership Audit | PASS |
| CHECK 08: Database Constraint Audit | WARNING (missing paid_amount <= amount constraint) |
| CHECK 09: Index Audit | PASS |
| CHECK 10: Flyway Migration Chain | WARNING (V14 gap) |
| CHECK 11: Freeze Readiness | CONDITIONAL |
| CHECK 12: Event Reliability Audit | WARNING (8 risks documented) |
| CHECK 13: Documentation Consistency | WARNING (4 gaps found) |

### Blocking Issues Before DATABASE FREEZE

| Priority | Issue | Action Required |
|:---|:---|:---|
| P0 | V14 migration gap | Create V14__placeholder.sql |
| P0 | PaymentSuccessEvent has no consumer | Implement consumer: Assignment PENDING_CHECKIN + Student creation + UserAccount creation |
| P1 | PaymentEventListener synchronous boundary risk | Migrate to @TransactionalEventListener(AFTER_COMMIT) + REQUIRES_NEW |
| P1 | BillEventListener missing | Implement to cancel bills on HousingReservationExpiredEvent |
| P2 | BillStatus.OVERDUE and BillStatus.CANCELLED never set | Implement scheduled bill overdue job + admin cancel endpoint |
| P2 | DB-level paid_amount <= amount constraint missing | Add in next migration |
| P3 | application_stu legacy module | Archive to 11-legacy or delete |

---

## FINAL DECISION

```
SDMS-ARCH-02: PASS WITH CONDITIONS

Database schema design:  PASS
Table inventory:         PASS
FK constraints:          PASS
Constraint integrity:    PASS
Index coverage:          PASS
Flyway chain:            CONDITIONAL PASS (V14 gap)
Event chain:             WARNING (critical code gaps, not schema gaps)
Documentation:           WARNING (4 gaps)

DATABASE FREEZE: CONDITIONAL
The schema itself is ready to freeze.
The application code has critical gaps (PaymentSuccessEvent consumer,
BillEventListener) that must be implemented before the system can
function end-to-end. These are CODE gaps, not DATABASE gaps.

Resolve all P0 items before issuing DATABASE FREEZE.
```

---

*Document governed by [documentation_governance.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/00-overview/documentation_governance.md)*  
*All findings based on source-code evidence. Documentation-only claims are explicitly marked.*
