# SDMS Database Architecture Decision Records (ADR)

**Technical Role**: Lead Database Architect  
**Status**: **FROZEN**  
**Last Updated**: 2026-06-21  

---

## ADR-001: Why Student duplicates Application data

**Context**: `DormitoryApplication` captures extensive personal info (Name, CCCD, Address) which is mirrored entirely into the `Student` table upon successful payment.  
**Problem**: Normalization rules generally discourage data duplication to avoid update anomalies.  
**Decision**: **Snapshot Preservation**.  
**Consequences**: Applications remain an immutable historical snapshot of what the user entered at that exact time. The `Student` entity becomes the live, editable profile.  
**Alternatives Rejected**: Creating a 1:1 view or strict normalization. Rejected because modifying a student's profile later would retroactively falsify their original application.

---

## ADR-002: Why `occupied_beds` exists

**Context**: The `rooms` table contains an `occupied_beds` integer column.  
**Problem**: The number of occupied beds can technically be calculated dynamically via `COUNT(*)` on `student_housing_assignments` where status is `OCCUPIED`.  
**Decision**: **Intentional Denormalization**.  
**Consequences**: Drastically improves performance for the administrative dashboard and real-time room availability checks. Requires strict transactional event listeners (using `PESSIMISTIC_WRITE` locks) to prevent drift.  
**Alternatives Rejected**: Real-time aggregation. Rejected due to the high volume of capacity checks slowing down the database during peak registration seasons.

---

## ADR-003: Why cross-domain FK remain

**Context**: The database features tight foreign keys (e.g., `user_accounts` pointing to `students`, `bills` pointing to `rooms`).  
**Problem**: Microservice purists advocate for zero shared databases and soft references (UUIDs without FKs) between modules.  
**Decision**: **Modular Monolith Optimization**.  
**Consequences**: Data integrity is enforced at the PostgreSQL layer. Complex joins are permitted for read models. Boundaries are enforced logically in the Java Application layer, not via physical network segregation.  
**Alternatives Rejected**: Physical microservices. Rejected because the overhead of distributed transactions outstrips the team's capacity for a graduation thesis project.

---

## ADR-004: Why UUID is used globally

**Context**: All primary keys (e.g., `application_id`, `student_id`) use `UUID` instead of auto-incrementing `BIGINT`.  
**Problem**: UUIDs incur a slight indexing penalty and take up more storage space.  
**Decision**: **Distributed-safe identity strategy**.  
**Consequences**: ID collisions are mathematically improbable. Allows client-side ID generation if needed. Eliminates sequential ID guessing attacks (Insecure Direct Object Reference).  
**Alternatives Rejected**: Auto-increment `BIGINT`. Rejected due to security risks (ID enumeration) and harder cross-system data migrations.

---

## ADR-005: Why Event-Driven Ownership is adopted

**Context**: Instead of `PaymentService` directly creating a `Student` and linking an `Assignment`, it simply emits a `PaymentSuccessEvent`.  
**Problem**: Direct service calls (`studentService.create(...)`) are easier to write and debug.  
**Decision**: **Bounded Context Isolation**.  
**Consequences**: A single transaction emits an event, and dedicated `@TransactionalEventListener` methods in the target modules execute the writes. Ensures modules can be developed and extended independently.  
**Alternatives Rejected**: Orchestration Service or direct repository injection. Rejected because it tightly couples the Payment module to Student and Room internal logic.

---

## ADR-006: Why obsolete migrations are preserved

**Context**: `V8` and `V14` are completely empty SQL scripts. `V12` creates an index that is subsequently dropped in `V17`.  
**Problem**: This creates a seemingly "messy" migration folder.  
**Decision**: **Flyway Immutability Principle**.  
**Consequences**: Once a migration is merged and executed in any environment, it is never altered. Mistakes are fixed by rolling forward. Ensures total parity between local, staging, and production databases.  
**Alternatives Rejected**: Rewriting past migrations. Rejected because modifying a past migration checksum breaks Flyway for developers who have already applied it.
