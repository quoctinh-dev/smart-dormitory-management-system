# SDMS Bill Ownership & Utility Billing Design Audit

**Technical Role**: Lead Domain Architect | Lead Database Architect  
**Status**: **PASS**  
**Audit Date**: 2026-06-21  

---

## 1. Domain Generalization Strategy

To support the complete SDMS financial ecosystem, the `Bill` entity must be able to target different business entities:
* **Accommodation Fees**: Linked to a specific resident's `StudentHousingAssignment` (owned by Room module).
* **Electricity & Water Fees**: Linked to a specific `Room` (owned by Room module), paid by the room leader.
* **Deposits & Disciplinary Fines**: Linked directly to a `Student` profile (owned by Student module).

### 1.1 Direct Explicit Nullable Foreign Keys (Chosen Strategy)
Rather than using generic polymorphic references (`targetType` + `targetId`), which would destroy database-level referential integrity and make JPA mappings complex, we implement direct explicit nullable foreign keys in the `bills` table:
* `assignment_id` (UUID, NULL) -> references `student_housing_assignments(assignment_id)`
* `room_id` (UUID, NULL) -> references `rooms(room_id)`
* `student_id` (UUID, NULL) -> references `students(student_id)`

#### Pros:
* Preserves strict database-level referential constraints (`FOREIGN KEY ... ON DELETE RESTRICT`).
* Highly performant; utilizes native SQL indexing.
* Standard JPA `@ManyToOne` lazy associations.
* Simple, explicit, and easy to inspect.

#### Cons:
* Adds two nullable columns to the `bills` table, which is an extremely low overhead.

---

## 2. Bill Type Matrix

Frozen billing types in [BillType.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillType.java):
1. **`APPLICATION_FEE`**: Submitting dormitory request processing fee (optional).
2. **`ACCOMMODATION_FEE`**: Base bed rent charge. Linked to `assignment_id`.
3. **`ELECTRIC_FEE`**: Room-level electric utility bill. Linked to `room_id` and `student_id` (room leader).
4. **`WATER_FEE`**: Room-level water utility bill (initially free, ready for future charging policies). Linked to `room_id`.
5. **`DEPOSIT_FEE`**: Refundable room key/amenity deposit. Linked to `student_id` / `assignment_id`.
6. **`PENALTY_FEE`**: Administrative fines for rule violations or room damage. Linked to `student_id`.

---

## 3. Specific Billing Designs

### 3.1 Electricity Billing
* **Workflow**:
  1. Dormitory staff reads the physical meter monthly and inputs the current reading into the system.
  2. The system calculates usage: $Consumption = Current - Previous$.
  3. The system calculates the charge based on the electric unit rate and generates a `Bill(billType=ELECTRIC_FEE, room_id=ROOM_ID)`.
  4. The bill is assigned to the Room Leader (`student_id=LEADER_STUDENT_ID`) as the primary payer.
  5. Room leader completes payment via bank transfer.

### 3.2 Water Billing
* **Workflow**: Currently free. The database schema is fully future-ready: if water charges are introduced, the system simply creates `Bill(billType=WATER_FEE, room_id=ROOM_ID)` records without requiring any database schema adjustments.

### 3.3 Deposit Billing
* **Workflow**:
  1. Upon successful reservation approval, a `DEPOSIT_FEE` bill is generated alongside the `ACCOMMODATION_FEE` bill.
  2. The student pays both bills prior to check-in.
  3. Upon check-out, staff conducts a room inspection. If no damages are found, a refund transaction is recorded in the ledger (`PaymentStatus.REFUNDED`).

### 3.4 Fine Billing
* **Workflow**: Dormitory admin reports a rule violation or property damage. The system generates a `PENALTY_FEE` bill linked directly to the student's profile ID (`student_id`).

---

## 4. Entity and Database Impact

The following updates have been physically checked in to the codebase to support this generalization:

### 4.1 JPA Entity Updates ([Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java))
```java
public class Bill extends BaseEntity {
    // ...
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id")
    private StudentHousingAssignment assignment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;
    // ...
}
```

### 4.2 Flyway Schema Updates ([V18__payment_module_refactor.sql](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/resources/db/migration/V18__payment_module_refactor.sql))
```sql
-- Add columns to support generic billing targets (room-level utilities & student-level penalties/deposits)
ALTER TABLE bills ADD COLUMN room_id UUID NULL;
ALTER TABLE bills ADD COLUMN student_id UUID NULL;

ALTER TABLE bills ADD CONSTRAINT fk_bills_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT;
ALTER TABLE bills ADD CONSTRAINT fk_bills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT;

CREATE INDEX idx_bills_room_id ON bills(room_id);
CREATE INDEX idx_bills_student_id ON bills(student_id);
```
