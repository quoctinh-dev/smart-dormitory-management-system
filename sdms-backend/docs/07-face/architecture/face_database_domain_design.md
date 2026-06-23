> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Database & Domain Model Design (v1.0)

This document defines the database architecture, domain models, and module decoupling strategy for the Face Recognition module in the Smart Dormitory Management System (SDMS).

---

## 1. Executive Summary

This design standardizes the separation between the physical identity (`Student`) and the biometric metadata (`FaceProfile`, `FaceEmbedding`). It enforces modularity constraints by ensuring no AI vector data is stored in the core `Student` table, keeping all matching and AI configurations encapsulated within the **Face Module**.

---

## 2. Domain Boundary Matrix

| Module | Owned Entities | Data Attributes |
| :--- | :--- | :--- |
| **STUDENT** | `Student` | `studentId`, `faceImageUrl`, `isFaceRegistered` |
| **FACE** | `FaceProfile`, `FaceEmbedding` | `profileId`, `embeddingId`, `vector` (512d), `status` |
| **IOT** | `GateDevice` | `deviceId` |
| **SMART ACCESS** | `AccessHistory` | `accessId`, `studentId`, `decision`, `denialReason` |
| **AUTH** | `UserAccount` | `accountId`, `username`, `email`, `role`, `status` |

---

## 3. Face Domain Model

### 3.1 FaceProfile (Aggregate Root)
Represents the student's face registration record and approval lifecycle:
* `profileId` (UUID, Primary Key)
* `studentId` (UUID, Foreign Key referencing `Student`, Unique)
* `faceImageUrl` (VARCHAR, stores the approved portrait image URL)
* `status` (Enum: `FaceApprovalStatus` - `PENDING_APPROVAL`, `APPROVED`, `REJECTED`)
* `rejectionReason` (VARCHAR, nullable)

### 3.2 FaceEmbedding (Entity under FaceProfile)
Holds the high-dimensional vector representations computed by the AI model:
* `embeddingId` (UUID, Primary Key)
* `profileId` (UUID, Foreign Key referencing `FaceProfile`, Cascade Delete)
* `vector` (vector(512) - float array representing the face embedding)
* `modelVersion` (VARCHAR, version of the AI model, e.g., 'ArcFace-v2')

---

## 4. Face Registration Data Flow

```
Student App ──(Upload Image)──> STUDENT Module (saves url)
                                       │
                                       ▼ (Publish FacePhotoUploadedEvent)
                                  FACE Module
                                       │
                                       ▼ (Create FaceProfile: PENDING_APPROVAL)
                                Admin Review
                                       │
                                       ▼ (Approve & Extract Embedding)
                                  FACE Module (creates FaceEmbedding & sets APPROVED)
                                       │
                                       ▼ (Publish FaceProfileApprovedEvent)
                                STUDENT Module (sets isFaceRegistered = true)
```

---

## 5. Face Approval Lifecycle

The `status` attribute of `FaceProfile` manages the approval workflow:
* **`PENDING_APPROVAL`:** Triggered immediately when a student uploads a new image. The photo is awaiting manual validation by KTX managers.
* **`APPROVED`:** Triggered when the manager confirms the photo match. This state initiates AI extraction, generates the `FaceEmbedding` record, and enables gate synchronization.
* **`REJECTED`:** Triggered if the manager rejects the photo due to low quality, blur, or incorrect identity. Student is notified to re-register.

---

## 6. Face Embedding Storage Strategy

* **Option B (Separate FaceEmbedding Table under Face Module)** is selected as the optimal architecture.
* **Justification:**
  1. **Strict Decoupling:** Keeps large vector objects out of the lightweight transactional `Student` table, preventing OLTP performance degradation.
  2. **Dedicated Indexing:** Allows PostgreSQL to apply HNSW (Hierarchical Navigable Small World) index structures on the vector column independently.
  3. **AI Upgradability:** If the AI model changes (e.g. migrating from ArcFace 512d to a newer 1024d model), schema modifications are isolated to the `FaceEmbedding` table without affecting the Student Module.

---

## 7. Face Matching Architecture

```
KTX Gate Camera ──(Frame Capture)──> Face Engine Client
                                          │
                                          ▼ (Extract Frame Embedding)
                                     SQL Vector Query (pgvector)
                                          │
                                          ▼
                                     Match Result (Cosine Similarity >= 0.8)
                                          │
                                          ▼ (IdentityVerifiedEvent)
                                     Smart Access Module (Policy Evaluation)
                                          │
                                          ▼ (AccessGrantedEvent)
                                     Gate Unlock Command (MQTT)
```
*Matching Query Example:*
```sql
SELECT profile_id, (vector <=> ?::vector) AS distance 
FROM student_face_embeddings 
WHERE status = 'APPROVED'
ORDER BY distance ASC 
LIMIT 1;
```

---

## 8. Gate Access Architecture

1. Face Module successfully matches the vector $\rightarrow$ fetches `studentId`.
2. Face Module publishes `FaceMatchSuccessEvent` containing `studentId` and `gateId`.
3. **Smart Access Module** consumes event, evaluates `Student.status` (currently checked-in and residing), `UserAccount.status`, Curfew, and Time Window.
4. If valid $\rightarrow$ Smart Access Module publishes `AccessGrantedEvent` and records `AccessHistory`.
5. **IoT Module** consumes `AccessGrantedEvent` and publishes MQTT open command to the ESP32 gate topic.

---

## 9. Access Log Design

Every gate entry attempt is recorded in `access_history` (owned by Smart Access Module):
* Face Module does not own access logs. Face Module only owns `face_verification_history`.
* IoT Module does not own access logs.

---

## 10. Database Design Proposal (ERD relationships)

```
[students] (Student Module)
   │
   ├── (1 : 0..1) ──> [student_face_profiles] (Face Module)
   │                       │
   │                       └── (1 : 1) ──> [student_face_embeddings] (Face Module)
   │
   └── (1 : 0..N) ──> [access_history] (Smart Access Module)
                           ▲
                           │ (N : 1)
                     [gate_devices] (IoT Module)
```

---

## 11. Compatibility Review With V15

The design is **100% compatible** with `V15__student_face_registration_support.sql`:
* The columns `face_image_url` and `is_face_registered` are kept on the `students` table.
* The `is_face_registered` flag acts as a read-optimized cache for standard student profile lookups, preventing cross-module database joins.
* Database synchronization is maintained asynchronously via domain events (`FaceProfileApprovedEvent`).

---

## 12. Final Architecture Decision

**FACE-02 PASS.** The database schema, domain models, and decoupling strategy are officially frozen.

