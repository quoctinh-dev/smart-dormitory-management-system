# SDMS Smart Access Event Integration Design (v1.0)

## 1. Introduction
This document defines the Event Integration and Choreography Architecture for the Smart Access domain, acting as the Evidence Baseline for ACCESS-03. It establishes the strict decoupling principles between Identity Verification, Access Policy Evaluation, and Hardware Execution.

## 2. Event Ownership & Boundaries
### 2.1 Event Ownership (Requirement 15)
Events strictly belong to the module that produces them, adhering to Bounded Context principles:
* `IdentityVerifiedEvent` / `IdentityFailedEvent`: Owned by the **Face Module** / **RFID Integration**.
* `AccessGrantedEvent` / `AccessDeniedEvent`: Owned by the **Smart Access Module**.
* `RemoteUnlockEvent` / `EmergencyOverrideEvent`: Owned by the **Smart Access Module**.

### 2.2 Transactional Boundary (Requirement 16)
* Each module executes its local business logic within its own completely isolated database transaction.
* There are **NO Distributed Transactions (2PC)**. The system relies entirely on Eventual Consistency.

### 2.3 AFTER_COMMIT Strategy (Requirement 17)
* To prevent "Phantom Events" (events dispatched to the message broker but the local DB transaction rolls back), all Domain Events MUST be published using an **AFTER_COMMIT** strategy.
* Implementation detail: Spring `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` or an Outbox Pattern.

### 2.4 Idempotency Strategy (Requirement 18)
* All event consumers MUST be idempotent. Network retries, at-least-once delivery semantics, or duplicate events must not cause duplicate logical states or redundant physical gate triggers.
* Implementation: Each Consumer maintains a `ProcessedMessage` (Idempotency Key) table using the unique `eventId`.

### 2.5 Security Context Assumption
SDMS sử dụng Hybrid Authorization Architecture: RBAC tại Auth Layer, Permission-Based Authorization tại Business Layer.
* Mọi Event hoặc Request đi vào Smart Access phải được xử lý **sau khi** Auth Module đã resolve: `Role -> Permission`.
* **Smart Access không tự resolve Role**. Nó yêu cầu Security Context hoặc JWT Token đã chứa sẵn chuỗi Permission (Claims).

## 3. Core Architectural Principles
### 3.1 Identity Verified ≠ Access Granted (Requirement 21)
* **Identity Verification** only answers: "Who is this person?" (e.g., Face matched with 98% confidence, RFID card is valid).
* **Access Granting** answers: "Are they allowed to enter this specific zone *right now*?" (Evaluating Curfew, Time Window, Lockout status).
* Successfully identifying a person does NOT guarantee they will be permitted access.

### 3.2 Access Granted ≠ Door Open (Requirement 20)
* **Access Granted** is a purely *logical* policy decision made by the Smart Access Module.
* **Door Open** is a *physical* hardware execution handled solely by the IoT Module.
* A granted access might still fail to open the door due to hardware failure, network offline state at the Edge node, or a physical motor jam.

## 4. Publisher / Consumer Matrix (Requirement 1)

> **GOVERNANCE FREEZE (Event Backbone Ownership):** 
> SDMS is a Modular Monolith. The internal Event Backbone is strictly **Spring ApplicationEvent** (In-Memory Async). 
> **DO NOT** introduce Kafka Clusters, RabbitMQ, Event Sourcing, or CQRS patterns. These are over-engineering and not required for this graduation thesis.

| Event | Publisher | Consumer(s) | Transport |
| :--- | :--- | :--- | :--- |
| `IdentityVerifiedEvent` | Face / RFID Module | Smart Access Module | Spring ApplicationEvent |
| `IdentityFailedEvent` | Face / RFID Module | Smart Access Module | Spring ApplicationEvent |
| `AccessGrantedEvent` | Smart Access Module | IoT Module | Spring ApplicationEvent |
| `AccessDeniedEvent` | Smart Access Module | Notification Module | Spring ApplicationEvent |
| `RemoteUnlockEvent` | Smart Access Module | IoT Module | Spring ApplicationEvent |

## 5. Event Payload Definitions
### 5.1 IdentityVerifiedEvent (Requirement 2)
* **Trigger:** Face AI confirms matching vector OR RFID reads a registered card.
* **Payload:** `eventId`, `studentId`, `verificationMethod` (FACE/RFID), `confidenceScore`, `deviceId`, `timestamp`.

### 5.2 IdentityFailedEvent (Requirement 3)
* **Trigger:** Face AI returns mismatch/low confidence OR RFID reads an unregistered card.
* **Payload:** `eventId`, `attemptId`, `deviceId`, `reason` (UNKNOWN_FACE, UNREGISTERED_CARD), `timestamp`.

### 5.3 AccessGrantedEvent (Requirement 4)
* **Trigger:** Smart Access Module validates identity against all active Curfew and Time Window policies successfully.
* **Payload:** `eventId`, `accessId` (UUID from AccessHistory), `studentId`, `deviceId`, `grantedAt`.

### 5.4 AccessDeniedEvent (Requirement 5)
* **Trigger:** Identity is verified, but Smart Access Policy Engine rejects access (e.g., Account Locked, Curfew Violation).
* **Payload:** `eventId`, `accessId`, `studentId`, `deviceId`, `denialReason`, `deniedAt`.

### 5.5 RemoteUnlockEvent (Requirement 6)
* **Trigger:** Admin/Security staff triggers a manual door unlock via Web/App interface.
* **Payload:** `eventId`, `accessId`, `operatorId` (Soft UUID), `deviceId`, `overrideType`, `unlockedAt`.

## 6. Module Integration Flows
### 6.1 Face → Smart Access (Requirement 8)
* The Face Module performs AI vector matching. It has absolutely no knowledge of dormitory locking rules, curfews, or student statuses.
* Upon successful match, it publishes `IdentityVerifiedEvent`. The Smart Access Module listens to this event to kick off policy evaluation.

### 6.2 RFID → Smart Access (Requirement 9)
* The RFID scanner acts as a fallback. It reads the card UID, maps it to a `studentId`.
* Similar to the Face flow, it publishes `IdentityVerifiedEvent` (with `method=RFID`), funneling into the same Policy Evaluation engine in Smart Access.

### 6.3 Smart Access → IoT (Requirement 10)
* Smart Access computes the logical decision. If PASS, it persists to `AccessHistory` and emits `AccessGrantedEvent`.
* The IoT Module consumes this event, resolves the `deviceId` to a physical IP/MQTT topic, and translates it into a hardware payload (e.g., `RELAY_ON` command) sent to the ESP32 node.

### 6.4 Smart Access → Notification (Requirement 11, Requirement 7)
* When Smart Access rejects a verified user (e.g., Curfew Violation, Account Locked), it persists the denial to `AccessHistory` and emits an `AccessDeniedEvent`.
* The Notification Module consumes this event and pushes a real-time alert to the user's mobile app ("Access Denied: Curfew in effect. Please contact Admin.").

## 7. Event Choreography Pipeline (Requirement 19)
The primary access flow is orchestrated via **Choreography (Decentralized, Event-Driven)** rather than Orchestration (Centralized Controller):
1. **[IoT Edge]** scans face $\rightarrow$ pushes raw frame/feature to Face Module.
2. **[Face Module]** matches vector $\rightarrow$ publishes `IdentityVerifiedEvent`.
3. **[Smart Access Module]** consumes event $\rightarrow$ evaluates business rules $\rightarrow$ persists ledger $\rightarrow$ publishes `AccessGrantedEvent` (or `AccessDeniedEvent`).
4. **[IoT Module]** consumes `AccessGrantedEvent` $\rightarrow$ translates to hardware protocol $\rightarrow$ sends MQTT command.
5. **[Notification Module]** consumes `AccessDeniedEvent` (if applicable) $\rightarrow$ sends Firebase Push Notification.

## 8. Overrides and Failure Flows
### 8.1 Failure Flows (Requirement 12)
* **Hardware Execution Failure:** If the IoT Module fails to open the gate (motor offline, network drop), it **does not** rollback the `AccessGrantedEvent` in the Smart Access database. The `AccessHistory` correctly reflects "Logical Access Granted". The IoT Module must handle its own error logging ("Physical Execution Failed").
* **Identity AI Failure:** Face Module emits `IdentityFailedEvent`. Smart Access logs an `UNKNOWN` attempt into `AccessHistory` purely for security auditing/intrusion detection, but takes no policy action.

### 8.2 Manual Override Flow (Requirement 13)
* Security Guard presses "Unlock" on the Management Dashboard.
* Request hits Smart Access API $\rightarrow$ validates RBAC permissions $\rightarrow$ logs `OVERRIDE` into `AccessHistory` $\rightarrow$ publishes `RemoteUnlockEvent`.
* IoT Module consumes `RemoteUnlockEvent` $\rightarrow$ opens the specific gate.

### 8.3 Emergency Override Flow (Requirement 14)
> **IMPLEMENTATION SCOPE NOTE:** 
> Emergency Override is currently **OUT OF SCOPE** for the current Sprint Coding. 
> It is strictly maintained here as:
> * Architecture Design
> * Business Specification
> * Future Roadmap
> 
> *Reason: Fire Alarm Integration and Emergency Hardware Controller are not yet implemented in the current SDMS.*

* **Trigger Origin**: Emergency Override originates from a **Fire Alarm System** or an **Authorized Emergency Operator**.
* **Policy Bypass**: This flow immediately **bypasses all Curfew and Time Window policies** (AC-12).
* Smart Access Module automatically logs a mass override into `AccessHistory`.
* It publishes a high-priority `EmergencyOverrideEvent`.
* IoT Module consumes this event and broadcasts an `OPEN_ALL` MQTT command to all relevant `deviceId` endpoints to ensure life safety.
