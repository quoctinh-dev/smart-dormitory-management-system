> [!WARNING] 
> STATUS: PLANNED (Not Implemented)

# FACE-BACKEND-05: Code Generation Readiness Audit

## 1. Executive Summary
This document provides the final architectural audit of the Face Domain before executing `SPRING-CODEGEN-FACE-01`. It verifies that all entities, services, events, and integration ports strictly conform to the Modular Monolith blueprint, the `ACTOR-MATRIX-01` boundaries, and all preceding remediation (`FACE-BACKEND-03A`, `FACE-BACKEND-04A`).

## 1. Entity Generation Readiness
**Status**: **READY**
- `FaceProfile`: Clearly defined with `profile_id`, `student_id` (UNIQUE), `status` Enum (`PENDING`, `APPROVED`, `REJECTED`, `REVOKED`), `face_image_url`, and `rejection_reason`.
- `FaceEmbedding`: Simplified per `03A` by removing `model_version`. Links via 1:1 `profile_id`. Uses `vector(512)` type.
- `FaceVerificationAttempt`: Auditing capabilities refined per `03A` by removing `capture_image_url` to respect IoT boundary.

## 2. Repository Readiness
**Status**: **READY**
- **Repository Contracts**: All three entities map to standard Spring Data `JpaRepository<T, UUID>`.
- **Custom Queries**: `FaceProfileRepository` supports `findByStudentId()` and `findByStatus()`.
- **pgvector Ownership**: `FaceEmbeddingRepository` natively owns the cosine similarity query.

## 3. Service Readiness
**Status**: **READY**
- **Methods**: `FaceProfileService` maps directly to register, approve, reject, and revoke.
- **Transactions**: Core logic wrapped in `@Transactional`. `FaceVerificationService` utilizes `REQUIRES_NEW` for immutable audit logging.
- **Event Publication**: Handled safely post-transaction via `ApplicationEventPublisher`.
- **Dependencies**: Tightly controlled. No cross-module repository injections allowed.

## 4. Controller Readiness
**Status**: **READY**
- **Student APIs**: `POST /api/v1/student/face/register` and `GET /api/v1/student/face/profile`.
- **Admin APIs**: `GET /api/v1/admin/faces/pending`, `POST /api/v1/admin/faces/{id}/approve`, `POST /api/v1/admin/faces/{id}/reject`, `POST /api/v1/admin/faces/{id}/revoke`.
- **Internal APIs**: AI callbacks and IoT verifications are decoupled via Spring context or private integration layers. Actor Matrix compliance is 100%.

## 5. DTO Readiness
**Status**: **READY**
- **Request DTOs**: `FaceRegistrationRequest` (Student), `FaceReviewRequest` (Admin - Reject/Revoke).
- **Response DTOs**: `FaceProfileResponse`, `FaceAdminQueueResponse`.
- **Internal DTOs**: Handled via internal domain events and internal ports.

## 6. Permission Readiness
**Status**: **READY**
- **Catalog**: `FacePermissions` constants (`FACE_REGISTER`, `FACE_REVIEW`) perfectly map to controller boundaries.

## 7. Event Readiness
**Status**: **READY**
- **Publishers**: `FaceProfileService`, `FaceVerificationService`, `FaceAiOrchestrator`.
- **Consumers**: `NotificationModule`, `SmartAccessModule`. 
- **Refinement**: `FacePhotoUploadedEvent` was successfully purged (per `04A`), and `confidenceScore` was successfully removed from `FaceMatchSuccessEvent` payload.

## 8. Database Readiness
**Status**: **READY**
- **Tables**: `face_profiles`, `face_embeddings`, `face_verification_attempts`.
- **Indexes**: Includes B-Trees for lookups and HNSW indexes for `pgvector`.
- **Constraints**: 1:0..1 uniqueness on `student_id` is enforced.
- **Migration Order**: Documented perfectly for the subsequent Flyway implementation phase.

## 9. Integration Readiness
**Status**: **READY**
- **Student**: Read models exclusively; no duplicated state; decoupled via `StudentQueryPort`.
- **Upload**: Deferred retention cleanup policies ensure robust auditability (per `04A`).
- **Notification**: Purely downstream event consumption.
- **Smart Access**: Reacts only to strictly vetted domain events.
- **AI Service**: Orchestrated via `FaceAiOrchestrator` acting as an HTTP Anti-Corruption Layer.

## 10. Code Generation Gaps
**Status**: **NONE DETECTED**
- **Missing Design**: All boundaries, logic, and data flows are completely accounted for.
- **Missing Contracts**: Internal ports and API specs are finalized.
- **Missing Decisions**: Audit scopes and data retention protocols have been formally concluded in Phase `03A` and `04A`.

## Final Decision
**READY**
The Face Domain architecture is completely solid, modular, and fully compliant with SDMS V1 specifications. It is cleared for immediate code generation (`SPRING-CODEGEN-FACE-01`).
