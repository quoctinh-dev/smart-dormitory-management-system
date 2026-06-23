# SPRING-CODEGEN-01: Real Code Generation Plan

## 1. Executive Summary
This document defines the absolute, linear coding sequence for generating the Smart Access Spring Boot module. All architectural blueprints (`SPRING-IMPLEMENTATION-01` $\rightarrow$ `07`) are frozen. **No further audits will be performed. This is the execution phase.**

---

## 2. Code Generation Order

### 1. Package Creation Order
The very first step is scaffolding the domain-driven directory structure under `vn.edu.iuh.sdms.smartaccess`.
1.  `domain/enums`
2.  `domain/entity`
3.  `domain/repository`
4.  `application/strategy`
5.  `application/service`
6.  `application/port/in` (Use Cases)
7.  `application/port/out` (External calls like `StudentQueryPort`)
8.  `event/inbound` & `event/outbound` & `event/listener`
9.  `api/dto/request` & `api/dto/response` & `api/validator`
10. `api/controller` & `api/exception`
11. `security/permission`

### 2. Flyway Implementation Order (Target: `src/main/resources/db/migration`)
SQL files must be written and executed against a local PostgreSQL 17 instance to verify syntax.
1.  `V21_01__create_smart_access_enums.sql`
2.  `V21_02__create_curfew_policies_table.sql`
3.  `V21_03__create_time_window_policies_table.sql`
4.  `V21_04__create_access_history_table_partitioned.sql`
5.  `V21_05__create_processed_messages_table.sql`

### 3. Entity Coding Order (Target: `domain/entity`)
Map exactly to the Flyway schemas using Soft UUIDs.
1.  `BaseEntity.java` (MappedSuperclass)
2.  `CurfewPolicy.java`
3.  `TimeWindowPolicy.java`
4.  `AccessHistory.java` (Immutable, UUID id PRIMARY KEY)
5.  `ProcessedMessage.java`

### 4. Repository Coding Order (Target: `domain/repository`)
1.  `ProcessedMessageRepository.java`
2.  `CurfewPolicyRepository.java`
3.  `TimeWindowPolicyRepository.java`
4.  `AccessHistoryRepository.java` (Extends `Repository`, strict Append-Only).

### 5. Strategy & Service Coding Order (Target: `application/`)
Build from the inside out (Strategies $\rightarrow$ Facades).
1.  `IdempotencyService.java`
2.  `StudentQueryPort.java` (Interface) & `StudentEligibilitySnapshot.java`
3.  `CurfewResolutionStrategy.java`
4.  `TimeWindowEvaluationStrategy.java`
5.  `EligibilityEvaluationService.java`
6.  `AccessEvaluationService.java` (The Core Facade)
7.  `RemoteUnlockService.java`
8.  `EmergencyOverrideService.java`

### 6. Event Coding Order (Target: `event/`)
1.  **Payloads:** `IdentityVerifiedEvent`, `IdentityFailedEvent`, `AccessGrantedEvent`, `AccessDeniedEvent`, `EmergencyOverrideEvent` (with `EmergencyActionType`).
2.  **Listeners:** `IdentityVerifiedEventListener`, `IdentityFailedEventListener`.
3.  **Publishers:** `AccessGrantedEventPublisher` (Must use `AFTER_COMMIT`).

### 7. DTO & Validation Coding Order (Target: `api/dto/`)
1.  `ValidTimeRange.java` (Custom Annotation) & `TimeRangeValidator.java`
2.  `CurfewPolicyCreateRequest.java`
3.  `EmergencyOverrideRequest.java` (with nullable `buildingId`)
4.  `AccessHistoryResponse.java`

### 8. Controller Coding Order (Target: `api/controller/`)
1.  `CurfewPolicyController.java`
2.  `TimeWindowPolicyController.java`
3.  `RemoteUnlockController.java`
4.  `EmergencyOverrideController.java`
5.  `AccessHistoryController.java`

### 9. Security Coding Order
1.  Apply `@PreAuthorize` to all controllers using exact capabilities (`MANAGE_CURFEW_POLICY`, `REMOTE_UNLOCK`, etc.).
2.  Map `GlobalExceptionHandler.java` (401, 403, 409, 422).

### 10. Unit Test Order
1.  Test `ValidTimeRange` (Overnight window logic).
2.  Test `CurfewResolutionStrategy` (Priority resolution logic).
3.  Test `TimeWindowEvaluationStrategy`.
4.  Test `EligibilityEvaluationService` (Mocks `StudentQueryPort`).

### 11. Integration Test Order
1.  **Flyway + Testcontainers:** Verify partitioned table `access_history` insertion.
2.  **Idempotency:** Verify `ProcessedMessage` blocks duplicate keys.
3.  **Event Choreography:** Verify `AFTER_COMMIT` suppression when DB rollback occurs.
4.  **Security:** `@WithMockUser(authorities="...")` on Controllers.

---

## 3. Definition Of Done (DoD)
*   **Compile:** Project compiles under Java 17 with `spring-boot-starter-data-jpa`.
*   **DB Migration:** Flyway starts up without errors.
*   **Coverage:** Business logic strategies exceed 90% unit test coverage.
*   **Boundaries:** `import vn.edu.iuh.sdms.identity.*` is absolutely absent from the codebase (except via proper ACLs).
*   **Immutability:** No API or Repository method exists to delete an `AccessHistory` record.

---

## FINAL DECISION
**Status: READY FOR CODING** 🟢

The architectural phase is permanently closed. The generation sequence is linear, unblocked, and ready for execution.
