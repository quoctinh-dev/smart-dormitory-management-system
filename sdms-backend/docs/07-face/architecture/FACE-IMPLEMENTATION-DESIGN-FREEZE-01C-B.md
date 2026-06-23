# FACE-IMPLEMENTATION-DESIGN-FREEZE-01C-B

## 1. Method Flow Specifications

### 1.1 `FaceProfileServiceImpl`

#### `registerFace(UUID studentId, String faceImageUrl)`
- **Validation Flow:** 
  - Call `FaceProfileRepository.findByStudentId(studentId)`.
  - If a profile exists with status `PENDING` or `APPROVED`, throw `FaceAlreadyRegisteredException`.
  - If a profile exists with status `REJECTED` or `REVOKED`, update the existing profile (overwrite `faceImageUrl`, reset `status` to `PENDING`, clear `rejectionReason`).
  - If no profile exists, construct a new `FaceProfile` (status `PENDING`).
- **Repository Usage:** `findByStudentId`, `save`.
- **Transaction Boundary:** Standard `@Transactional`.
- **Event Publication:** None.
- **Error Conditions:** Duplicate active registration.

#### `approveFace(UUID profileId, UUID adminId)`
- **Validation Flow:**
  - Find profile. If missing, throw `FaceProfileNotFoundException`.
  - If status is not `PENDING`, throw `IllegalStateException` (Invalid transition).
- **Repository Usage:** `findById`, dirty checking handles update.
- **Transaction Boundary:** Standard `@Transactional`.
- **Event Publication:** Publishes `FaceProfileApprovedEvent(profileId)`.
- **Error Conditions:** Profile not found, Profile not pending.

#### `rejectFace(UUID profileId, String rejectionReason)`
- **Validation Flow:**
  - Find profile. If missing, throw `FaceProfileNotFoundException`.
  - If status is not `PENDING`, throw `IllegalStateException`.
- **Repository Usage:** `findById`, dirty checking.
- **Transaction Boundary:** Standard `@Transactional`.
- **Event Publication:** Publishes `FaceProfileRejectedEvent(profileId, faceImageUrl)`.

#### `revokeFace(UUID profileId, String revocationReason)`
- **Validation Flow:**
  - Find profile. If missing, throw `FaceProfileNotFoundException`.
  - If status is not `APPROVED`, throw `IllegalStateException`.
- **Repository Usage:** `findById`, dirty checking.
- **Transaction Boundary:** Standard `@Transactional`.
- **Event Publication:** Publishes `FaceProfileRevokedEvent(profileId, revocationReason)`.

---

### 1.2 `FaceVerificationServiceImpl`

#### `verifyFace(String gateDeviceId, Object verificationPayload)`
- **Execution Order:**
  1. **Input Validation:** Cast and validate `verificationPayload` (ensure vector is properly formatted).
  2. **Vector Search:** Call `FaceEmbeddingRepository.findNearestMatch(vector)`.
  3. **Threshold Evaluation:** 
     - If result exists and `distance <= THRESHOLD` (e.g., 0.8), outcome is `SUCCESS`.
     - Else, outcome is `FAIL`.
  4. **Persistence:** Insert `FaceVerificationAttempt` (gateId, matched profileId (if any), distance, outcome).
  5. **Event Publication:** If `SUCCESS`, publish `FaceMatchSuccessEvent(gateDeviceId, profileId, attemptId)`.
- **Repository Usage:** `FaceEmbeddingRepository.findNearestMatch`, `FaceVerificationAttemptRepository.save`.
- **Failure Handling:** If input vector is malformed, log error and immediately return `FAIL` outcome (no attempt ledger written for garbage input, or log as malformed).

---

### 1.3 `FaceAiOrchestratorImpl`

#### `generateEmbedding(UUID profileId)`
- **Event Consumer:** Annotate with `@TransactionalEventListener(phase = AFTER_COMMIT)` and `@Async`.
- **Execution Order:**
  1. Verify profile is still `APPROVED`.
  2. **AI Engine Call:** Make external HTTP POST request to Python AI Engine.
  3. **Persistence:** Map response to `float[]`, create and save new `FaceEmbedding`.
  4. **Event Publication:** Publish `FaceSyncReadyEvent(profileId)`.
- **Timeout / Failure Handling:** 
  - If AI Engine times out or throws 500: Catch exception, log error. Do not fail the transaction (as it's already async independent). Retry mechanisms or manual admin triggers should be implemented to recover stuck profiles.

---

## 2. Transaction Specifications

| Method | Begin TX | Operations | Commit TX | Event Publication |
| :--- | :--- | :--- | :--- | :--- |
| `registerFace` | `BEGIN` | Insert/Update `FaceProfile` | `COMMIT` | None |
| `approveFace` | `BEGIN` | Update `FaceProfile` status & admin | `COMMIT` | `@TransactionalEventListener(AFTER_COMMIT)` |
| `rejectFace` | `BEGIN` | Update `FaceProfile` status & reason | `COMMIT` | `@TransactionalEventListener(AFTER_COMMIT)` |
| `revokeFace` | `BEGIN` | Update `FaceProfile` status & reason | `COMMIT` | `@TransactionalEventListener(AFTER_COMMIT)` |
| `verifyFace` | `BEGIN` | Read PGVector -> Insert `Attempt` | `COMMIT` | `@TransactionalEventListener(AFTER_COMMIT)` |
| `generateEmbedding` | `BEGIN` (Async thread) | HTTP Call -> Insert `FaceEmbedding` | `COMMIT` | `@TransactionalEventListener(AFTER_COMMIT)` |

**Audit:** No transaction leakage. All events strictly fire *after* the database commit succeeds.

---

## 3. Exception Strategy

| Exception Class | HTTP Status | Use Case |
| :--- | :--- | :--- |
| `FaceProfileNotFoundException` | `404 Not Found` | Admin attempts to review a non-existent profile. |
| `FaceAlreadyRegisteredException`| `409 Conflict` | Student uploads photo but already has `PENDING`/`APPROVED` profile. |
| `IllegalStateException` | `422 Unprocessable` | Admin attempts to approve a profile that is already revoked or rejected. |
| `AiEngineUnavailableException` | `503 Service Unavail`| External Python AI API is offline or times out. |
| `MalformedVectorException` | `400 Bad Request` | IoT edge camera sends unparsable vector payload. |

---

## 4. Event Specifications

All domain events are POJOs containing pure identity references (UUIDs) and facts, ensuring they do not transfer aggregate ownership or large data structures (except primitive facts required for choreography).

- `FaceProfileApprovedEvent(UUID profileId)`
- `FaceProfileRejectedEvent(UUID profileId, String faceImageUrl)` (URL passed for CDN cleanup choreography)
- `FaceProfileRevokedEvent(UUID profileId, String reason)`
- `FaceSyncReadyEvent(UUID profileId)`
- `FaceMatchSuccessEvent(String gateDeviceId, UUID profileId, UUID attemptId)`

---

## 5. Risks

1. **AI Asynchronous Recovery:**
   If `generateEmbedding()` fails due to an `AiEngineUnavailableException`, the `FaceProfile` remains `APPROVED` but has no `FaceEmbedding`. The system currently relies on manual admin intervention or a future cron job to retry extraction.
2. **PostgreSQL Connection Pool Exhaustion:**
   `verifyFace()` performs a vector search inside the IoT verification transaction. If the gate throughput spikes (e.g., morning rush hour), connection pooling must be properly tuned to prevent blocking.

---

## 6. Architecture Validation & Final Certification

- **No Cross Context ORM:** Verified. All interactions use `UUID`.
- **No Ownership Leakage:** Verified. Repositories are strictly called by their owning services.
- **No Event Ownership Violation:** Verified. Events carry facts, not ownership.
- **No Circular Dependencies:** Verified. Transaction boundaries run strictly one-way (Command -> Repo -> Commit -> Event).

**FINAL DECISION: PASS**

The implementation behavior design is complete, deterministic, and fully compliant with the Face Domain rules. Ready for actual service implementation coding.
