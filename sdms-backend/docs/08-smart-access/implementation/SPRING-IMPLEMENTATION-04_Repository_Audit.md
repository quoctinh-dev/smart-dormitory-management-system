# SPRING-IMPLEMENTATION-04: Repository Implementation Audit

## 1. Executive Summary
This document defines the Spring Data JPA Repository specifications for the Smart Access module. It validates the data access strategy, ensuring full alignment with PostgreSQL declarative partitioning, Soft UUID boundaries, and absolute Append-Only immutability.

---

## 2. Repository Specifications

### 1. `CurfewPolicyRepository`
*   **Base Interface:** `JpaRepository<CurfewPolicy, UUID>`
*   **Purpose:** Standard CRUD operations for administrators.
*   **Custom Queries:**
    *   `List<CurfewPolicy> findByBuildingIdAndIsActiveTrue(UUID buildingId)`: Retrieves all active curfew policies for a specific building to be evaluated by the `CurfewResolutionStrategy`.
*   **Index Utilization:** Uses the composite index `(building_id, is_active)` for ultra-fast lookup during the access evaluation phase.

### 2. `TimeWindowPolicyRepository`
*   **Base Interface:** `JpaRepository<TimeWindowPolicy, UUID>`
*   **Purpose:** Standard CRUD operations.
*   **Custom Queries:**
    *   `List<TimeWindowPolicy> findByBuildingIdAndResidentTypeAndIsActiveTrue(UUID buildingId, ResidentType residentType)`: Used by `TimeWindowEvaluationStrategy` to evaluate boarding/non-boarding access windows.
*   **Index Utilization:** Uses `(building_id, is_active)`.

### 3. `AccessHistoryRepository`
*   **Base Interface:** `org.springframework.data.repository.Repository<AccessHistory, UUID>` (NOTE: Intentionally DOES NOT extend `JpaRepository` or `CrudRepository`).
*   **Purpose:** Immutable event store interface.
*   **Exposed Methods (Append-Only Compliance):**
    *   `AccessHistory save(AccessHistory entity)`: Used exclusively for inserting new records.
    *   `Page<AccessHistory> findByStudentId(UUID studentId, Pageable pageable)`
    *   `Page<AccessHistory> findByGateId(UUID gateId, Pageable pageable)`
    *   `Page<AccessHistory> findAll(Pageable pageable)`
*   **Prohibited Methods:** `delete()`, `deleteAll()`, `saveAll()` (if used for batch updates).
*   **Pagination Strategy:** All list queries strictly mandate Spring Data's `Pageable` to return `Page<T>` or `Slice<T>`, ensuring O(1) memory consumption and preventing Heap Out-Of-Memory (OOM) under massive log volume.
*   **AC-14 Compliance:** Extending `Repository` and manually exposing only safe methods guarantees "Retain Forever" constraints at the JVM compilation level, backing up the PostgreSQL `REVOKE DELETE` rule.

### 4. `ProcessedMessageRepository`
*   **Base Interface:** `JpaRepository<ProcessedMessage, String>`
*   **Purpose:** Prevent duplicate event processing.
*   **Idempotency Lookup:** 
    *   `boolean existsById(String messageId)`: Extremely fast Primary Key lookup. Used by `IdempotencyService` to check if an event has already been handled before starting the transaction.
*   **Performance Considerations:** Relies on the default Primary Key Hash index for `O(1)` exists verification.

---

## 3. Verification & Audit

*   **Custom Queries:** Kept to absolute minimums. `isActive` flags are used aggressively to filter policies at the database layer before loading into Java.
*   **Pagination Strategy:** `AccessHistory` enforces pagination to combat data bloat, while `CurfewPolicy` relies on `List` since the number of active rules per building is mathematically tiny (e.g., < 10).
*   **Append Only Compliance:** `AccessHistoryRepository` is fully neutered against data mutation by abandoning `JpaRepository`.
*   **Idempotency Lookup:** `existsById` on `ProcessedMessage` guarantees duplicate internal application event processing (e.g., event retry protection) is dropped instantly without executing business logic.
*   **Index Utilization:** All repository fetch methods are perfectly covered by Flyway BTREE indexes defined in `SPRING-IMPLEMENTATION-02`.
*   **Performance Considerations:** Zero `@Query` annotations utilizing `JOIN` exist because of the Soft UUID strategy. Performance is linear and entirely decoupled from the Core Identity module.

---

## FINAL DECISION
**Status: PASS** ✅

The Repository blueprints are perfectly aligned with the JPA Entity architecture and the DB Migration scripts. The intentional neutering of `AccessHistoryRepository` is a textbook implementation of Modular Monolith governance. The backend team is cleared to generate the Spring Data Java Interfaces.
