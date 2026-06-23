# FACE-BACKEND-01A: Face Domain Governance Refinement Audit

## 1. Executive Summary
This governance audit evaluates the initial implementation blueprint drafted in `FACE-BACKEND-01` to identify subtle architectural boundary violations, anti-patterns, and missing administrative capabilities. This phase ensures the Face Module adheres strictly to Domain-Driven Design (DDD) principles within the SDMS Modular Monolith.

## 2. Governance Review Findings

### 2.1 Event Ownership
- **Finding:** The previous blueprint indicated that `FacePhotoUploadedEvent` would be published by the "Student Controller."
- **Governance Violation:** Spring Web Controllers must never publish Application or Domain Events. Controllers are an infrastructure boundary responsible only for HTTP translation.
- **Recommended Refinement:** Events must exclusively be published by the **Service Layer** (e.g., `FaceProfileService`) after the database transaction has been successfully prepared, utilizing `@TransactionalEventListener` rules.

### 2.2 Embedding Ownership & Boundary Encapsulation
- **Finding:** The blueprint proposed publishing `FaceEmbeddingExtractedEvent` to the `Smart Access` module.
- **Governance Violation:** This is a severe Domain Leak. The 512-dimension vector array is a highly specific, internal implementation detail of the `Face` AI domain. The `Smart Access` module does not care about AI math; it only cares whether a student is biometrically cleared for physical entry.
- **Recommended Refinement:** The Face Module must never expose raw embeddings via events. Instead, it should publish a business-level event such as `FaceSyncReadyEvent(studentId)`. The IoT synchronizer can then securely fetch the necessary vector from an internal Face Service interface, ensuring the raw data structure never contaminates other domain contexts.

### 2.3 Storage & Retention Ownership
- **Finding:** The storage lifecycle of `faceImageUrl` was undefined in the original blueprint.
- **Governance Violation:** Missing data retention policies. If a face photo is rejected by the admin, or if a student re-registers, the old image remains perpetually stored on the CDN (Cloudinary), leading to bloated storage costs and GDPR/privacy violations.
- **Recommended Refinement:** 
  1. The `Face` module must command the `Upload` infrastructure to delete the raw image asset when a `FaceProfile` is marked as `REJECTED`.
  2. Temporary holding mechanisms must be used before approval.

### 2.4 Admin Review Workflow (Missing Components)
- **Finding:** The previous blueprint only provided endpoints for `/approve` and `/reject`, completely ignoring how admins discover those profiles.
- **Governance Violation:** A functional Admin UI cannot operate without query capabilities. An administrator cannot approve a profile if they cannot fetch the pending queue.
- **Recommended Refinement:** The following APIs MUST be added to the blueprint:
  - `GET /api/v1/admin/face/profiles/pending` (Paginated list of profiles awaiting approval).
  - `GET /api/v1/admin/face/profiles` (Search endpoint filtered by student ID, status, or date).
  - `POST /api/v1/admin/face/profiles/bulk-approve` (For operational efficiency when reviewing hundreds of students).

## 3. Impact Analysis Matrix

| Refinement Area | Technical Impact | Business Impact | Severity |
| --- | --- | --- | --- |
| Move Event Publisher to Service | Decouples HTTP from Domain logic. Ensures transactional consistency. | None | HIGH |
| Prevent Embedding Event Leak | Protects Smart Access from AI coupling. Allows swapping AI engines safely. | Improved system stability. | CRITICAL |
| Implement Storage Deletion | Requires async integration with the `upload` service during rejection. | Reduces CDN costs; ensures strict biometric privacy compliance. | HIGH |
| Add Admin Query APIs | Expands Controller and Repository layer implementation effort. | Admins can actually perform their job without database hacking. | CRITICAL |

## Final Decision
**PASS WITH FIXES**
The `FACE-BACKEND-01` blueprint was a solid foundation, but this refinement successfully caught major Domain-Driven Design leaks (Controller publishing, AI Vector leaking) and critical missing functional requirements (Admin Queues, Asset Deletion). The backend implementation team MUST incorporate these refinements before writing any code.
