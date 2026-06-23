> [!WARNING] 
> STATUS: PLANNED (Not Implemented)

# FACE-BACKEND-05A: Code Generation Readiness Remediation

## 1. Executive Summary
This document serves as a remediation audit for `FACE-BACKEND-05`. It eliminates remaining ambiguities before code generation by explicitly defining permissions, expanding the DTO catalog, formalizing integration protocols, and detailing the custom repository queries. No application code is generated during this phase.

## 2. Remediation Execution

### FIX 1: Explicit Permission Catalog & Ownership Matrix
The ambiguous `FACE_REVIEW` permission has been deprecated. The permission catalog is now strictly defined as follows:

| Permission | Actor Ownership | Purpose |
| :--- | :--- | :--- |
| `FACE_REGISTER` | Student | Allows uploading or re-uploading a portrait photo. |
| `FACE_VIEW_SELF` | Student | Allows checking personal face profile status. |
| `FACE_VIEW_ALL` | Admin | Allows viewing the dashboard queue of all face profiles. |
| `FACE_APPROVE` | Admin | Allows transitioning a profile to `APPROVED`. |
| `FACE_REJECT` | Admin | Allows transitioning a profile to `REJECTED`. |
| `FACE_REVOKE` | Admin | Allows revoking an already `APPROVED` profile. |

### FIX 2: Expanded DTO Catalog
To prevent arbitrary DTO generation, the contract is locked as follows:

#### Student DTOs
1. **`FaceRegistrationRequest`**
   - **Purpose**: Input for student photo upload.
   - **Fields**: `faceImageUrl` (String)
   - **Producer**: Student Mobile App
   - **Consumer**: `FaceStudentController`

2. **`FaceProfileResponse`**
   - **Purpose**: Return student's own registration status.
   - **Fields**: `profileId` (UUID), `status` (String), `faceImageUrl` (String), `rejectionReason` (String)
   - **Producer**: `FaceProfileService`
   - **Consumer**: Student Mobile App

#### Admin DTOs
3. **`FaceAdminQueueResponse`**
   - **Purpose**: Aggregated view for admin dashboard review.
   - **Fields**: `profileId` (UUID), `studentId` (UUID), `studentName` (String, via `StudentQueryPort`), `status` (String), `faceImageUrl` (String), `createdAt` (DateTime)
   - **Producer**: `FaceProfileService`
   - **Consumer**: Admin Web Portal

4. **`FaceReviewRequest`**
   - **Purpose**: Input for rejecting or revoking a profile.
   - **Fields**: `rejectionReason` (String)
   - **Producer**: Admin Web Portal
   - **Consumer**: `FaceAdminController`

#### Internal DTOs
5. **`AiExtractionRequest`**
   - **Purpose**: Payload sent to AI Engine.
   - **Fields**: `profileId` (UUID), `imageUrl` (String)
   - **Producer**: `FaceAiOrchestrator`
   - **Consumer**: AI Engine

6. **`AiExtractionResponse`**
   - **Purpose**: Response from AI Engine.
   - **Fields**: `vector` (List<Float>)
   - **Producer**: AI Engine
   - **Consumer**: `FaceAiOrchestrator`

### FIX 3: Internal API Contract Clarification
Integration mechanisms are explicitly bound to prevent transport mismatches:

| Interaction | Protocol / Transport | Direction | Producer | Consumer |
| :--- | :--- | :--- | :--- | :--- |
| **Extract Vector** | HTTP (`POST`) | Outbound | `FaceAiOrchestrator` | Python AI Engine |
| **Verify Face (Gate)** | HTTP (`POST`) | Inbound | IoT Edge Camera | `FaceVerificationController` |
| **Unlock Command** | MQTT Topic | Outbound | Smart Access Module | IoT Gate Relay |
| **Biometric Ready** | Spring Domain Event | Internal | `FaceAiOrchestrator` | Smart Access Module |
| **Match Success** | Spring Domain Event | Internal | `FaceVerificationService`| Smart Access Module |
| **Student Info** | Internal Service Call | Internal | Face Module | `StudentQueryPort` |

### FIX 4: Repository Custom Query Inventory
Custom queries must be implemented to support the exact business use cases:

1. **Pending Approval Queries (`FaceProfileRepository`)**
   - `Page<FaceProfile> findByStatusOrderByCreatedAtAsc(String status, Pageable pageable)`
   - *Use*: Admin Dashboard FIFO queue.

2. **Verification History Queries (`FaceVerificationAttemptRepository`)**
   - `Page<FaceVerificationAttempt> findByProfileIdOrderByAttemptedAtDesc(UUID profileId, Pageable pageable)`
   - *Use*: Audit logs for a specific student.

3. **Vector Similarity Queries (`FaceEmbeddingRepository`)**
   - `Optional<UUID> findNearestProfile(List<Float> vector, double threshold)`
   - *Implementation*: Native SQL using `pgvector` (`ORDER BY vector <=> ? LIMIT 1`).

4. **Administrative Search Queries (`FaceProfileRepository`)**
   - `Optional<FaceProfile> findByStudentId(UUID studentId)`
   - *Use*: Guaranteeing 1:1 validation during registration and lookup.

## Final Decision
**READY**
All gaps have been closed. The granular definitions for Permissions, DTOs, Transports, and Queries eliminate any remaining ambiguity. The Face Domain is unequivocally cleared for `SPRING-CODEGEN-FACE-01`.
