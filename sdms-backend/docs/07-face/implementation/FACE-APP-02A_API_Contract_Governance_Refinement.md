> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-APP-02A: API Contract Governance Refinement

## 1. Executive Summary
This document serves as an addendum to the `FACE-APP-02` API Contract, applying strict governance refinements regarding Image Input security, Diagnostic Metadata, and Vector Output compatibility.

**Overall Refinement Result: PASS** ✅

---

## 2. Image Input Governance (SSRF Prevention)
**Status: Frozen**

To protect the internal network from Server-Side Request Forgery (SSRF) and malicious file execution, the FastAPI service must adhere to strict input constraints:
* **Allowed:** `imageBase64` payload or an **Internal Pre-Signed URL** (e.g., restricted S3 Bucket or Cloudinary link with short expiration).
* **Forbidden:** External URL fetching and public internet image downloading.
* **Rationale:** The AI Service must not act as an open proxy capable of making arbitrary HTTP GET requests to the outside world or internal IP ranges.

---

## 3. Confidence Field Governance
**Status: Frozen**

The `confidence` float value returned by the Face Detection module must be treated strictly as internal metrics.
* `confidence` is **Diagnostic Metadata only**.
* `confidence` **MUST NOT** be used by the Frontend UI to show success probabilities.
* `confidence` **MUST NOT** be used by the Smart Access Module or Authorization Logic to make partial-access decisions.
* **Identity decisions** remain strictly inside the Face Module (`pgvector` distance logic).
* **Access decisions** remain strictly inside the Smart Access Module (Curfew/Status logic).

---

## 4. Embedding Contract Governance
**Status: Frozen**

The current API represents a hard contract with the `pgvector` schema in the Java backend.
* **v1 Contract:** Output is strictly `float[512]`.
* **Future Upgrade Strategy:** Any change to the embedding dimension (e.g., upgrading from `512` $\rightarrow$ `1024`) breaks the database schema. Therefore, such an upgrade **requires** a new endpoint: `/api/v2/`.
* **Backward Compatibility:** `v1` (`float[512]`) and `v2` (e.g., `float[1024]`) must be preserved concurrently to allow the Java Backend to perform safe batch migrations without downtime.

---

## Final Decision
**PASS** ✅
All governance refinements have been successfully injected into `FACE-APP-02_FastAPI_API_Contract_And_DTO_Design.md`. The API Contract is now securely locked down.

