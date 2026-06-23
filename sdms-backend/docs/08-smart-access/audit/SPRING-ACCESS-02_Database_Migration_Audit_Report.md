# SPRING-ACCESS-02: Database Migration Architecture Audit Report

## 1. Executive Summary
This document provides a comprehensive architectural audit of the Smart Access Database Migration Strategy. The objective is to validate the integrity, performance, and cross-module decoupling of the `V21` Flyway scripts before SQL implementation begins.

---

## 2. Audit Verification

### 1. Migration Ordering
*   **Evaluation:** The sequence `V21_01` (Enums) $\rightarrow$ `V21_02` (Curfew) $\rightarrow$ `V21_03` (Time Window) $\rightarrow$ `V21_04` (Access History) $\rightarrow$ `V21_05` (Processed Messages) perfectly respects dependency resolution (e.g., Enums must exist before tables). Using `V21` cleanly isolates this module from Identity (`V10`) and Face Module (`V20`).
*   **Status: PASS** ✅

### 2. PostgreSQL Enum Strategy
*   **Evaluation:** Utilizing native PostgreSQL `CREATE TYPE ... AS ENUM` over plain `VARCHAR` columns guarantees strict data integrity at the database level and significantly reduces storage footprint for massive tables like `access_history`.
*   **Status: PASS** ✅

### 3. Partition Strategy
*   **Evaluation:** `access_history` is configured to use declarative partitioning `PARTITION BY RANGE (timestamp)` with Monthly boundaries. This prevents the table from becoming a monolithic bottleneck and allows old partitions to be dropped instantly without locking the database.
*   **Status: PASS** ✅

### 4. Index Strategy
*   **Evaluation:** 
    *   `timestamp`: Using a `BRIN` (Block Range Index) is optimal for append-only time-series data, offering massive space savings over B-Tree.
    *   `studentId`, `gateId`, `buildingId`: Standard `B-Tree` indexes.
    *   `decision`: A partial B-Tree index (e.g., `WHERE decision != 'GRANTED'`) could be considered for fast security auditing, but standard indexing is sufficient for V1.
*   **Status: PASS** ✅

### 5. FK Strategy (Foreign Keys)
*   **Evaluation:** Strict compliance with Modular Monolith rules. `access_history` stores `studentId` and `buildingId` as **Soft UUIDs** (Virtual Foreign Keys) rather than hard DB-level `FOREIGN KEY REFERENCES`. This guarantees that the Smart Access module is decoupled from the Core Identity and Facility schemas, preventing cross-module database locks.
*   **Status: PASS** ✅

### 6. Retention Strategy (AC-14 Compliance)
*   **Evaluation:** AC-14 strictly mandates that `AccessHistory` must be retained **Forever** (Never Delete). Monthly partitioning enables a scalable, zero-downtime **Cold Storage/Archive** strategy. Instead of dropping data, DevOps can easily detach and migrate historical partitions (e.g., `access_history_y2025m01`) from Hot Storage to cheaper Read-Only Archive Storage, maintaining 100% history without degrading active query performance.
*   **Status: PASS** ✅

### 7. ProcessedMessage Strategy (Idempotency)
*   **Evaluation:** Storing `messageId` (String) as the Primary Key for MQTT/IoT events ensures exact-once processing. If the network stutters and the IoT gate sends the same event twice, PostgreSQL will reject the second insert via `UniqueConstraintViolation`, securely blocking duplicate processing.
*   **Status: PASS** ✅

### 8. Delete Protection (Append-Only)
*   **Evaluation:** `access_history` must be an immutable audit log. Architecture mandates a simple, two-layered protection without over-engineering: 
    1. **Application Level:** Do not expose any delete/update APIs in the Controller or Repository (e.g., omit them completely).
    2. **Database Level:** Execute `REVOKE UPDATE, DELETE ON access_history FROM app_user;`. This guarantees protection without the complexity and performance overhead of DB triggers.
*   **Status: PASS** ✅

### 9. Performance Review
*   **Expected Scale:** 5,000 students $\times$ 4 gate interactions/day = 20,000 rows/day = 600,000 rows/month.
*   **Evaluation:** 600K rows per partition is extremely lightweight for PostgreSQL 17. The database will effortlessly sustain 24/7 gate traffic without index bloat, even on minimal CPU/RAM hardware.
*   **Status: PASS** ✅

---

## 3. Final Decision

**Audit Status: APPROVED FOR IMPLEMENTATION** 🟢

All database design vectors (Ordering, Constraints, Partitioning, Indexing, and Modularity) have been verified. The Architecture is mathematically sound, highly performant, and fully decoupled. The Backend team is cleared to generate the raw SQL scripts.
