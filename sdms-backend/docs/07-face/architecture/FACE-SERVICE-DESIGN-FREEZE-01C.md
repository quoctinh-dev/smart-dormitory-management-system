# FACE-SERVICE-DESIGN-FREEZE-01C

## 1. Service Inventory

After auditing the Face Domain responsibilities, the Service Layer is divided into three distinct services. This prevents a "God Service" anti-pattern and strictly segregates administrative profile management, AI integration, and high-throughput IoT verification.

1. **`FaceProfileService`**
   - **Purpose:** Manages the lifecycle of the `FaceProfile` aggregate (Student registration and Admin review).
   - **Managed Aggregate:** `FaceProfile`
   - **Published Events:** `FaceProfileApprovedEvent`, `FaceProfileRejectedEvent`, `FaceProfileRevokedEvent`
   - **Consumed Events:** None.

2. **`FaceAiOrchestrator`**
   - **Purpose:** Coordinates with the external AI Engine to extract biometric vectors. Acts as an Anti-Corruption Layer (ACL) between internal events and external AI APIs.
   - **Managed Aggregate:** `FaceEmbedding`
   - **Published Events:** `FaceSyncReadyEvent`
   - **Consumed Events:** `FaceProfileApprovedEvent`

3. **`FaceVerificationService`**
   - **Purpose:** Processes incoming gate verification requests, calculates thresholds against pgvector results, and maintains the audit ledger.
   - **Managed Aggregate:** `FaceVerificationAttempt`
   - **Published Events:** `FaceMatchSuccessEvent`
   - **Consumed Events:** None.

---

## 2. Command Ownership Matrix

All commands modify state and run within a database `@Transactional` boundary.

| Command | Owning Service | Aggregate Modified | Published Event (AFTER_COMMIT) |
| :--- | :--- | :--- | :--- |
| **Register Face** | `FaceProfileService` | `FaceProfile` (Insert) | None |
| **Approve Face** | `FaceProfileService` | `FaceProfile` (Update `APPROVED`) | `FaceProfileApprovedEvent` |
| **Reject Face** | `FaceProfileService` | `FaceProfile` (Update `REJECTED`) | `FaceProfileRejectedEvent` |
| **Revoke Face** | `FaceProfileService` | `FaceProfile` (Update `REVOKED`) | `FaceProfileRevokedEvent` |
| **Generate Embedding** | `FaceAiOrchestrator` | `FaceEmbedding` (Insert) | `FaceSyncReadyEvent` |
| **Verify Face** | `FaceVerificationService`| `FaceVerificationAttempt` (Insert)| `FaceMatchSuccessEvent` (If matched) |

**Ownership Validation:** No ownership violations. Each service modifies only the aggregate it strictly owns.

---

## 3. Query Ownership Matrix

Queries are strictly read-only and operate with `readOnly = true` for transaction optimization.

| Query | Owning Service | Repository Used | Read Model Needed? |
| :--- | :--- | :--- | :--- |
| **Get My Face Profile** | `FaceProfileService` | `FaceProfileRepository` | Yes, maps Entity to `FaceProfileResponse` DTO before returning. |
| **Search Pending Profiles** | `FaceProfileService` | `FaceProfileRepository` | Yes, maps Entity to `FaceAdminQueueResponse` DTO before returning. |
| **View Verification Attempts**| `FaceVerificationService`| `FaceVerificationAttemptRepository` | Yes, maps Entity to standard DTO before returning. |

---

## 4. Event Ownership Matrix

All domain events orchestrate downstream logic and are published exclusively upon successful database commit (`@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`).

| Event | Publisher | Consumer | Transaction Boundary |
| :--- | :--- | :--- | :--- |
| `FaceProfileApprovedEvent` | `FaceProfileService` | `FaceAiOrchestrator` | Independent transaction in consumer (Async recommended). |
| `FaceProfileRejectedEvent` | `FaceProfileService` | Notification / Retention Policy | Independent transaction in consumer. |
| `FaceProfileRevokedEvent` | `FaceProfileService` | Notification / Smart Access | Independent transaction in consumer. |
| `FaceSyncReadyEvent` | `FaceAiOrchestrator` | IoT Sync / Device Provisioning | Independent transaction in consumer. |
| `FaceMatchSuccessEvent` | `FaceVerificationService`| Smart Access Module | Independent transaction in consumer. |

**Duplication Audit:** No duplicated ownership. Each event has exactly one authoritative publisher.

---

## 5. Dependency Graph

To prevent cyclic dependencies and enforce modular monolith boundaries, dependencies are strictly hierarchical and directed:

```text
[Controllers]
      │
      ├──> FaceProfileService ──────────────┐
      │         ├──> FaceProfileRepository  │
      │         └──> StudentQueryPort       │ (Cross-module validation)
      │                                     ▼
      │                             (ApplicationEventPublisher)
      │                                     │
      ├──> FaceAiOrchestrator <─────────────┘ (Listens to FaceProfileApprovedEvent)
      │         ├──> FaceEmbeddingRepository
      │         └──> AI Engine Client (HTTP/gRPC)
      │
      └──> FaceVerificationService
                ├──> FaceEmbeddingRepository (Read-Only: findNearestMatch)
                └──> FaceVerificationAttemptRepository
```

**Validations:**
- **No Circular Dependencies:** The graph is a Directed Acyclic Graph (DAG).
- **No Ownership Leakage:** `FaceVerificationService` only *reads* from `FaceEmbeddingRepository`, it never writes to it. `FaceAiOrchestrator` owns the write path.
- **No Cross-Context Repository Injection:** `StudentQueryPort` is used instead of `StudentRepository`.

---

## 6. Service Split Audit & Risk Analysis

**God Service Risk Assessment (`FaceProfileService`):**
Currently, `FaceProfileService` handles Register, Approve, Reject, and Revoke. This is acceptable for the current scale as they all govern the identical lifecycle state machine of a single aggregate (`FaceProfile`). 
- *Risk:* If Admin workflows grow complex (e.g., multi-step maker-checker approvals), this service could bloat.
- *Mitigation:* The domain is cleanly bounded. If necessary in the future, it can be trivially split into `FaceProfileCommandService` and `FaceProfileQueryService` using CQRS principles. Currently, splitting it would be premature optimization.

**IoT Verification Latency Risk (`FaceVerificationService`):**
- *Risk:* `FaceVerificationService` executes high-frequency IoT calls. If the audit ledger insertion slows down, it bottlenecks the physical gate.
- *Mitigation:* `FaceVerificationAttemptRepository` is designed as append-only. The transaction boundary is minimal (Calculate threshold -> Save Ledger -> Commit -> Publish Event).

---

## 7. Final Certification

**FINAL DECISION: PASS**

**Evidence:**
- The Service Inventory precisely maps to the 3 defined Aggregate Roots, assigning one authoritative service per aggregate.
- Event tracking is explicitly defined with `AFTER_COMMIT` guarantees, ensuring data consistency before orchestrating the AI extraction or Access Decisions.
- The Dependency Graph proves there are no cross-module ORM injections and no circular dependencies.
- The `FaceProfileService` is correctly scoped and justified against the God Service anti-pattern.

The Service Layer Architecture is formally frozen and ready for `SPRING-CODEGEN-FACE-01C`.
