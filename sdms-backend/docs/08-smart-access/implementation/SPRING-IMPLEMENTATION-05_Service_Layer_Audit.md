# SPRING-IMPLEMENTATION-05: Service Layer Implementation Audit

## 1. Executive Summary
This document provides the implementation-ready specifications for the Service Layer of the Smart Access module. It validates the choreography of the business rules engine, ensuring that time-based strategies, idempotency protection, and strict fail-closed security mechanisms perfectly interlock without leaking into the Core Identity module.

---

## 2. Service Layer Specifications

### 1. `IdempotencyService`
*   **Role:** Guards the application against processing duplicate internal events.
*   **Logic:**
    *   Receives `eventId` (String).
    *   Calls `ProcessedMessageRepository.existsById(eventId)`.
    *   If `true`, halts execution silently (returns true).
    *   If `false`, saves the new `eventId` and allows execution to proceed.
*   **Fix Applied:** Strictly documented as Application Event Idempotency. Removes all references to MQTT retries.

### 2. `CurfewResolutionStrategy`
*   **Role:** Resolves overlapping curfews for Boarding students.
*   **Logic:** 
    *   Queries `CurfewPolicyRepository.findByBuildingIdAndIsActiveTrue()`.
    *   Evaluates the current server time against the `start_time` and `end_time` limits.
    *   **Curfew Resolution Priority:** If multiple active policies overlap, the policy with the highest `priority` value dictates the outcome.
*   **Governance Note (Configuration Driven):** Priority values are configuration driven, avoiding hardcoded logic. Recommended defaults: `EMERGENCY = 100`, `HOLIDAY = 80`, `WEEKEND = 50`, `WEEKDAY = 10`.
*   **Output:** Returns `true` (Allowed) or `false` (Curfew violation).

### 3. `TimeWindowEvaluationStrategy`
*   **Role:** Evaluates access windows for specific resident types.
*   **Logic:**
    *   Queries `TimeWindowPolicyRepository.findByBuildingIdAndResidentTypeAndIsActiveTrue()`.
    *   Evaluates `valid_from` and `valid_to`.
*   **Fix Applied:** Exclusively evaluates `BOARDING` and `NON_BOARDING`. Guest references are strictly eliminated.

### 4. `EligibilityEvaluationService`
*   **Role:** Acts as the Anti-Corruption Layer (ACL) calling out to Core Identity.
*   **Logic:** 
    *   Uses an internal `StudentQueryPort` interface to fetch a `StudentEligibilitySnapshot` object containing `status` (e.g., `ACTIVE`, `LOCKED`, `EXPELLED`, `CHECKED_OUT`), `residentType`, and `buildingId`.
    *   **Eligibility Rules:** Immediately denies access if the student status is anything other than fully active and authorized for entry.

### 5. `AccessEvaluationService` (The Facade)
*   **Role:** The core orchestrator reacting to `IdentityVerifiedEvent`.
*   **Workflow:**
    1.  Validates `eventId` via `IdempotencyService`.
    2.  Calls `EligibilityEvaluationService`. If inactive $\rightarrow$ `DENIED` (Unauthorized).
    3.  If active, routes to `TimeWindowEvaluationStrategy` or `CurfewResolutionStrategy` based on `residentType`.
    4.  Constructs `AccessHistory` (with `UUID id` as the sole PK).
    5.  Saves `AccessHistory` via Repository.
    6.  Publishes `AccessGrantedEvent` or `AccessDeniedEvent`.
*   **Transactionality:** The entire flow runs inside `@Transactional`.
*   **Fail Closed Logic:** Any unhandled exception during strategy evaluation defaults the decision to `DENIED` and logs an error, ensuring the gate never fails in an open state.

### 6. `RemoteUnlockService`
*   **Role:** Manual, single-gate override by authorized personnel.
*   **Bypass Scope:** Bypasses Curfew Rules and Time Window Rules. BUT still strictly requires Authentication, Authorization, and Audit Logging.
*   **Permission Boundaries:** Requires `REMOTE_UNLOCK` authority.
*   **Audit Logging:** Extracts the user ID from the Spring Security Context and records it as `operator_id` in the `AccessHistory` log. Saves as `GRANTED` with `method = REMOTE_UNLOCK`.

### 7. `EmergencyOverrideService`
*   **Role:** Global lockdown or evacuation override.
*   **Permission Boundaries:** Requires `EMERGENCY_OVERRIDE` authority.
*   **Audit Logging:** Logs a global state change event and bypasses all strategy logic to immediately broadcast an `EmergencyOverrideEvent` to all gates.

---

## 3. Verification & Audit

*   **AC-01 $\rightarrow$ AC-15A Compliance:**
    *   **AC-01:** Smart Access uniquely makes the decision (Pass).
    *   **AC-15A:** Manual services are fiercely guarded by explicitly requested authorities (Pass).
*   **Event Publishing & AFTER_COMMIT Rules:**
    *   `AccessGrantedEvent` and `AccessDeniedEvent` are fired using Spring's event publisher but must be consumed by a listener annotated with `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`. This ensures that the IoT module is only commanded *after* the `AccessHistory` insert has safely flushed to PostgreSQL.
*   **Curfew Resolution Priority:** Accurately utilizes the new `priority` integer field to resolve multi-rule clashes without hardcoding rules like "Holiday vs Weekday" in Java.
*   **Audit Logging:** `AccessHistory` retains strict PK rules (`UUID id`) and clearly separates `eventTimestamp` from `createdAt`.

---

## FINAL DECISION
**Status: PASS** ✅

The Service Layer architecture is flawlessly designed. By composing small, focused Strategy classes under a main Facade, the codebase strictly adheres to the Single Responsibility Principle and Open/Closed Principle. The backend team is cleared to generate the Spring Boot Service classes and Strategy interfaces.
