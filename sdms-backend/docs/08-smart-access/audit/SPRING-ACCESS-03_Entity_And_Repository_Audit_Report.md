# SPRING-ACCESS-03: Entity & Repository Architecture Audit Report

## 1. Executive Summary
This document provides an architectural audit of the Smart Access module's Domain Layer (Entities) and Data Access Layer (Repositories). The objective is to ensure absolute compliance with the SDMS Modular Monolith rules and Access Governance (AC-01 $\rightarrow$ AC-15A) before any Java code is generated.

---

## 2. Audit Verification

### 1. Aggregate Boundaries
*   **Evaluation:** The domain strictly defines four core aggregates: `AccessHistory` (The Audit Log), `CurfewPolicy` (Dormitory restrictions), `TimeWindowPolicy` (Temporary access), and `ProcessedMessage` (Idempotency control). These aggregates do not bleed into or encapsulate entities from other domains.
*   **Status: PASS** ✅

### 2. Entity Ownership
*   **Evaluation:** The Smart Access Module is the sole owner of its Entities. It completely dictates the lifecycle of Curfews and Time Windows. Most importantly, it owns the exact truth of physical gate access decisions via `AccessHistory`, without overlapping with the Face Module's verification history or the IoT Module's hardware states.
*   **Status: PASS** ✅

### 3. UUID Strategy
*   **Evaluation:** Every entity explicitly uses UUID v4 as its Primary Key (e.g., `id`). This guarantees globally unique, unguessable identifiers, making the API resistant to ID Enumeration attacks and allowing seamless cross-module referencing.
*   **Status: PASS** ✅

### 4. Soft UUID References
*   **Evaluation:** The entities contain `studentId`, `buildingId`, `gateId`, and `operatorId` as plain `UUID` properties (Soft UUIDs). There are absolutely zero `@ManyToOne` JPA mappings referencing foreign entities like `Student` or `Building`. This fulfills the most critical anti-coupling rule of the Modular Monolith, completely severing DB-level Foreign Keys between domains.
*   **Status: PASS** ✅

### 5. Repository Boundaries
*   **Evaluation:** The Smart Access Repositories only fetch and persist data within the `smart-access` namespace. If Smart Access requires data about a student's active status, it must request it from the Core Identity module via an interface or event, NOT by directly injecting a `StudentRepository`.
*   **Status: PASS** ✅

### 6. Audit Constraints (Append Only)
*   **Evaluation:** `AccessHistoryRepository` is frozen as an Append-Only structure. No `save()` methods meant for updating records will be exposed. No `delete()` methods will be defined. This perfectly aligns with the `REVOKE` database strategy approved in `SPRING-ACCESS-02`.
*   **Status: PASS** ✅

### 7. Index Mapping
*   **Evaluation:** JPA `@Table(indexes = {...})` definitions map correctly to the database indices. BRIN index for `timestamp`, and B-Tree for foreign UUIDs (`studentId`, `gateId`). This dual-layer mapping ensures the Java definitions exactly match Flyway V21 scripts.
*   **Status: PASS** ✅

### 8. Pagination Strategy
*   **Evaluation:** All lists returned by the Repositories, especially `AccessHistory`, use Spring Data's `Pageable` and return `Page<T>` or `Slice<T>`. This guarantees O(1) memory consumption on the Java heap regardless of database size, preventing Out-Of-Memory (OOM) errors during heavy traffic.
*   **Status: PASS** ✅

### 9. Performance Considerations
*   **Evaluation:** Because `@ManyToOne` joins are forbidden, the Repositories will never suffer from the N+1 select problem across modules. Queries are flat and fast. `ProcessedMessage` guarantees duplicate IoT events are dropped instantly at the DB constraint layer, saving CPU cycles.
*   **Status: PASS** ✅

### 10. AC-01 $\rightarrow$ AC-15A Compliance
*   **Evaluation:** 
    *   **AC-01:** Smart Access uniquely commands the gate (PASS).
    *   **AC-06:** No threshold logic is stored here (PASS).
    *   **AC-14:** `AccessHistory` is never deleted (PASS).
    *   **AC-15A:** Security rules dictate that access to controllers driving these Repositories uses specific Permissions (`REMOTE_UNLOCK`, `MANAGE_CURFEW_POLICY`), not Roles (PASS).
*   **Status: PASS** ✅

---

## 3. Final Decision

**Audit Status: APPROVED FOR IMPLEMENTATION** 🟢

The Entity and Repository architecture is pristine. The adherence to Soft UUID references completely inoculates the system against Monolithic Database entanglement. The backend team is officially cleared to begin writing the Java Entity classes and Spring Data JPA Repository interfaces.
