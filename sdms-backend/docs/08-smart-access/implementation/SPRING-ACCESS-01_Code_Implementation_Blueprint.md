# SPRING-ACCESS-01: Smart Access Code Implementation Blueprint

## 1. Module Package Structure
The `smart-access` module is built using a clean, domain-driven package hierarchy.

```text
vn.edu.iuh.sdms.smartaccess
├── api
│   ├── controller
│   ├── dto
│   └── exception
├── application
│   ├── service
│   └── strategy
├── domain
│   ├── entity
│   ├── enums
│   └── repository
├── event
│   ├── inbound
│   ├── outbound
│   └── listener
├── infrastructure
│   └── persistence
└── security
    └── permission
```

---

## 2. Flyway Migration Plan
Strictly following `ACCESS-08A` to avoid conflicts with the Face Module (which uses V20).

*   **Migration Order:**
    *   `V21_01__create_smart_access_enums.sql`
    *   `V21_02__create_curfew_policies_table.sql`
    *   `V21_03__create_time_window_policies_table.sql`
    *   `V21_04__create_access_history_table.sql` (Partitioned)
    *   `V21_05__create_processed_messages_table.sql`
*   **Dependency Validation:** Must execute after `V10` (Core Identity) and strictly independently of `V20` (Face Module).
*   **Partition Strategy:** `access_history` is partitioned `BY RANGE (timestamp)` to handle high gate traffic natively in PostgreSQL 17.

---

## 3. Enum Design
*   `AccessDecision`: `GRANTED`, `DENIED_CURFEW`, `DENIED_UNAUTHORIZED`, `DENIED_TIME_WINDOW`, `ERROR`.
*   `OverrideType`: `REMOTE_UNLOCK`, `FIRE_EMERGENCY`, `SECURITY_LOCKDOWN`.
*   `VerificationMethod`: `FACE_AI`, `RFID`, `MANUAL_OVERRIDE`, `REMOTE_UNLOCK`.
*   `ResidentType`: `BOARDING`, `NON_BOARDING`.
*   `CurfewType`: `STRICT`, `SOFT_WARNING`.

---

## 4. Entity Blueprint

### 1. `AccessHistory`
*   **Responsibilities:** Immutable append-only log of every physical gate interaction.
*   **Attributes:** `id` (UUID), `studentId`, `gateId`, `timestamp`, `decision` (Enum), `method` (Enum).
*   **Relationships:** None (Decoupled UUID references only).
*   **Indexes:** `BRIN` index on `timestamp`, `B-Tree` on `studentId`, `gateId`.
*   **Constraints:** Immutable (No UPDATE triggers allowed).

### 2. `CurfewPolicy`
*   **Responsibilities:** Defines dormitory curfew rules (e.g., 23:00 - 05:00).
*   **Attributes:** `id`, `buildingId` (UUID), `residentType` (Enum), `startTime` (LocalTime), `endTime` (LocalTime), `type` (Enum), `isActive`.
*   **Relationships:** None.
*   **Constraints:** Overlapping time constraints must be validated via Service layer.

### 3. `TimeWindowPolicy`
*   **Responsibilities:** Time-based access rules for non-boarding/external entities.
*   **Attributes:** `id`, `targetId` (Student/Role), `validFrom` (LocalDateTime), `validTo` (LocalDateTime).

### 4. `ProcessedMessage`
*   **Responsibilities:** Idempotency tracking to prevent duplicate MQTT message processing.
*   **Attributes:** `messageId` (String), `processedAt` (Timestamp), `source` (String).
*   **Indexes:** Primary Key on `messageId`. TTL cleanup strategy.

---

## 5. Repository Blueprint
*   **Repository Interfaces:** Spring Data JPA `JpaRepository`.
*   **Custom Queries:** Native PostgreSQL queries for complex partitioned table retrievals in `AccessHistoryRepository`.
*   **Pagination Strategy:** Always use keyset pagination or `Pageable` for UI queries on `AccessHistory`.
*   **Audit Restrictions:** `AccessHistoryRepository` MUST NOT contain `save()` methods that perform updates. Only `persist/insert`.

---

## 6. Permission Catalog
*   `REMOTE_UNLOCK`: Owned by Admin/Security Guards. Allows opening the gate via the UI.
*   `VIEW_ACCESS_HISTORY`: Owned by Staff/Admin. Allows reading the immutable log.
*   `MANAGE_CURFEW_POLICY`: Owned by Admin. Allows CRUD on curfew rules.
*   `MANAGE_TIME_WINDOW_POLICY`: Owned by Admin. Allows CRUD on time window rules.
*   `EMERGENCY_OVERRIDE`: Owned by Highest Level Admin/Security. Triggers total lockdown or unlock.

---

## 7. Event Blueprint (Spring ApplicationEvent)

### Inbound Events
*   `IdentityVerifiedEvent`: Triggered by the Face Module. Smart Access listens, evaluates curfew, and decides GRANTED/DENIED.
*   `IdentityFailedEvent`: Triggered by the Face Module. Smart Access logs a DENIED attempt.

### Outbound Events (To IoT/Notification)
*   `AccessGrantedEvent`: Instructs IoT module to open the relay.
*   `AccessDeniedEvent`: Triggers red LED via IoT module and pushes notification to student.
*   `RemoteUnlockEvent`: Triggered by Admin UI, bypasses AI validation.
*   `EmergencyOverrideEvent`: Triggers all gates to unlock/lock simultaneously.

### Publishing Rules
*   **Strictly:** `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` to ensure events are only fired if the database transaction succeeds.

---

## 8. Service Layer Blueprint

*   **`IdempotencyService`**:
    *   *Responsibilities:* Checks `ProcessedMessage` to ensure an MQTT/IoT trigger is processed exactly once.
*   **`EligibilityEvaluationService`**:
    *   *Responsibilities:* Orchestrates checking if a student is active, not evicted, and their `ResidentType`.
*   **`CurfewResolutionStrategy`**:
    *   *Responsibilities:* Evaluates the current time against active `CurfewPolicy`.
*   **`TimeWindowEvaluationStrategy`**:
    *   *Responsibilities:* Evaluates temporary access rights.
*   **`AccessEvaluationService`**:
    *   *Responsibilities:* The core facade. Receives `IdentityVerifiedEvent`, runs Eligibility $\rightarrow$ Curfew $\rightarrow$ TimeWindow. Constructs `AccessHistory` and fires `AccessGrantedEvent` / `AccessDeniedEvent`.
*   **`RemoteUnlockService`**:
    *   *Responsibilities:* Validates Staff permissions, fires `RemoteUnlockEvent`, logs `AccessHistory`.
*   **`EmergencyOverrideService`**:
    *   *Responsibilities:* Disables all curfews and forces gate states.

---

## 9. Controller Blueprint
*   **`RemoteUnlockController`**: `POST /api/v1/access/gates/{id}/unlock`. Permission: `REMOTE_UNLOCK`.
*   **`AccessHistoryController`**: `GET /api/v1/access/history`. Permission: `VIEW_ACCESS_HISTORY`.
*   **`PolicyManagementController`**: `CRUD /api/v1/access/policies/curfew`. Permission: `MANAGE_CURFEW_POLICY`.
*   **`EmergencyOverrideController`**: `POST /api/v1/access/emergency`. Permission: `EMERGENCY_OVERRIDE`.

---

## 10. Security Blueprint (AC-15A Compliance)
*   **Permission-based Authorization:** Controller methods MUST use method-level security.
*   **`@PreAuthorize` Examples:** `@PreAuthorize("hasAuthority('REMOTE_UNLOCK')")`.
*   **Forbidden Patterns:** Do NOT use `@PreAuthorize("hasRole('ADMIN')")`. Access must be granted via fine-grained capabilities, not generic roles.

---

## 11. Testing Blueprint
*   **Unit Tests:** JUnit 5 for Strategy classes (`CurfewResolutionStrategy`, `EligibilityEvaluationService`). Fast logic validation.
*   **Integration Tests:** Testcontainers for PostgreSQL to verify `AccessHistory` partitioning and `ProcessedMessage` unique constraint violations (Idempotency).
*   **Event Tests:** Use Spring's `ApplicationEvents` test bindings to verify `AFTER_COMMIT` firing.
*   **Security Tests:** `@WithMockUser(authorities = {"REMOTE_UNLOCK"})` to verify Controller access control.

---

## 12. Implementation Order
*   **Week 1:** Database Schema (Flyway V21), Entity mapping, Repository layer, and `IdempotencyService`.
*   **Week 2:** Strategy Layer (`Curfew`, `TimeWindow`, `Eligibility`) and Unit Testing.
*   **Week 3:** Core Facade (`AccessEvaluationService`), Spring ApplicationEvent wiring, and Integration Testing.
*   **Week 4:** Controllers, `@PreAuthorize` Security, DTO validation, and end-to-end event verification.

---

## 13. Readiness Verification

| Component | Status | Remark |
| :--- | :--- | :--- |
| **Database** | ✅ PASS | Flyway V21 partitioned logic defined. |
| **Entity** | ✅ PASS | Strict bounds and constraints mapped. |
| **Repository** | ✅ PASS | Immutable audit restrictions frozen. |
| **Service** | ✅ PASS | Clear boundaries, no Kafka/Event Sourcing. |
| **Event** | ✅ PASS | Choreography using `AFTER_COMMIT` verified. |
| **Controller** | ✅ PASS | API routing and ownership set. |
| **Security** | ✅ PASS | AC-15A Permission-based rules enforced. |
| **Testing** | ✅ PASS | Mocking and Integration boundaries clear. |

---

## FINAL DECISION

**Can Spring Team start coding immediately?**
**YES.** 🟢

**Justification:**
This blueprint successfully translates high-level architectural mandates (`ACCESS-01` to `ACCESS-08A`, and `AC-15A`) into concrete, code-ready Java specifications. It strictly avoids forbidden patterns (no CQRS, no Kafka, no Event Sourcing) while maximizing native Spring Boot / PostgreSQL capabilities. The Spring Boot Backend Team possesses exact package structures, entity relationships, event flows, and authorization rules, completely eliminating architectural guesswork during the coding phase.
