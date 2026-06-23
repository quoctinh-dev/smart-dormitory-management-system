# SPRING-IMPLEMENTATION-03: JPA Entity Generation Audit

## 1. Executive Summary
This document outlines the blueprint for the Java JPA Entity layer of the Smart Access module. It serves as the bridge between the PostgreSQL schema (Flyway V21) and the Spring Boot Domain Layer, rigorously applying all prior governance fixes (Enum reductions, Time splits, Idempotency abstractions, and Rule priorities).

---

## 2. JPA Specifications

### 1. Enum Inventory
Java `enum` definitions map directly to PostgreSQL native enums using `@Enumerated(EnumType.STRING)` (or hypersistence-utils `@Type(PostgreSQLEnumType.class)` for native enum persistence).
*   `AccessDecision`: `GRANTED`, `DENIED`
*   `OverrideType`: `REMOTE_UNLOCK`, `FIRE_EMERGENCY`, `SECURITY_LOCKDOWN`
*   `VerificationMethod`: `FACE_AI`, `RFID`, `MANUAL_OVERRIDE`, `REMOTE_UNLOCK`
*   `ResidentType`: `BOARDING`, `NON_BOARDING`
*   `CurfewType`: `STRICT`, `SOFT_WARNING`

### 2. BaseEntity Mapping
To prevent boilerplate, non-partitioned entities (`CurfewPolicy`, `TimeWindowPolicy`) will extend a `@MappedSuperclass` for audit trails.
*   **Fields:**
    *   `createdAt` (LocalDateTime, `@CreatedDate`, updatable = false)
    *   `updatedAt` (LocalDateTime, `@LastModifiedDate`)
*   **Listener:** `@EntityListeners(AuditingEntityListener.class)`

### 3. UUID Strategy
*   All IDs are defined as `java.util.UUID`.
*   Auto-generation relies on Hibernate/JPA: `@Id @GeneratedValue(strategy = GenerationType.UUID)` or Postgres `gen_random_uuid()` defaults via `@Column(columnDefinition = "uuid default gen_random_uuid()")`.

### 4. Index Mapping
Hibernate `@Table` index definitions strictly mirror Flyway to ensure schema validation (`hibernate.hbm2ddl.auto=validate`) succeeds without warnings.

---

## 3. Entity Inventory

### `AccessHistory` Entity
*   **Table:** `@Table(name = "access_history", indexes = {@Index(columnList = "student_id"), @Index(columnList = "gate_id")})` (Note: BRIN index on `event_timestamp` is managed purely by Flyway).
*   **Composite Key:** Uses `@IdClass(AccessHistoryId.class)` to map the composite primary key `(id, eventTimestamp)` required by PostgreSQL partitioning.
*   **Fields:**
    *   `id`: `UUID` (`@Id`)
    *   `eventTimestamp`: `LocalDateTime` (`@Id`, used for Partitioning).
    *   `studentId`: `UUID` (Soft Reference)
    *   `gateId`: `UUID` (Soft Reference)
    *   `operatorId`: `UUID` (Nullable Soft Reference)
    *   `decision`: `AccessDecision` (Enum)
    *   `denialReason`: `String` (Nullable)
    *   `method`: `VerificationMethod` (Enum)
    *   `createdAt`: `LocalDateTime` (Audit timestamp of DB insertion).
*   **Governance Note (Immutable Event Record):** Explicitly does NOT extend `BaseEntity`. It writes `createdAt` directly and omits `updatedAt`. This freezes the architecture to prevent future developers from accidentally adding update semantics. No `@ManyToOne` bindings.

### `CurfewPolicy` Entity
*   **Table:** `@Table(name = "curfew_policies", indexes = {@Index(columnList = "building_id, is_active")})`
*   **Fields:**
    *   `id`: `UUID` (Primary Key)
    *   `buildingId`: `UUID` (Soft Reference to Facility)
    *   `residentType`: `ResidentType` (Enum)
    *   `startTime`: `LocalTime` (Time data type)
    *   `endTime`: `LocalTime`
    *   `type`: `CurfewType` (Enum)
    *   `priority`: `Integer` (Determines resolution when policies overlap)
    *   `isActive`: `Boolean`
*   **Notes:** Extends `BaseEntity` (inherits `createdAt`, `updatedAt`). No `@ManyToOne` bindings.

### `TimeWindowPolicy` Entity
*   **Table:** `@Table(name = "time_window_policies", indexes = {@Index(columnList = "building_id, is_active")})`
*   **Fields:**
    *   `id`: `UUID` (Primary Key)
    *   `buildingId`: `UUID` (Soft Reference to Facility)
    *   `residentType`: `ResidentType` (Enum)
    *   `startTime`: `LocalTime`
    *   `endTime`: `LocalTime`
    *   `isActive`: `Boolean`
*   **Notes:** Extends `BaseEntity`. No `@ManyToOne` bindings.

### `ProcessedMessage` Entity
*   **Table:** `@Table(name = "processed_messages")`
*   **Fields:**
    *   `messageId`: `String` (Primary Key, Event Idempotency Key, abstracted from MQTT/Kafka layer)
    *   `processedAt`: `LocalDateTime` (Defaults to now)
    *   `source`: `String` (Identifier of the module producing the event)
*   **Notes:** Purely used for Idempotency tracking.

---

## 4. Final Decision
**Status: PASS** ✅

The Java JPA Entity design exactly bridges the gap between the application domain and the strict PostgreSQL `V21` schema. Soft UUIDs prevent module bleeding, while strategic field mapping (e.g., separating `eventTimestamp` vs `createdAt` and utilizing `priority`) ensures maximum business logic flexibility.
