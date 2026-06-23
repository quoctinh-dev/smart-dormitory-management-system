# SDMS MODULE KNOWLEDGE BASE
**Version:** 1.0 · **Date:** 2026-06-22

This document provides a detailed breakdown of every module in the Smart Dormitory Management System (SDMS) ecosystem.

---

## 1. AUTHENTICATION (AUTH) MODULE
**Purpose:** Manages account lifecycle, login, and token issuance.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** User Module, Brevo API
**Core Concepts:**
- Uses JWT (Access Token 15m, Refresh Token 7d)
- Stateless session management
- Account activation flow converts a pending student into an active user
**Key Database Entities:**
- `user_accounts` (status, role, password bcrypt hash)
**Key API Endpoints:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/activate` (Uses CCCD as temp password)
- `POST /api/v1/auth/refresh-token`

## 2. USER MODULE
**Purpose:** Retrieves and manages the authenticated user's profile and roles.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** Auth Module, Student Module
**Key API Endpoints:**
- `GET /api/v1/users/me` (Returns `accountId`, `role`, and attached `studentProfile`)

## 3. STUDENT MODULE
**Purpose:** Manages student demographic data, academic info, and links to face profiles.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** Application Module (creates student), Face Module
**Key Database Entities:**
- `students` (created automatically upon application approval)
**Key Concepts:**
- A student record is instantiated permanently once an application is approved.

## 4. REGISTRATION MODULE
**Purpose:** Manages time-bounded periods for dormitory registration and eligibility lists.
**Ownership:** Admin/Backend Team
**Status:** ✅ Implemented
**Dependencies:** Application Module
**Key Database Entities:**
- `registration_periods`
- `registration_eligibilities` (used for `RESTRICTED_REGISTRATION` type)
**Key Capabilities:**
- Admin can import an Excel file of eligible students (CCCD, email, student code).
- Students can query `POST /api/v1/registrations/check-eligibility` before applying.

## 5. APPLICATION MODULE
**Purpose:** The core workflow engine for student dormitory applications.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** Registration, Notification, Room
**Key Database Entities:**
- `dormitory_applications` (Status tracking)
- `application_priorities`
- `verification_documents`
- `dormitory_application_status_history`
- `application_generated_documents` (PDFs)
**Key Concepts:**
- State machine: DRAFT → PENDING → APPROVED / REJECTED / WAITING_LIST / WAITING_PAYMENT
- When approved, generates `student` record and `student_housing_assignment`.

## 6. ROOM MODULE
**Purpose:** Manages physical dormitory hierarchy, capacities, and student assignments.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** Application, Payment
**Key Database Entities:**
- `buildings`, `floors`, `rooms`, `beds`
- `student_housing_assignments` (Status: RESERVED → OCCUPIED → TERMINATED)
**Key Concepts:**
- Strict constraints: Unique active assignments per student, unique assignments per bed.
- Gender policies enforced at the `floor` level.

## 7. PAYMENT MODULE
**Purpose:** Handles billing and payment recording for assignments.
**Ownership:** Backend Team
**Status:** ✅ Implemented (Manual Gateway)
**Dependencies:** Room Module
**Key Database Entities:**
- `bills` (status: UNPAID, PAID, OVERDUE)
- `payments`
**Key Concepts:**
- Bill generated on assignment creation (RESERVED).
- If unpaid after deadline (e.g., 3 days), scheduled job `AssignmentExpireJob` cancels the assignment.

## 8. FACE MODULE
**Purpose:** Manages face images, admin approval, and vector embeddings for AI gate access.
**Ownership:** Backend / AI Team
**Status:** ⚠️ Partial (DB/API ready, AI external link pending)
**Dependencies:** Student Module, External Python AI Service
**Key Database Entities:**
- `face_profiles`
- `face_embeddings` (pgvector 512-dim)
- `face_verification_attempts`
**Key Concepts:**
- Admin must approve photos before they are vectorized.
- Uses HNSW index for fast cosine similarity lookups.

## 9. SMART ACCESS MODULE
**Purpose:** IoT gate access decision engine and audit log.
**Ownership:** IoT / Backend Team
**Status:** ⚠️ Partial (DB ready, MQTT consumer planned)
**Dependencies:** Face Module, Room Module
**Key Database Entities:**
- `curfew_policies`
- `access_history` (Append-only BRIN indexed ledger)
- `processed_messages` (MQTT idempotency)
**Key Concepts:**
- Receives IoT verification request, evaluates curfew and face match, issues GRANTED/DENIED decision.

## 10. UPLOAD MODULE
**Purpose:** Handles file and image uploads to Cloudinary CDN.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** Cloudinary SDK
**Key API Endpoints:**
- `POST /api/v1/uploads/avatar`

## 11. NOTIFICATION (VIRTUAL MODULE)
**Purpose:** Sends transactional emails.
**Ownership:** Backend Team
**Status:** ✅ Implemented
**Dependencies:** Brevo API
**Key Concepts:**
- Embedded within Auth, Application, and Payment services. No dedicated tables.

---

## 12. ADMIN WEB FRONTEND
**Ownership:** Frontend Team
**Technology:** React, Vite, MUI, Axios
**Status:** ✅ Implemented
**Key Features:**
- Period Manager, Application Review Queue, Face Approval Queue, Room Dashboard, Check-in/Payment tools.
- Uses Axios interceptors for silent token refresh.

## 13. PUBLIC WEB FRONTEND (STUDENT PORTAL)
**Ownership:** Frontend Team
**Technology:** React, Vite, MUI, Axios
**Status:** ✅ Implemented
**Key Features:**
- Landing page, Application Form, Application Status Checker, Payment Instruction Page, Account Activation.

## 14. STUDENT MOBILE APP
**Ownership:** Mobile Team
**Technology:** Flutter/React Native (Planned)
**Status:** ❌ Planned
**Key Requirements:**
- Must leverage biometric login (FaceID/Fingerprint) utilizing stored refresh tokens.
- Offline caching of `GET /users/me`.
