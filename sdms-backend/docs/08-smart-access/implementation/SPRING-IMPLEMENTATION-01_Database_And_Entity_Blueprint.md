# SPRING-IMPLEMENTATION-01: Database & Entity Generation Blueprint

## 1. Flyway Migration Inventory
The database schema will be strictly managed via Flyway, ordered under the `V21` namespace to ensure isolation from Core Identity (`V10`) and Face Module (`V20`).

*   `V21_01__create_smart_access_enums.sql`
*   `V21_02__create_curfew_policies_table.sql`
*   `V21_03__create_time_window_policies_table.sql`
*   `V21_04__create_access_history_table_partitioned.sql`
*   `V21_05__create_processed_messages_table.sql`

## 2. PostgreSQL Enum Definitions
Native database enums ensure robust data integrity at the lowest level.

*   `access_decision_enum`: `('GRANTED', 'DENIED', 'ERROR')`
*   `override_type_enum`: `('REMOTE_UNLOCK', 'FIRE_EMERGENCY', 'SECURITY_LOCKDOWN')`
*   `verification_method_enum`: `('FACE_AI', 'RFID', 'MANUAL_OVERRIDE', 'REMOTE_UNLOCK')`
*   `resident_type_enum`: `('BOARDING', 'NON_BOARDING')`
*   `curfew_type_enum`: `('STRICT', 'SOFT_WARNING')`

## 3. Table Definitions

### `curfew_policies`
*   `id`: UUID (Primary Key)
*   `building_id`: UUID (Soft Reference)
*   `resident_type`: `resident_type_enum`
*   `start_time`: TIME
*   `end_time`: TIME
*   `type`: `curfew_type_enum`
*   `is_active`: BOOLEAN

### `time_window_policies`
*   `id`: UUID (Primary Key)
*   `building_id`: UUID (Soft Reference)
*   `resident_type`: `resident_type_enum`
*   `valid_from`: TIMESTAMP
*   `valid_to`: TIMESTAMP
*   `is_active`: BOOLEAN

### `access_history`
*   `id`: UUID (Primary Key)
*   `student_id`: UUID (Soft Reference)
*   `gate_id`: UUID (Soft Reference)
*   `operator_id`: UUID (Nullable, Soft Reference for overrides)
*   `timestamp`: TIMESTAMP
*   `decision`: `access_decision_enum`
*   `denial_reason`: VARCHAR (Nullable)
*   `method`: `verification_method_enum`

### `processed_messages`
*   `message_id`: VARCHAR (Primary Key)
*   `processed_at`: TIMESTAMP
*   `source`: VARCHAR

## 4. Partition Strategy
The `access_history` table will be created as a declarative partitioned table:
*   `PARTITION BY RANGE (timestamp)`
*   DevOps/Flyway will dynamically generate monthly partitions (e.g., `access_history_y2025m01`).
*   This facilitates the AC-14 "Retain Forever" strategy by allowing old data to be cleanly detached to Cold Storage.

## 5. Entity Inventory
Java Entities will map exactly to the tables.
*   `CurfewPolicy.java` (Maps to `curfew_policies`)
*   `TimeWindowPolicy.java` (Maps to `time_window_policies`)
*   `AccessHistory.java` (Maps to `access_history`)
*   `ProcessedMessage.java` (Maps to `processed_messages`)

## 6. Repository Inventory
Spring Data JPA Repositories to be generated:
*   `CurfewPolicyRepository`: Supports CRUD (`save()`, `findById()`).
*   `TimeWindowPolicyRepository`: Supports CRUD.
*   `AccessHistoryRepository`: **Strictly Read & Insert Only.** Extends `Repository<T, ID>` (omitting `CrudRepository` `delete` methods).
*   `ProcessedMessageRepository`: Basic insert operations for idempotency.

## 7. Index Inventory
*   **B-Tree Indexes:**
    *   `curfew_policies`: `(building_id, is_active)`
    *   `time_window_policies`: `(target_id, is_active)`
    *   `access_history`: `(student_id)`, `(gate_id)`
*   **BRIN Index:**
    *   `access_history`: `(timestamp)` - Designed for massively scalable time-series ranges.

## 8. Audit Constraints
*   **Application Level:** `AccessHistoryRepository` will NOT expose `delete()`, `deleteAll()`, or updating `save()` methods.
*   **Database Level:** A Flyway script will explicitly `REVOKE DELETE ON access_history FROM CURRENT_USER;` for the application role. `UPDATE` is kept open for future archiving/data correction metadata, relying on application-level constraints to prevent tampering.

## 9. Soft UUID Reference Strategy
To strictly maintain the boundaries of the Modular Monolith:
*   Entities like `AccessHistory` and `CurfewPolicy` contain `UUID student_id` and `UUID building_id`.
*   There are **ZERO** Database `FOREIGN KEY REFERENCES` linking these tables to the `students` or `buildings` tables.
*   There are **ZERO** `@ManyToOne` or `@OneToMany` JPA annotations pointing to Entities outside the `smart-access` package.

## 10. Implementation Order
1.  **DB Migration Phase:** Write and execute `V21` Flyway SQL scripts to establish the schema.
2.  **Entity Mapping Phase:** Create Java Enums and JPA `@Entity` classes.
3.  **Repository Phase:** Define Spring Data interfaces, applying strict audit constraints to `AccessHistoryRepository`.
4.  **Validation Phase:** Write Spring Boot Integration Tests (Testcontainers) to prove partitioned table inserts and Idempotency constraint violations.

---

## FINAL DECISION
**Status:** **READY FOR CODING** 🟢

The specification perfectly translates the accumulated SDMS architecture logic into concrete database constructs and Java class skeletons. No ambiguities remain.
