> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-QA-01: Face Test Strategy Design

## 1. Testing Objectives
The primary objective of this Test Strategy is to validate the functional correctness, security, performance, and resilience of the Face Recognition subsystem without violating the strict boundaries defined in the SDMS Modular Monolith architecture.

*   Ensure the AI Service operates purely as a mathematical engine without business logic leakage.
*   Validate the robustness of cross-module integration (Face Module $\leftrightarrow$ Smart Access Module).
*   Verify UI state rendering matches the backend `FaceStatus` exactly.
*   Guarantee system "Fail Closed" behavior under disaster scenarios.

---

## 2. Testing Scope
**In-Scope Components:**
*   **AI Service (Python/FastAPI):** Request validation, ONNX inference, `float[512]` vector generation.
*   **Spring Face Module:** Profile lifecycle management, PostgreSQL `pgvector` operations, `IdentityVerifiedEvent` generation.
*   **Student App:** Biometric capture UI, upload flows, dashboard status separation, notifications.
*   **Admin Web:** Approval Queue, Side-by-Side Review Modal, Manual Revocation workflow.

**Out-of-Scope:**
*   Evaluating the internal neural network accuracy of the pre-trained `InsightFace` model itself (we test its integration, not its deep learning weights).
*   Testing hardware cameras at the physical gate (handled in IoT integration tests).

---

## 3. Unit Testing Strategy
*   **Python (Pytest):** 
    *   Mock the `onnxruntime` InferenceSession to run blazingly fast.
    *   Assert Pydantic validation (e.g., rejecting payloads $>5MB$, or missing both Base64 and URL).
    *   Assert Exception handlers map `NoFaceDetected` to HTTP 400.
*   **Java (JUnit 5 + Mockito):** 
    *   Mock the `RestTemplate`/`WebClient` calling the AI Service.
    *   Mock PostgreSQL to verify the Service layer correctly builds `FaceProfile` entities.
    *   Assert event publishing logic triggers when a profile changes to `APPROVED`.
*   **React (Jest + React Testing Library):** 
    *   Mock API responses (`FACE-UI-04` contracts).
    *   Assert UI components render the correct color badges based on status (`PENDING` vs `APPROVED`).
    *   Assert action buttons (e.g., "Revoke") are disabled/hidden if the required `FACE_REVOKE` permission is missing from the mock JWT context.

---

## 4. Integration Testing Strategy
*   **Spring $\leftrightarrow$ Python:**
    *   Deploy the Python container alongside Spring Boot in a Testcontainers environment.
    *   Send a static test image via Java and assert the response is a valid `float[512]`.
*   **Spring $\leftrightarrow$ PostgreSQL (`pgvector`):**
    *   Use Testcontainers (PostgreSQL with `pgvector` extension).
    *   Insert two known vectors. Assert the Cosine Distance (`<=>`) query returns the correct identity within the $\ge 0.60$ threshold and respects the $\ge 0.05$ ambiguity gap.
*   **Spring $\leftrightarrow$ Smart Access:**
    *   Fire a mock `IdentityVerifiedEvent` from the Face Module.
    *   Assert the Smart Access module receives it, processes curfew rules, and fires an `AccessGrantedEvent` or `AccessDeniedEvent`.

---

## 5. Security Testing Strategy
*   **Unauthorized Access:** Attempt to call Python endpoints directly from the public internet. *Expected Result:* Connection Refused (Network isolation).
*   **Permission Validation:** Attempt to call `POST /api/v1/admin/face/approve` using a token with only `STUDENT_ROLE`. *Expected Result:* HTTP 403 Forbidden.
*   **API Abuse:** Hit the Python API with missing `X-API-Key` headers. *Expected Result:* HTTP 401 Unauthorized.
*   **SSRF Protection:** Submit an `imageUrl` pointing to `http://localhost:8080/admin/secrets`. *Expected Result:* Rejected by Python URL validation blocklist.

---

## 6. Performance Testing Strategy
*   **Embedding Generation (Locust/JMeter):** Fire 50 concurrent requests containing 100KB JPEGs to the Python AI container (CPU limit `2.0`). Assert 95th percentile (P95) latency remains $< 500ms$.
*   **Database Search Latency:** Seed `pgvector` with 5,000 mock embeddings. Execute vector similarity searches. Assert query time is $< 20ms$ using HNSW indexing.
*   **Memory Leaks:** Run sustained load for 2 hours. Assert Python Docker container memory consumption stabilizes $\le 1GB$ and does not OOMCrash.

---

## 7. Failure Testing Strategy (Chaos Engineering)
*   **AI Offline:** Shut down the Python container. Trigger an access request from Java. *Expected Result:* Java hits 1000ms timeout, throws `System Offline`, triggers "Fail Closed", Gate remains locked.
*   **Network Timeout:** Simulate 2000ms network delay. *Expected Result:* Java aborts at 1000ms. Gate remains locked.
*   **Invalid Image:** Upload a `.txt` file renamed to `.jpg`. *Expected Result:* Python fails to decode, returns `ERR_INVALID_IMAGE` (HTTP 400).
*   **Corrupted Payload:** Send malformed JSON to Java. *Expected Result:* HTTP 400 Bad Request.

---

## 8. Regression Testing Strategy
*   Automated CI/CD Pipeline execution on every Pull Request.
*   All Unit and Integration tests MUST pass before code is merged to the `develop` branch.
*   Before deploying a new version of the AI Model (e.g., `v2`), a regression suite must verify that the `modelVersion` field dynamically updates and that the Java backend can simultaneously handle `v1` and `v2` vectors during the migration phase.

---

## 9. Test Environment Matrix

| Environment | Purpose | Infrastructure | Mocking Allowed? |
| :--- | :--- | :--- | :--- |
| **DEV** | Rapid iterations, local debugging. | Local Docker Compose (Python + DB). | Yes (External APIs). |
| **UAT** | User Acceptance, Admin workflow validation. | Cloud VM with Nginx, strict network rules. | No. Real models, static test data. |
| **PRODUCTION-LIKE** | Load Testing, Chaos Testing. | Exact replica of Production Hardware/CPU limits. | No. Full end-to-end integration. |

---

## 10. Implementation Readiness

**QA Readiness Evaluation:**
*   Clear boundaries for Unit, Integration, and Performance tests are established.
*   Security and Disaster Recovery test cases directly trace back to Architectural Governance (`FACE-AI-03`, `FACE-CODE-02`).

**Final Decision: PASS** ✅

---

## FINAL DECISION

**Testing Strategy Complete?**
**YES.** 🟢

The QA/UAT Test Strategy meticulously covers all components of the Face Recognition subsystem without overstepping into architectural redesign. The QA team is ready to commence writing detailed Acceptance Test Scenarios.

