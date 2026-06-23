# FACE-DOMAIN-MUTATION-AUDIT-01

## 1. Mutation Summary

The "Seamless Replacement" model is highly elegant and minimizes structural disruption. By isolating the "pending replacement" concept within the `FaceProfile` aggregate, we achieve seamless IoT Runtime continuity without requiring new Database tables, new Aggregates, or complex State Machine overhauls. The mutations are contained entirely within the Face Domain boundary.

## 2. Aggregate Impact

**Target Aggregate:** `FaceProfile`
The current aggregate cannot natively support dual images (Active + Pending).
**Minimal Mutation Required:**
- `pendingFaceImageUrl` (String, Nullable): Stores the uploaded image CDN link awaiting Admin review.
- `replacementRequestedAt` (LocalDateTime, Nullable): Tracks the timestamp of the request to maintain a FIFO queue for Admins.

*Justification:* Modifying the existing aggregate with nullable fields is infinitely cleaner than spawning a separate `FaceReplacementRequest` entity, which would require cross-table `JOIN`s for basic profile queries and complicate the `1 -> 0..1` relationships.

## 3. State Machine Impact

**Question:** Can Seamless Replacement work with existing states?
**Recommendation:** **Option A (Keep current states)**.

*Evaluate:* 
- **Complexity & Business Clarity:** If a student's photo is approved, their physical access rights are `APPROVED`. A pending photo update does not negate their right to enter the dorm.
- **Gate Isolation:** If we added `REPLACEMENT_PENDING`, any downstream logic that checks `status == APPROVED` would break or require updating to `status IN (APPROVED, REPLACEMENT_PENDING)`. 
- By keeping the status as `APPROVED`, we strictly separate *Access Authorization State* from *Profile Maintenance State*. The presence of a non-null `pendingFaceImageUrl` naturally acts as the maintenance flag.

## 4. Embedding Impact

**Current Constraint:** `FaceProfile 1 -> 0..1 FaceEmbedding`
**Question:** Can the old embedding remain active?
**Answer:** **YES.**

*Justification & Mutation:* 
Zero mutations are required for the `FaceEmbedding` aggregate. Because the `FaceProfile` ID does not change, and the status remains `APPROVED`, the existing embedding continues to represent the student's current valid identity at the gate. 
*Lifecycle:* When the Admin calls `approveReplacement()`, the Service will `DELETE` the old embedding and trigger the AI Orchestrator to generate a new one from the newly promoted `faceImageUrl`. 

## 5. Event Impact

**Question:** Can replacement workflow be expressed using existing events?
**Answer:** **NO.** We need distinct events to avoid confusing Notification routing (e.g., "Welcome" email vs "Photo Updated" email).

**Minimum New Events Required:**
- `FaceReplacementRequestedEvent(profileId)`: Informs Admin Queue / Notification module.
- `FaceReplacementRejectedEvent(profileId, reason)`: Notifies the student to try again, reassuring them their old access remains valid.
- `FaceReplacementApprovedEvent(profileId)`: Triggers the `FaceAiOrchestrator` to extract the new vector and notifies the student.

## 6. Service Impact

| Component | Impact Level | Description |
| :--- | :--- | :--- |
| **FaceProfileService** | Major Change | Add `requestReplacement`, `approveReplacement`, `rejectReplacement`. |
| **FaceVerificationService**| No Change | Gate logic remains entirely ignorant of the replacement workflow. |
| **FaceAiOrchestrator** | Minor Change | Must listen to `FaceReplacementApprovedEvent` alongside `FaceProfileApprovedEvent`. |
| **Repositories** | Minor Change | Add `findByPendingFaceImageUrlIsNotNull()` for Admin reviews. |
| **Student App** | Major Change | UI must allow "Update Photo" for `APPROVED` profiles. |
| **Admin Web** | Major Change | UI needs a split-view to compare "Current Face" vs "Pending Face". |
| **Notification Module** | Minor Change | Handle 3 new email/push event templates. |
| **IoT Runtime** | No Change | Zero disruption. |

## 7. Database Impact

**Schema Evolution is 100% Safe.**
- **New Columns:** `pending_face_image_url` (VARCHAR), `replacement_requested_at` (TIMESTAMP).
- **New Constraints:** None. The `UNIQUE(student_id)` constraint remains perfectly intact.
- **New Indexes:** B-Tree index on `pending_face_image_url` (Partial index where NOT NULL) or `replacement_requested_at` for fast Admin Queue retrieval.
- **New Tables:** None.

## 8. Freeze Compatibility

- **FACE DOMAIN FREEZE:** `Requires Refactor`. Must unfreeze `FaceProfile.java` to add the 2 new fields.
- **SERVICE FREEZE:** `Requires Refactor`. Must unfreeze `FaceProfileService.java` to add the 3 new methods.
- **DATABASE FREEZE:** `Compatible`. Just a standard additive schema migration (Flyway V2).

## 9. Risks

1. **Gate Latency Window:** During `approveReplacement()`, the old embedding is deleted before the AI Orchestrator async thread finishes extracting the new one. This creates a ~2 second window where the student physically cannot open the door. This is an acceptable network-level reality.
2. **Admin Queue Fragmentation:** Admins now have two queues to review: Initial Registrations (`status = PENDING`) and Replacements (`pendingFaceImageUrl IS NOT NULL`). UI design must handle this cleanly.

## 10. Final Decision

**PASS**

**Evidence:** The Seamless Replacement model is incredibly lightweight. It achieves a massive UX win for the Smart Dormitory without requiring new Database Tables, complex State Machine alterations, or disrupting the high-throughput IoT Runtime. The required mutations are purely additive (2 columns, 3 methods, 3 events) and do not violate any existing Architectural Constraints or Modular Monolith boundaries.

The Domain is fully capable of supporting this mutation safely.
