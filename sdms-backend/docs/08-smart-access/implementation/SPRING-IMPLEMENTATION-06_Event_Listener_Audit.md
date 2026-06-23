# SPRING-IMPLEMENTATION-06: Event Listener & Choreography Audit

## 1. Executive Summary
This document defines the Spring ApplicationEvent choreography for the Smart Access module. It validates the boundaries between Face, Smart Access, and IoT modules, strictly enforcing `@TransactionalEventListener` rules to guarantee database integrity before any physical gate action is permitted.

---

## 2. Event Listener Specifications

### 1. `IdentityVerifiedEventListener`
*   **Role:** The primary entry point for Smart Access. Listens to events fired by the Face Module or RFID Module.
*   **Listener Type:** Standard `@EventListener` (Executes immediately when the Identity module publishes the event).
*   **Choreography:**
    1.  Receives `IdentityVerifiedEvent` (contains `eventId`, `studentId`, `gateId`, `timestamp`).
    2.  Delegates to `AccessEvaluationService`.
    3.  `AccessEvaluationService` triggers Idempotency check, fetches `StudentEligibilitySnapshot`, and applies configuration-driven Curfew Priorities.
*   **Integration Boundary:** Decouples Smart Access from the HTTP/AI complexity of the Face Module.

### 2. `IdentityFailedEventListener`
*   **Role:** Listens for failed authentication attempts (e.g., Face mismatch, Fake face detected).
*   **Listener Type:** `@EventListener`.
*   **Choreography:**
    1.  Receives `IdentityFailedEvent`.
    2.  Writes an `AccessHistory` record with `decision = DENIED` and `denialReason = 'IDENTITY_FAILED'`.
    3.  Publishes `AccessDeniedEvent` (to turn on the Red LED at the gate).
*   **Governance Note (Ownership):** `IdentityFailedEvent` does not create `FaceVerificationHistory` within Smart Access. Smart Access only records access-related denial events in its log. Biometric failure details (e.g., spoofing scores, confidence rates) remain exclusively inside the Face Module.

### 3. `AccessGrantedEventPublisher`
*   **Role:** Commands the IoT Module to physically open the gate.
*   **Publisher Trigger:** Called by `AccessEvaluationService` ONLY when all time-window and curfew rules pass.
*   **Listener Rule (CRITICAL):** The consuming method in the IoT Module MUST be annotated with `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.
*   **Choreography:** Guarantees that the physical "Open Gate" payload is sent to the MQTT broker only if the `AccessHistory` log was safely committed to PostgreSQL.

### 4. `AccessDeniedEventPublisher`
*   **Role:** Notifies the IoT Module to display denial feedback (e.g., Red LED) and optionally triggers the Notification Module to alert the student.
*   **Listener Rule:** `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.
*   **Choreography:** Ensures the denial log is permanently written before notifying the student of the curfew violation.

### 5. `RemoteUnlockEventPublisher`
*   **Role:** Triggered by `RemoteUnlockService` when an Admin physically clicks "Unlock" on the Web UI.
*   **Bypass Scope:** Bypasses Curfew/Time Window rules, but enforces Authentication, Authorization (`REMOTE_UNLOCK`), and Audit Logging.
*   **Listener Rule:** `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.

### 6. `EmergencyOverrideEventPublisher`
*   **Role:** Triggered by `EmergencyOverrideService` to lock or unlock all gates in the building.
*   **Listener Rule:** `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.
*   **Payload Specification:** Must explicitly provide `EmergencyActionType` (`OPEN_ALL`, `LOCK_ALL`) so the IoT Module does not have to infer the action.
    ```json
    {
      "actionType": "OPEN_ALL",
      "operatorId": "uuid",
      "reason": "FIRE_EMERGENCY"
    }
    ```

---

## 3. Verification & Audit

*   **Spring ApplicationEvent Usage:** Pure in-memory Spring event bus is used instead of heavy message brokers (Kafka/RabbitMQ), perfectly fitting the Modular Monolith topology while retaining loose coupling.
*   **AFTER_COMMIT Rules:** Consistently applied to all Outbound physical actions (`AccessGrantedEvent`, `RemoteUnlockEvent`), cementing the "Database First, Hardware Second" rule.
*   **Event Ordering:** Inbound events (`IdentityVerifiedEvent`) trigger the transaction; Outbound events are dispatched exclusively upon successful commit.
*   **Idempotency:** The initial processing of `IdentityVerifiedEvent` passes the `eventId` directly to the `IdempotencyService`. If a duplicate is detected, the process returns immediately, suppressing downstream Outbound events.
*   **Fail Closed Behavior:** If the transaction fails to commit (e.g., PostgreSQL timeout), `AFTER_COMMIT` prevents `AccessGrantedEvent` from firing. The gate remains securely locked.
*   **IoT Integration Boundaries:** The IoT module knows absolutely nothing about `StudentEligibilitySnapshot` or Curfew Priorities. It merely acts as a dumb consumer of `AccessGrantedEvent` translating it to MQTT.
*   **Face Integration Boundaries:** The Face module knows nothing about Curfews. It simply shouts "I saw Student A" (`IdentityVerifiedEvent`) and forgets about it.
*   **Smart Access Ownership:** Smart Access serves as the absolute orchestrator of physical reality. No other module is allowed to bypass Smart Access and talk directly to the IoT module.

---

## FINAL DECISION
**Status: PASS** ✅

The Event Choreography perfectly encapsulates the intricate dance between Face Detection, Rule Evaluation, and Hardware Execution. The usage of `AFTER_COMMIT` is mathematically sound, ensuring unbreakable data consistency. The backend team is cleared to generate the Spring Event Publishers and Listeners.
