> [!WARNING] 
> STATUS: PLANNED (Not Implemented)

# FACE-BACKEND-02: Face Domain Physical Backend Design

## 1. Executive Summary
This document translates the theoretical blueprints into a strict, physical Spring Boot architectural design for the Face module. It is aligned with `ACTOR-MATRIX-01` and adheres to SDMS V1 constraints. **No actual code is generated; this is the physical layout schema.**

## 2. Package Structure (Folder Tree)
The module will strictly adhere to the SDMS standard Modular Monolith layered architecture inside `com.sdms.backend.modules.face`. No new bounded contexts are created.

```text
com.sdms.backend.modules.face
├── controller/
├── service/
├── repository/
├── entity/
├── dto/
├── mapper/
├── event/
├── permission/
└── exception/
```

## 3. Physical Components

### 3.1 Entity List (`entity`)
- `FaceProfile`: Aggregate root mapped to `face_profiles`. Uses `UUID` primary key. Includes `@OneToOne` reference to `student_id`.
- `FaceEmbedding`: Weak entity mapped to `face_embeddings`. Uses `UUID` primary key. Includes `@Type(type = "string-array")` or Hibernate-specific mapping for the 512-dimension pgvector array. Includes `@ManyToOne` referencing `FaceProfile`.
- `FaceVerificationAttempt`: Entity mapped to `face_verification_attempts` for audit trailing. Uses `UUID` primary key. Stores the history of verifications (verify success, verify fail) when gates query the AI Engine. 

### 3.2 Enum List (`entity` / `dto`)
- `FaceApprovalStatus`: `PENDING`, `APPROVED`, `REJECTED`, `REVOKED`

### 3.3 Repository List (`repository`)
- `FaceProfileRepository`: Extends `JpaRepository<FaceProfile, UUID>`. 
  - Custom queries: `findByStudentId()`, `findByStatus()`.
- `FaceEmbeddingRepository`: Extends `JpaRepository<FaceEmbedding, UUID>`.
  - Custom queries: `findByProfileId()`.
- `FaceVerificationAttemptRepository`: Extends `JpaRepository<FaceVerificationAttempt, UUID>`.

### 3.4 Service List (`service`)
- `FaceProfileService`: Handles core business logic (Upload, Approve, Reject, Revoke).
- `FaceAiOrchestrator`: Manages the HTTP interaction with the AI service (`POST /api/v1/ai/extract`) to generate embeddings.
- `FaceStorageService`: Abstraction interface strictly communicating with the `upload` module to delete rejected images.

### 3.5 Controller List (`controller`)
- `FaceStudentController`: 
  - `POST /api/v1/student/face/register` (Upload Face Photo, Re-Upload)
- `FaceAdminController`: 
  - `GET /api/v1/admin/faces/pending` (Review Photos Queue)
  - `POST /api/v1/admin/faces/{id}/approve` (Approve Photo)
  - `POST /api/v1/admin/faces/{id}/reject` (Reject Photo)
  - `POST /api/v1/admin/faces/{id}/revoke` (Revoke Active Profile)

### 3.6 DTO List (`dto`)
**Requests:**
- `FaceRegistrationRequest` (Contains `faceImageUrl` string)
- `FaceReviewRequest` (Contains `rejectionReason` string for Reject)

**Responses:**
- `FaceProfileResponse` (Contains `profileId`, `studentId`, `status`, `faceImageUrl`)
- `FaceAdminQueueResponse` (View for side-by-side dashboard review).

### 3.7 Permission Catalog (`permission`)
Defined in `FacePermissions.java`:
- `public static final String FACE_REGISTER = "hasAuthority('FACE_REGISTER')";`
- `public static final String FACE_REVIEW = "hasAuthority('FACE_REVIEW')";`

### 3.8 Event Catalog (`event`)
- `FacePhotoUploadedEvent`: Indicates a student has uploaded a face photo.
- `FaceProfileApprovedEvent`: Triggers the async `FaceAiOrchestrator`.
- `FaceProfileRejectedEvent`: Triggers CDN deletion.
- `FaceSyncReadyEvent`: Business event broadcasted to `Smart Access` stating a student is biometrically ready.

## 4. Integration Verification

### 4.1 Smart Access Integration
- **Mechanism:** Asynchronous Event Listening.
- **Contract:** Smart Access listens for `FaceSyncReadyEvent(studentId)`. It does **not** receive the 512d vector directly. It updates the gate access state to `BIOMETRIC_ENABLED`.

### 4.2 Upload Integration
- **Mechanism:** Synchronous Service Call (Infrastructure Boundary).
- **Contract:** When `FaceProfileRejectedEvent` is fired, `FaceStorageService` invokes the `upload` module to delete the image from Cloudinary, ensuring privacy compliance.

### 4.3 Student Integration
- **Mechanism:** Database State sync.
- **Contract:** When `FaceProfileApprovedEvent` is fired, an event listener in the `Student` module sets `isFaceRegistered = true` on the core student entity.

### 4.4 Notification Integration
- **Mechanism:** Asynchronous Event Listening.
- **Contract:** The Notification module consumes `FaceProfileRejectedEvent` and `FaceProfileApprovedEvent`. **The Face module has NO dependency on the Notification module.** Notification is purely a downstream consumer of Face events.

## 5. Dependency Matrix

| Interacting Module | Direction | Type | Encapsulation Status |
| --- | --- | --- | --- |
| `student` | Outbound | Event | PASS (Decoupled) |
| `upload` | Outbound | Method Call | PASS (Infrastructure Boundary) |
| `smartaccess` | Outbound | Event | PASS (Vector hidden) |
| `notification`| Outbound | Event | PASS (Notification consumes Face events) |

## 6. Implementation Order
1. Entities & Enums.
2. Repositories.
3. Security Permission Constants.
4. Application Events (Publishers).
5. Services (Core logic + AI Orchestrator).
6. Mappers & DTOs.
7. Controllers.
