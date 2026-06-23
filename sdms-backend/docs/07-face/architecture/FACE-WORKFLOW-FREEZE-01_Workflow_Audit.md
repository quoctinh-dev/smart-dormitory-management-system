# FACE-WORKFLOW-FREEZE-01

## 1. Architecture Audit

**Status:** AUDITED & VERIFIED  
**Architecture Style:** Modular Monolith  
**Cross Context Rule:** No direct ORM relations across bounded contexts. UUID references only (e.g., `studentId`).  
**Ownership Rule:** Face Module exclusively owns `FaceProfile`, `FaceEmbedding`, and `FaceVerificationAttempt`. It does NOT own `Student` profile data, `Access Decisions`, or `Gate Authorization`.  

---

## 2. Use Case Freeze

### Student Use Cases
1. **Upload / Re-Upload Face Photo**
   - **Purpose:** Submit a portrait for biometric registration.
   - **Aggregate Owner:** `FaceProfile`
   - **Trigger:** Student Mobile App API call.
   - **Expected Result:** Profile transitions to `PENDING`. Image is uploaded to CDN.

2. **View Face Status**
   - **Purpose:** Check the current registration state and feedback.
   - **Aggregate Owner:** `FaceProfile`
   - **Trigger:** Student Mobile App API call.
   - **Expected Result:** Returns current status (`PENDING`, `APPROVED`, `REJECTED`, `REVOKED`) and `rejectionReason` if applicable.

### Admin Use Cases
3. **Review Pending Profiles**
   - **Purpose:** View a queue of student portraits awaiting approval.
   - **Aggregate Owner:** `FaceProfile`
   - **Trigger:** Admin Web Portal API call.
   - **Expected Result:** Returns a paginated list of `PENDING` profiles, ordered by `createdAt` ASC (FIFO).

4. **Approve Face Profile**
   - **Purpose:** Accept a student's portrait.
   - **Aggregate Owner:** `FaceProfile`
   - **Trigger:** Admin Web Portal API call.
   - **Expected Result:** Status becomes `APPROVED`. Records `approvedBy` and `approvedAt`. Triggers `FaceProfileApprovedEvent`.

5. **Reject Face Profile**
   - **Purpose:** Decline a poor-quality portrait.
   - **Aggregate Owner:** `FaceProfile`
   - **Trigger:** Admin Web Portal API call.
   - **Expected Result:** Status becomes `REJECTED`. Records `rejectionReason`. Triggers `FaceProfileRejectedEvent`. Image is retained for deferred cleanup.

6. **Revoke Face Profile**
   - **Purpose:** Remove biometric privileges for an already approved student.
   - **Aggregate Owner:** `FaceProfile`
   - **Trigger:** Admin Web Portal API call.
   - **Expected Result:** Status becomes `REVOKED`. Records `rejectionReason`. Triggers `FaceProfileRevokedEvent`.

### System Use Cases
7. **Extract Biometric Vector**
   - **Purpose:** Generate a Face Embedding Vector from an approved photo.
   - **Aggregate Owner:** `FaceEmbedding`
   - **Trigger:** Internal `FaceAiOrchestrator` (reacting to `FaceProfileApprovedEvent`).
   - **Expected Result:** Vector stored in `FaceEmbedding`. Triggers `FaceSyncReadyEvent`.

8. **Verify Face at Gate**
   - **Purpose:** Identify a face from an IoT edge camera.
   - **Aggregate Owner:** `FaceVerificationAttempt`
   - **Trigger:** IoT Edge Protocol (MQTT or Internal API - pending IoT Architecture freeze).
   - **Expected Result:** Matches against `FaceEmbedding` using pgvector. Logs immutable `FaceVerificationAttempt`. If threshold met, triggers `FaceMatchSuccessEvent`.

---

## 3. State Machine Freeze

### Lifecycle Diagram
```text
[ Unregistered / Null State ]
        │
        ▼ (Student Upload)
   [ PENDING ]
        │
        ├───────────────┐
 (Admin │ Approve)      │ (Admin Reject)
        ▼               ▼
  [ APPROVED ]     [ REJECTED ]
        │               │
 (Admin │ Revoke)       │ (Student Re-Upload)
        ▼               │
  [ REVOKED ] ──────────┘
        │
        ▼ (Student Re-Upload)
   [ PENDING ]
```

### Transition Table
| Current State | Action | Next State | Allowed? |
| :--- | :--- | :--- | :--- |
| `NULL` | Student Upload | `PENDING` | YES |
| `PENDING` | Admin Approve | `APPROVED` | YES |
| `PENDING` | Admin Reject | `REJECTED` | YES |
| `APPROVED` | Admin Revoke | `REVOKED` | YES |
| `REJECTED` | Student Re-Upload | `PENDING` | YES |
| `REVOKED` | Student Re-Upload | `PENDING` | YES |
| `APPROVED` | Admin Approve | `APPROVED` | NO (Idempotent ignore or error) |
| `REJECTED` | Admin Revoke | `REVOKED` | NO |

### Architecture Justification
`NOT_REGISTERED` is omitted from the enum to avoid creating dummy records. A missing `FaceProfile` natively represents the unregistered state. State transitions strictly reflect real-world business constraints. 

---

## 4. Event Flow Freeze

| Event | Publisher | Trigger | Consumer | Business Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `FaceProfileApprovedEvent` | `FaceProfileService` | Admin approves profile | `FaceAiOrchestrator` (Internal), Notification Module | Initiate AI vector extraction; notify student. |
| `FaceProfileRejectedEvent` | `FaceProfileService` | Admin rejects profile | Notification Module, Data Retention Policy | Notify student; flag image for deferred asynchronous cleanup. |
| `FaceProfileRevokedEvent` | `FaceProfileService` | Admin revokes profile | Smart Access Module, Notification Module | Immediately invalidate cache/access; notify student. |
| `FaceSyncReadyEvent` | `FaceAiOrchestrator` | Vector successfully saved | IoT Sync / Gate Cache / Device Provisioning Module (TBD) | Signal that the biometric identity is ready for downstream edge device synchronization. |
| `FaceMatchSuccessEvent` | `FaceVerificationService` | IoT verification match exceeds threshold | Smart Access Module | Provide identity fact to Smart Access for authorization evaluation. |

**Ownership Validation:** No ownership violation detected. The Face Module produces facts. Consumers react independently.

---

## 5. Governance Matrix

| Decision Domain | Owner | Justification |
| :--- | :--- | :--- |
| **Vector Similarity Calculation** | `FaceEmbeddingRepository` (pgvector) | The database computes spatial distance natively via SQL. |
| **Acceptance Threshold (e.g., 0.8)** | `FaceVerificationService` | The Service Layer defines what mathematical distance constitutes a "match". |
| **Access Authorization** | Smart Access Module | Face Module only asserts "This is Student X". Smart Access evaluates rules (curfews, debts, time windows) to decide "Open the Gate". |
| **Diagnostic Confidence Score** | Face Module (Audit Ledger) | Kept exclusively for monitoring model drift and accuracy. NEVER used for access logic. |

---

## 6. Transaction Boundary Freeze

| Operation | DB Transaction | Event Publication Phase | Rationale |
| :--- | :--- | :--- | :--- |
| **Upload Face** | Single Tx (Insert/Update `FaceProfile`) | None | Synchronous API response to mobile app. |
| **Approve Profile** | Single Tx (Update `FaceProfile`) | `@TransactionalEventListener(phase = AFTER_COMMIT)` | Ensure `FaceProfileApprovedEvent` only fires if DB commit succeeds, preventing ghost AI extractions. |
| **Reject / Revoke** | Single Tx (Update `FaceProfile`) | `@TransactionalEventListener(phase = AFTER_COMMIT)` | Ensure notifications and revocation events are accurate. |
| **Save Embedding** | Single Tx (Insert `FaceEmbedding`) | `@TransactionalEventListener(phase = AFTER_COMMIT)` | Ensure Smart Access is only notified via `FaceSyncReadyEvent` when vector is fully persisted. |
| **Verify Attempt** | Single Tx (Insert `FaceVerificationAttempt`) | `@TransactionalEventListener(phase = AFTER_COMMIT)` | Ensure `FaceMatchSuccessEvent` only reaches Smart Access if the audit ledger successfully commits. |

---

## 7. Risks & Warnings

1. **AI Engine Latency:** If the external Python AI Engine is slow, `FaceAiOrchestrator` must handle timeouts gracefully and retry asynchronously.
2. **Transaction Bloat:** Verification attempts must be inserted extremely fast. Ensure `FaceVerificationService` does not perform long-running blocking calls inside the `@Transactional` boundary before inserting the ledger record.
3. **Event Delivery Guarantee:** Relying on Spring Application Events means events are lost if the JVM crashes after commit but before event processing. If strict guaranteed delivery is required later, Outbox Pattern will be necessary.

---

## 8. Final Certification

**FINAL DECISION: PASS**

**Evidence:**
- Use cases align perfectly with the `FaceProfileStatus` enum and entity capabilities.
- Transaction boundaries enforce the `AFTER_COMMIT` event rule, honoring data integrity.
- Cross-context boundaries are strictly preserved (`studentId` UUIDs, no ORM sharing).
- The Verification Governance unequivocally delegates Authorization to the Smart Access Module, honoring the "Face Verification != Access Control" directive.
