> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-AI-02: AI Model Selection & Configuration Audit

## 1. Executive Summary
This document defines and freezes the AI Model Selection, Embedding Strategy, and Operational Thresholds for the SDMS Face Recognition Domain. It strictly adheres to the Bounded Context principles established in the ACCESS Governance (AC-01 $\rightarrow$ AC-15A) and the recent FACE-REMEDIATION-02 alignment.

**Overall Audit Result: PASS** ✅

---

## 2. AI Provider Selection
We evaluated three leading open-source facial recognition architectures: FaceNet, ArcFace, and InsightFace.

* **FaceNet:** Older architecture, lower accuracy on masked/angled faces. Good community support but outdated models.
* **ArcFace:** Excellent loss function architecture yielding state-of-the-art accuracy, but requires manual implementation wrappers.
* **InsightFace:** An integrated, production-ready library that utilizes ArcFace (and other models) under the hood. It provides pre-trained models (e.g., Buffalo_l) optimized for immediate deployment.

**Decision:**
* **Recommended Provider:** **InsightFace (with ArcFace model)**
* **Accuracy:** >99.6% on standard LFW datasets. Excellent robustness against varied lighting and angles.
* **Ease of Deployment:** High. Provides an official Python package with simple extraction pipelines.
* **Community Support:** Outstanding, backed by extensive research and active repositories.

---

## 3. Embedding Strategy
* **Embedding Dimension:** `512`
* **Output Format:** 1D array of 512 floating-point numbers (`float32`).
* **Storage Format:** PostgreSQL `vector(512)` using the `pgvector` extension.
* **Compatibility Verification:** Perfectly compatible with the `student_face_embeddings` table design. The PostgreSQL HNSW index operates natively on 512d vectors using Cosine Distance.

---

## 4. Threshold Governance & Ownership
Determining the balance between Security (False Acceptance) and Convenience (False Rejection).

* **Match Threshold (Cosine Similarity):** Recommended baseline $\ge 0.60$.
* **Ambiguity Gap:** The difference between the Top 1 match and Top 2 match must be $\ge 0.05$ to prevent false positives for twins or similar faces.
* **False Acceptance Risk (FAR):** Minimized by the strict $0.60$ threshold and the Ambiguity Gap rule.
* **False Rejection Risk (FRR):** Minimized by enforcing live, well-lit photo captures during the Student Registration phase.

**Ownership Boundaries:**
* **AI Service:** Owns nothing related to thresholds. It merely calculates the embedding.
* **Face Module:** Owns the `pgvector` threshold matching logic. It queries the DB, enforces the $\ge 0.60$ threshold, and publishes `IdentityVerifiedEvent`.
* **Smart Access Module:** Consumes the identity event and enforces business rules (Curfew, Status) to grant or deny access.

---

## 5. AI Service Responsibility Boundary
To strictly adhere to the MANDATORY FREEZE, the responsibilities are defined as follows:

**AI Service ONLY owns:**
* Face Detection
* Face Alignment
* Embedding Extraction
* **Input:** Image
* **Output:** `float[512]`

**AI Service MUST NOT own:**
* Similarity Search
* Vector Database Access
* `pgvector` Query
* Threshold Evaluation
* Identity Verification
* Student Lookup
* Access Decision
* Curfew
* MQTT

**Face Module owns:**
* `pgvector` Similarity Search
* Threshold Evaluation
* Ambiguity Gap Evaluation
* `IdentityVerifiedEvent`
* `IdentityVerificationFailedEvent`

---

## 6. Model Version Governance
Face embeddings are mathematically bound to the exact weights of the neural network that generated them. A vector from `ArcFace-v1` cannot be compared to a vector from `ArcFace-v2`.

**Design Strategy:**
* The `student_face_embeddings` table includes a `modelVersion` column (e.g., `InsightFace-Buffalo-l-v1`).
* If a new, more accurate model is released, the existing embeddings are not modified or overwritten.

---

## 7. Future Upgrade Audit (Migration Path)
Upgrading from `v1` to `v2` without breaking existing gates or causing system downtime:
1. **Side-by-Side Storage:** Deploy the new AI Service (`v2`).
2. **Batch Re-extraction:** A background job fetches the original `faceImageUrl` of all `APPROVED` profiles from the DB.
3. **Regeneration:** The new AI Service extracts `v2` embeddings from the original images.
4. **Insertion:** The new embeddings are saved as new rows in `student_face_embeddings` with `modelVersion = 'v2'`, alongside the existing `v1` records.
5. **Switchover:** The Face Module configurations are updated to query `modelVersion = 'v2'`. If successful, `v1` records can be archived or deleted. No student is required to re-register.

---

## 8. FastAPI Contract Review
The Python AI Service API contract is strictly validated against ACCESS Governance.

* **Exposed Endpoint:** `POST /api/v1/ai/extract` (Accepts Image URL or Base64, returns `[float, float, ...]`).
* **Governance Check:**
  * ❌ No Access Decision logic present.
  * ❌ No Curfew logic present.
  * ❌ No Student Status logic present.
  * ❌ No MQTT connection libraries installed in the Python service.

---

## 9. Hardware Requirement Audit
Evaluating deployment hardware for a Dormitory Scale (e.g., 500 - 2,000 residents, 2-4 entrance gates).

* **GPU (NVIDIA T4 / RTX):** Provides sub-10ms extraction. Overkill and highly expensive for standard dormitory traffic unless dealing with massive crowd flows (e.g., stadiums).
* **CPU Only (Intel/AMD with ONNX Runtime):** Extraction takes ~100ms - 200ms per face. 
* **Recommendation:** **CPU Only** deployment using ONNX Runtime optimized for C++ execution within Python. For 2-4 gates, even if 4 students scan simultaneously, the queue wait time is under 1 second, which is perfectly acceptable for dormitory access and highly cost-effective.

---

## 10. Final Conclusion
**Decision: PASS**

The AI Model strategy utilizing InsightFace (ArcFace), 512-dimension vectors, CPU-based extraction, and strict segregation of threshold logic to the Java backend complies perfectly with SDMS Architectural Governance. The design is finalized and ready for the `FACE-AI-03` operational specs and subsequent `FACE-APP-01` implementation.

