# FACE-REPLACEMENT-RUNTIME-GOVERNANCE-01

## 1. Runtime Analysis

**Scenario:** A student with an `APPROVED` face and `ACTIVE` embedding wants to update their photo.

**Question 1: Should the currently approved face remain usable?**
- **User Experience:** Disabling the current face immediately (Option A) locks the student out of their dormitory until an Admin reviews the new photo. In a residential environment (weekends, nights), this is a catastrophic UX failure. Option B (Keep active) ensures seamless access continuity.
- **Security:** The student is initiating the change (e.g., got new glasses, better lighting). Their old face is still biologically theirs. There is zero security risk in keeping the old face active during the review window. (If a face needs to be forcibly removed for security, Admins use the `Revoke` flow, which is separate).
- **Operational Cost:** Option A forces Admins to maintain SLA-level response times for photo approvals. Option B allows asynchronous, low-pressure Admin reviews.
- **SDMS Reality:** A dormitory access system must prioritize uninterrupted resident access. Option B is the only logically viable runtime model for SDMS.

## 2. Candidate Models for Option B

How do we represent a pending replacement without breaking the `APPROVED` state?

- **Candidate A (`APPROVED -> PENDING`):** Fails. Changing the aggregate status to `PENDING` inherently implies the primary access is pending. The system relies on `APPROVED` to maintain gate validity.
- **Candidate B (New Entity `FaceReplacementRequest`):** A separate table tracking `profile_id`, `new_image_url`, `status`. Keeps `FaceProfile` pristine, but adds relational complexity and transaction overhead.
- **Candidate C (Field Addition `pendingFaceImageUrl`):** Add a nullable `pendingFaceImageUrl` to `FaceProfile`. The status remains `APPROVED`. Admin review operations check this field. This is the most elegant Modular Monolith approach, keeping the aggregate tightly bounded.

**Question 3: Embedding Governance**
Under Option B, the old embedding MUST **remain active**. The gate needs a valid vector to grant access while the new photo is pending. The embedding is only deleted and replaced *after* the Admin approves the new photo.

## 3. Recommended Model

**The "Seamless Replacement" Model (Candidate C)**

1. **State:** `FaceProfile` remains `APPROVED`.
2. **Data:** `pendingFaceImageUrl` stores the newly uploaded CDN link.
3. **Runtime:** Gate verification continues uninterrupted using the old `FaceEmbedding`.
4. **Approval:** Admin approves -> `faceImageUrl` = `pendingFaceImageUrl`, `pendingFaceImageUrl` = `null`. Old `FaceEmbedding` is deleted. AI Orchestrator generates new embedding.
5. **Rejection:** Admin rejects -> `pendingFaceImageUrl` = `null`. Old `FaceProfile` and `FaceEmbedding` remain perfectly intact.

## 4. Required Changes & Governance Impact

### 4.1 Entity Changes (`FaceProfile`)
- Add `String pendingFaceImageUrl`.

### 4.2 Event Catalog Updates
The current catalog cannot support this without conflating "New Registration Approval" with "Replacement Approval". New events are strictly justified:
- `FaceReplacementRequestedEvent(profileId)`: Informs Admin/Notification module.
- `FaceReplacementApprovedEvent(profileId)`: Triggers AI Orchestrator to drop old embedding and generate new one.
- `FaceReplacementRejectedEvent(profileId, reason)`: Notifies student to retry, but assures them their old face still works.

### 4.3 Service Layer Updates
- `FaceProfileService` needs new commands: `requestReplacement()`, `approveReplacement()`, `rejectReplacement()`.
- `FaceAiOrchestrator` must listen to `FaceReplacementApprovedEvent` in addition to `FaceProfileApprovedEvent`.

### 4.4 IoT Runtime & Embeddings
- **Zero Impact** during the pending phase. The IoT gate is completely unaware a replacement is occurring. Access is preserved.

## 5. Final Decision

**NEEDS USER CONFIRMATION**

**Confidence Level:** 99% for Business Logic (Seamless Replacement is overwhelmingly the correct UX for a Dormitory).
**Reason for Confirmation:** Implementing this requires modifying the `FaceProfile` Entity (adding `pendingFaceImageUrl`) and the `FaceProfileService` interface, both of which were explicitly frozen in Phase `01A` and `01C`. 

The architecture evidence dictates that the previous "Revoke -> Re-upload" policy is hostile to resident UX. However, breaking a frozen Domain Entity constraint requires your explicit architectural override. 

Do you approve mutating `FaceProfile` and introducing the Replacement Workflow?
