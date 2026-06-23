# SDMS Payment Boundary Preservation & Bill Ownership Refactor Audit

**Technical Role**: Lead Domain Architect | Lead Systems Architect  
**Status**: **PASS**  
**Audit Date**: 2026-06-21  

---

## 1. Boundary Leak & Bounded Context Analysis

### 1.1 The Violating Pattern (Option A)
Referencing `Room` and `Student` full JPA entity classes directly inside the `Bill` entity (via `@ManyToOne` mapping annotations) creates a severe Bounded Context leak at the ORM/JPA and codebase levels:
* **High Compile-Time Coupling**: Changes to entities inside the Student/Room modules propagate compile errors directly into the Payment module.
* **Traversal Leaks**: Allows query traversal (e.g. `bill.getRoom().getRoomCode()`), bypassing domain boundaries and modular query channels.
* **Serialization Hazards**: Risks circular references and loading bloat (fetching large object graphs in transaction contexts).

### 1.2 Bounded Context Boundary Verdict: PASS (After Refactoring to Option B)
By replacing full entity mappings with raw `UUID` identifiers, we achieve strict source code decoupling. The Payment module compiles independently and operates solely on local ID references.

---

## 2. Decoupled Reference Strategy (Option B vs Option A)

We evaluated the two reference strategies:

| Strategy | DDD Compliance | Database Integrity | Codebase Coupling | N+1 / Query Performance |
| :--- | :--- | :--- | :--- | :--- |
| **Option A** (`@ManyToOne` Objects) | Low (Context Leak) | High (DB Keys) | High (Tightly Coupled) | Poor (Object Loading Bloat) |
| **Option B** (`UUID` Identifiers) | **High (Strict Isolation)** | **High (Using DB constraints)** | **None (Source Isolated)** | **Excellent (Lightweight loads)** |

### Recommended Reference Architecture: Option B + Database Keys
We recommend storing plain UUID fields in the Java ORM (`UUID roomId`, `UUID studentId`, `UUID assignmentId`, `UUID applicationId`) to keep the codebase clean and isolated. Concurrently, we retain database-level foreign key constraints (`CONSTRAINT fk_bills_room`) to ensure referential safety at the SQL layer.

---

## 3. Utility & Fee Support Validation

All billing use cases are fully supported without entity relationships:
* **Accommodation Fees**: Linked via `assignmentId` and `applicationId`. Paid upon matching target IDs in callbacks.
* **Electricity & Water Fees**: Linked to rooms via `roomId` and room leaders via `studentId`. Calculated by ID, paid via webhook description mapping.
* **Deposits & Penalties**: Linked to students via `studentId`.

---

## 4. Code & Flyway Impact Summary

The following changes have been checked in and validated:

1. **JPA Entity Decoupling ([Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java))**:
   Removed entity imports and replaced `@ManyToOne` fields with plain columns:
   ```java
   private UUID assignmentId;
   private UUID applicationId;
   private UUID roomId;
   private UUID studentId;
   ```
2. **Decoupled Service Logic ([PaymentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java))**:
   Removed dependency on `StudentHousingAssignment` class, publishing event attributes directly:
   ```java
   eventPublisher.publishEvent(new PaymentSuccessEvent(
       this, bill.getBillId(), bill.getAssignmentId(), bill.getApplicationId()
   ));
   ```
3. **Decoupled Event Listening ([PaymentEventListener.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/event/PaymentEventListener.java))**:
   Directly forwards plain IDs without querying the Room module's repositories.
4. **Flyway Migration Update ([V18__payment_module_refactor.sql](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/resources/db/migration/V18__payment_module_refactor.sql))**:
   Added `application_id UUID NULL` column and index alongside other generic targets.
