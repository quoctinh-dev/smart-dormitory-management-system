> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Face Domain Business Specification (v1.0)

This document serves as the official business specification and design freeze for the Face Recognition Domain in the Smart Dormitory Management System (SDMS).

---

## 1. Executive Summary

The Face Recognition Domain is an auxiliary convenience and security layer in SDMS. Its primary business objective is to control access to KTX main gates (Dormitory Gate Access).
* **Face Registration is OPTIONAL:** Students are not required to register their face in order to check into their assigned room.
* **No Check-In Blocker:** Physical Check-In is performed strictly via QR Code at the dormitory desk and does not mandate a registered face profile.
* **Separation of Concerns:** The Face Domain handles biometric uploads, approvals, vector embeddings, and recognition matches, keeping boundaries separate from Room, Payment, and Auth.

---

## 2. Face Registration Business Flow

1. **Who:** Any student with an `ACTIVE` account status (`UserAccount.status == ACTIVE`).
2. **When:** Post account activation, either before or after physical room check-in.
3. **Where:** Directly within the authenticated **Student Mobile App**.
4. **Capture Rule:** To prevent spoofing and ensure high-quality biometric matching, the App must restrict uploads to live camera capture (preventing photo uploads from the gallery).

---

## 3. Face Approval Business Flow

To handle 500+ students with only 2 dormitory managers, the **Option B (Student Upload $\rightarrow$ Admin Review $\rightarrow$ Approved)** workflow is structured for maximum operational efficiency:

```
Student snaps photo on App 
↓
Enters [PENDING_APPROVAL] state
↓
Admin reviews side-by-side on dashboard:
  - Official Portrait (from approved DormitoryApplication)
  - New Face Photo (from App)
↓
Admin clicks "Verify & Sync" (takes less than 5 seconds per student)
↓
[APPROVED] state ──> Triggers AI Embedding Extraction ──> Synced to Gates
```
*Rejected photos transition to `REJECTED`, notifying the student to re-capture.*

---

## 4. Face Lifecycle

The resident's face profile follows these distinct states:
* **NOT_REGISTERED:** The default state when a student is created. No photo exists.
* **PENDING_APPROVAL:** A photo has been successfully uploaded by the student and is waiting for manager verification.
* **APPROVED:** The photo has been verified by the manager. The AI model has extracted the vector embedding, and access is enabled.
* **REJECTED:** The photo was rejected (e.g., poor lighting, blurry, or duplicate identity). The student must re-capture.

---

## 5. Face AI Processing Flow

When a photo transitions to `APPROVED`, the Face Module runs the following automated pipeline:
1. **Image Alignment:** Crops and aligns the face from the uploaded image.
2. **Feature Extraction:** Passes the cropped face through the pre-trained Face AI model (e.g., FaceNet/InsightFace) to extract a 512-dimension floating-point vector.
3. **Database Insertion:** Stores the vector representation in the vector database table (using PostgreSQL `pgvector`).
4. **Synchronization:** Publishes a synchronization event to register the new template on local edge gate controllers.

---

## 6. Gate Access Flow

The runtime process for entering the KTX gate using face recognition:

```
Student stands before Gate Camera
↓
Camera crops face and computes runtime embedding (or posts image to server)
↓
FACE Module performs Vector Similarity Search (e.g., Cosine Distance >= 0.8)
↓
Match Found & Face Module publishes FaceMatchSuccessEvent
↓
SMART ACCESS Module consumes event, evaluates Student Status, Curfew, Time Window
↓
SMART ACCESS Module records "SUCCESS" log in AccessHistory and publishes AccessGrantedEvent
↓
IOT Module consumes AccessGrantedEvent and publishes "GATE_OPEN" MQTT command to topic: kts/gate/{gateId}/command
↓
ESP32 controller receives command, triggers relay (3-second unlock), and displays greeting
```

---

## 7. Access Log & History Design

Every access attempt at the gate is managed by the **Smart Access Module** in the `access_history` table. The Face Module only manages `face_verification_history` to log AI confidence scores without business access logic.
* The `access_history` records `student_id`, `decision` (GRANTED, DENIED), and `denial_reason` (e.g., CURFEW_VIOLATION).
* The IoT Module does NOT own or record access logs.

---

## 8. Module Responsibility Matrix

* **AUTH:** Authenticates API requests, ensures the student has an active session.
* **STUDENT:** Manages profile properties (`faceImageUrl` and `isFaceRegistered` flag).
* **FACE:** Manages face approval status, generates face embeddings, and calculates similarity matches.
* **SMART ACCESS:** Evaluates access policies (Curfew, Time Window, Student Status), makes Access Decisions, and records Access History.
* **IOT:** Manages gate configurations and publishes MQTT command strings.
* **ROOM / PAYMENT:** Zero dependency on biometric metadata or access state.

---

## 9. Future Database Proposal

```sql
-- PostgreSQL Schema with pgvector support
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE student_face_embeddings (
    face_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
    face_image_url VARCHAR(500) NOT NULL,
    embedding vector(512) NOT NULL, -- 512-dimension face embedding
    status VARCHAR(20) DEFAULT 'PENDING_APPROVAL' NOT NULL,
    rejection_reason VARCHAR(255),
    approved_by UUID REFERENCES user_accounts(account_id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX ON student_face_embeddings USING hnsw (embedding vector_cosine_ops);
```

---

## 10. Final Architecture Decision

**FACE-01 FROZEN.** The Face Recognition Domain is isolated, secure, and optional. Its implementation is scheduled for subsequent phases (`FACE-02` / `IOT-02`) and will build upon the stable, frozen Auth & Student modules.

