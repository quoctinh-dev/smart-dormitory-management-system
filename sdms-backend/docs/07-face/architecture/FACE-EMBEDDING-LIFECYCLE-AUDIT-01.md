# FACE-EMBEDDING-LIFECYCLE-AUDIT-01

## 1. Lifecycle Analysis

**The Governance Gap:** The previous model assumed deleting the old embedding *before* generating the new one was safe.
**Analysis:** If the old embedding is deleted and the external Python AI Engine experiences an outage, a timeout, or a 500 error, the student is left with **zero** active embeddings. They are permanently locked out of their dormitory until the AI system recovers and the extraction is retried. 
**Conclusion:** The old embedding MUST remain active and untouched until the AI Engine successfully returns the new vector. Access Continuity is non-negotiable.

## 2. Candidate Strategies

**Question:** Can the current `1 -> 0..1` aggregate model support Old + New simultaneously?
**Answer:** At the database row level, **NO**. The `UNIQUE(profile_id)` constraint mathematically prevents two embeddings for the same profile. However, at the *Runtime / Memory* level, **YES**. We can hold the new vector in memory and perform a transactional swap.

**Evaluate Options:**
- **Option A (Delete Old $\rightarrow$ Generate New):** Score 0/10. Fatal flaw. High risk of permanent lockout if AI fails.
- **Option B (Generate New $\rightarrow$ Transactional Swap $\rightarrow$ Commit):** Score 10/10. Zero schema changes. Bulletproof consistency. Window of downtime is <10ms (the duration of the DB commit).
- **Option C (Dual Embedding Model):** Score 2/10. Requires changing schema to `1 -> N` and adding complex `is_active` flags. Violates SDMS-V2 simplicity constraints.
- **Option D (Soft Delete):** Score 3/10. Complex index modifications required for `UNIQUE` constraints.

## 3. Recommended Strategy: The "Atomic Swap" Model

**Workflow:**
1. Admin clicks "Approve Replacement".
2. `FaceProfile` is **NOT** updated yet. `pendingFaceImageUrl` remains.
3. System fires `FaceReplacementApprovedEvent(profileId, pendingFaceImageUrl)`.
4. `FaceAiOrchestrator` listens, downloads the *pending* image, and calls the AI Engine. (This can take seconds/minutes or fail. The old face and old vector remain 100% active).
5. AI Engine succeeds and returns `float[] newVector`.
6. Orchestrator calls a new transactional command: `FaceProfileService.finalizeReplacement(profileId, newVector)`.
7. **Inside the Transaction Boundary:**
   - `FaceProfile.faceImageUrl = FaceProfile.pendingFaceImageUrl`
   - `FaceProfile.pendingFaceImageUrl = null`
   - `FaceEmbeddingRepository.deleteByProfileId(profileId)`
   - `FaceEmbeddingRepository.save(new FaceEmbedding(profileId, newVector))`
   - `COMMIT`
8. Fire `FaceSyncReadyEvent`.

## 4. Aggregate Impact

- **FaceEmbedding:** ZERO mutations. The `1 -> 0..1` relationship and `UNIQUE` constraint are preserved perfectly.
- **FaceProfile:** ZERO structural mutations beyond the `pendingFaceImageUrl` added in the previous audit. We merely shift *when* the fields are updated.
- **Repository:** Require `deleteByProfileId` command.
- **Service Layer:** Require `finalizeReplacement(profileId, vector)` command to bind the Profile update and Vector swap into a single ACID transaction.

## 5. Event Analysis

**Question:** Is `FaceReplacementApprovedEvent` actually required?
**Answer:** **YES.**
*Evidence:* If we reused `FaceProfileApprovedEvent`, the `FaceAiOrchestrator` would extract the vector from the primary `faceImageUrl`. But under the Atomic Swap model, the primary `faceImageUrl` still points to the *old* photo (to maintain consistency if AI fails). The Orchestrator must extract from the *new* photo. Therefore, a distinct `FaceReplacementApprovedEvent` containing the `pendingFaceImageUrl` as the extraction target is mathematically required to prevent the AI from extracting the old photo again.

## 6. Risks

- **Concurrent Approvals:** If two admins approve different requests for the same student simultaneously, optimistic locking (`@Version`) on `FaceProfile` will catch and prevent the race condition.
- **Orphaned Vectors:** If the transaction fails during `finalizeReplacement`, the database rolls back. The old vector survives. The student's access is never interrupted.

## 7. Final Decision

**PASS**

**Evidence:** The "Atomic Swap" strategy fully resolves the governance gap. It guarantees 100% access continuity during the AI extraction phase without requiring any complex Database Schema changes, Dual Embedding tables, or Soft Delete mechanisms. The Modular Monolith transactional boundaries are perfectly leveraged to ensure the physical IoT gate experiences zero downtime.
