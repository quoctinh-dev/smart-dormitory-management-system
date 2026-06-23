# SDMS SYSTEM BIBLE
## Smart Dormitory Management System — Single Source of Truth
**Version:** 1.0 · **Date:** 2026-06-22 · **Authority:** Chief Solution Architect  
**Constitution:** Evidence > Assumption · Runtime > Code > Docs > Assumption

---

## SECTION 1 — PROJECT OVERVIEW

### 1.1 Project Vision
Build a **Smart Dormitory Management System (SDMS)** for a Vietnamese university (HCMUTE context). The system manages the full lifecycle of dormitory residency: student application, room assignment, payment, physical access control via IoT/Face AI, and administrative oversight — all from a single integrated platform.

### 1.2 Business Goals
| # | Goal |
|---|------|
| G1 | Digitize and automate the dormitory application and approval process |
| G2 | Assign rooms automatically based on priority scoring and gender policy |
| G3 | Collect monthly room fees via digital payment |
| G4 | Control physical gate access via Face AI recognition + RFID |
| G5 | Provide an Admin web portal for full operational control |
| G6 | Provide a Student mobile app for self-service |
| G7 | Integrate IoT devices (ESP32, camera, RFID reader, relay) for smart gate operation |

### 1.3 Problem Statement
Traditional Vietnamese dormitory management relies on paper applications, manual assignment, cash payments, and security guard key-based access. This results in:
- Slow, opaque application processes
- Manual room allocation errors and gender policy violations
- Fee collection delays and lost records
- Unauthorized access and no audit trail
- No real-time occupancy visibility

### 1.4 Target Users
| Role | Description |
|------|-------------|
| **ADMIN** | Dormitory staff who manage periods, review applications, assign rooms, manage payments, and configure access |
| **STUDENT** | University student who applies for dormitory, pays fees, registers face, and enters/exits via smart gate |
| **IoT Device** | ESP32 gate controller that sends MQTT messages to trigger access decisions |
| **AI Service** | External Python service that generates and stores face embeddings for identity verification |

### 1.5 System Scope (In Scope)
- Student dormitory application workflow (CCCD-based, priority scoring)
- Restricted and open registration period management with Excel import of eligible students
- Automated room & bed assignment with waiting list promotion
- Payment bill lifecycle (generation, payment, expiry)
- Face profile management: registration → admin approval → embedding generation → verification
- Smart access control with curfew policies and audit log
- Admin web portal (React + MUI)
- Student mobile app API contracts (Flutter/React Native planned)
- IoT integration via MQTT (ESP32, RFID, camera)
- Notification via Brevo email API
- PDF generation for application forms

### 1.6 Out of Scope
- University SIS/ERP integration (currently manual import via Excel)
- Real-time push notifications (FCM documented as future work)
- Online payment gateway integration (payment module exists but gateway is simulated/manual)
- Full mobile app implementation (only API contracts defined + backend ready)
- Hardware procurement and deployment (IoT is software-ready, hardware is planned)
- Fingerprint sensor integration (documented as future option)
- Multi-tenant (this system is single-institution)

---

## SECTION 2 — SYSTEM ARCHITECTURE

### 2.1 Architecture Style: Modular Monolith
**Pattern:** Single deployable Spring Boot application organized into domain modules.  
**Rationale:** Graduation thesis scope — team size does not justify microservices overhead. Module boundaries are explicitly enforced at package level. Future migration to microservices is possible by splitting modules.

```
com.sdms.backend/
├── common/          # Shared: entities, enums, exceptions, response wrappers
├── config/          # Spring configuration beans
├── security/        # JWT filter chain
└── modules/
    ├── auth/        # Authentication & account management
    ├── user/        # User profile retrieval
    ├── student/     # Student profile + face profile link
    ├── registration/ # Registration period + eligibility
    ├── application/ # Dormitory application lifecycle
    ├── room/        # Building / Floor / Room / Bed management
    ├── payment/     # Bill + payment lifecycle
    ├── face/        # Face profile + embedding + verification
    ├── smartaccess/ # Gate access decision engine + history
    ├── upload/      # Cloudinary file upload
    └── (notification) # Email via Brevo (integrated in services)
```

### 2.2 Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend Framework** | Spring Boot | 3.5.14 |
| **Language** | Java | 17 |
| **Security** | Spring Security + JJWT | 0.12.5 |
| **ORM** | Spring Data JPA / Hibernate | 6.x |
| **Database** | PostgreSQL | 17 (with pgvector + uuid-ossp) |
| **Schema Migration** | Flyway | Bundled |
| **Vector Search** | pgvector (hibernate-vector 6.6.49) | 512-dim HNSW |
| **File Storage** | Cloudinary | cloudinary-http44 1.33.0 |
| **Email** | Brevo API | HTTP via RestTemplate |
| **PDF Generation** | OpenHTMLtoPDF + Thymeleaf | 1.0.10 |
| **Excel Import** | Apache POI | 5.2.5 |
| **Scheduled Jobs** | Spring @Scheduled + ShedLock | 5.16.0 |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) | 2.8.5 |
| **Frontend Framework** | React | 18.3.1 |
| **Frontend Build** | Vite | 8.x |
| **Frontend UI** | Material UI (MUI) | v6.5 |
| **Frontend HTTP** | Axios | 1.7.9 |
| **Frontend Routing** | React Router DOM | v6.30 |
| **IoT Protocol** | MQTT | (broker TBD) |
| **IoT Hardware** | ESP32, RFID Reader, IP Camera | (planned) |

### 2.3 Database Strategy
- **Engine:** PostgreSQL 17
- **Migration:** Flyway (versioned migrations V1–V23, current version V23)
- **DDL Policy:** `ddl-auto: validate` — Hibernate validates against Flyway-managed schema
- **Vector Extension:** `pgvector` enabled via `V22_01__enable_vector_extension.sql`
- **Key Design Patterns:**
  - UUID primary keys (uuid_generate_v4())
  - Optimistic locking (version column on Bills, Applications)
  - BRIN index on time-series append-only tables (access_history)
  - HNSW vector index on face_embeddings for cosine similarity
  - Unique partial indexes for business rule enforcement
  - Append-only enforcement on access_history (REVOKE DELETE, UPDATE)

### 2.4 Event Strategy
**Current State:** Internal Spring ApplicationEvents (in-process).  
**No external message broker** (no Kafka, RabbitMQ) is present.  
Events are used for cross-module communication within the monolith:
- Application status changes trigger room assignment events
- Assignment events trigger bill creation
- Payment events trigger assignment status updates
- Face approval events trigger embedding generation requests

> **[UNCERTAINTY]** The embedding generation call to AI service (Python) mechanism is not fully evidenced in source — it may be via REST HTTP call rather than internal event.

### 2.5 Security Strategy
- **Authentication:** JWT Bearer tokens (Access + Refresh)
  - Access token expiry: 900,000 ms (15 minutes)
  - Refresh token expiry: 604,800,000 ms (7 days)
- **Authorization:** Spring Security `@PreAuthorize` + role-based
- **Roles:** `ADMIN`, `STUDENT`
- **Stateless:** No server-side session
- **CORS:** Configured for `http://localhost:5173` (dev only)
- **Public endpoints:** `/api/v1/auth/**`, `/api/v1/registrations/**`, `/api/v1/uploads/**`, application read/create endpoints
- **Token Refresh:** Automatic silent refresh in Axios interceptor

### 2.6 Integration Strategy
| Integration | Technology | Status |
|-------------|-----------|--------|
| File upload | Cloudinary HTTP API | Implemented |
| Email | Brevo HTTP API | Implemented |
| Face AI | External Python service (HTTP) | Planned/Partial |
| IoT Gateway | MQTT broker (topic-based) | Designed |
| Payment Gateway | (none yet) | Designed |
| Mobile App | REST API (same backend) | API Ready |

### 2.7 Deployment Strategy
**Current:** Local development only  
**Target:** Single server or containerized deployment

| Component | Target |
|-----------|--------|
| Backend | JAR on JVM (Spring Boot fat jar) |
| Frontend | Vite static build, served via Nginx |
| Database | PostgreSQL instance (local or cloud) |
| File Storage | Cloudinary cloud (already external) |
| MQTT Broker | Mosquitto or HiveMQ (on same server) |
| IoT Devices | ESP32 on campus LAN, MQTT over Wi-Fi |

**Environment Variables Required:**
```
DB_URL, DB_USERNAME, DB_PASSWORD
JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
BREVO_API_KEY, BREVO_SENDER_EMAIL
CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
APP_FRONTEND_URL (default: http://localhost:5173)
SERVER_PORT (default: 8080)
```

---

## SECTION 3 — MODULE INVENTORY

### 3.1 Auth Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.auth` |
| **Purpose** | Account lifecycle: login, activation, token refresh, password reset, logout |
| **Status** | ✅ **Implemented** |
| **Dependencies** | User module (UserDetails), Spring Security, JJWT, Brevo (reset email) |

**Endpoints:**
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/activate`
- `POST /api/v1/auth/refresh-token`
- `POST /api/v1/auth/logout`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `POST /api/v1/auth/change-password`

### 3.2 User Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.user` |
| **Purpose** | Retrieve authenticated user profile (GET /users/me) |
| **Status** | ✅ **Implemented** |
| **Dependencies** | Auth module (security context), Student module |

### 3.3 Student Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.student` |
| **Purpose** | Student profile CRUD, face profile link management |
| **Status** | ✅ **Implemented** |
| **Dependencies** | User module, Face module |

### 3.4 Registration Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.registration` |
| **Purpose** | Manage registration periods; OPEN or RESTRICTED eligibility lists; Excel import of eligible students |
| **Status** | ✅ **Implemented** |
| **Dependencies** | Application module (period referenced) |

**Key Features:**
- Period types: `OPEN_REGISTRATION`, `RESTRICTED_REGISTRATION`
- Eligibility import via Excel (Apache POI)
- CCCD-based eligibility check

### 3.5 Application Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.application` |
| **Purpose** | Dormitory application lifecycle: create draft → upload documents → submit → admin review → approve/reject/waiting list |
| **Status** | ✅ **Implemented** (most complex module) |
| **Dependencies** | Registration, Room, Payment, Student, Notification |

**Status States:** `DRAFT` → `PENDING` → `APPROVED`/`REJECTED`/`WAITING_LIST`/`WAITING_PAYMENT`/`PAID`/`REQUEST_REVISION`

### 3.6 Room Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.room` |
| **Purpose** | Building, floor, room, bed management; student housing assignment; check-in/check-out |
| **Status** | ✅ **Implemented** |
| **Dependencies** | Application, Student, Payment |

**Hierarchy:** Building → Floor (with occupancy policy MALE/FEMALE) → Room → Bed → Assignment

### 3.7 Payment Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.payment` |
| **Purpose** | Bill generation, payment recording, bill expiry via scheduled job |
| **Status** | ✅ **Implemented** (gateway = manual/simulated) |
| **Dependencies** | Room (assignment), Application |

**Bill Types:** Reservation deposit, Monthly rent  
**Payment Methods:** Manual recording (no live gateway confirmed)

### 3.8 Face Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.face` |
| **Purpose** | Face image registration, admin approval workflow, embedding storage, verification attempt log |
| **Status** | ⚠️ **Partial** — DB schema complete, API endpoints for admin approval implemented; AI embedding pipeline = external integration point |
| **Dependencies** | Student, external AI Python service |

**Face Status States:** `PENDING_REVIEW` → `APPROVED`/`REJECTED`  
**Storage:** Face image URL in Cloudinary; 512-dim vector in PostgreSQL via pgvector

### 3.9 Smart Access Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.smartaccess` |
| **Purpose** | IoT gate access decision engine: receive MQTT event → evaluate curfew policy → grant/deny → log to access_history |
| **Status** | ⚠️ **Partial** — DB schema complete, rule engine designed, MQTT integration = planned |
| **Dependencies** | Face (verification), Student, Building, Curfew policies |

### 3.10 Upload Module
| Property | Value |
|----------|-------|
| **Package** | `com.sdms.backend.modules.upload` |
| **Purpose** | File upload endpoint (avatar/documents) to Cloudinary, returns URL |
| **Status** | ✅ **Implemented** |
| **Dependencies** | Cloudinary SDK |

**Endpoint:** `POST /api/v1/uploads/avatar`

### 3.11 Notification (Embedded)
Not a standalone module. Email notifications are sent inline within:
- Auth module: password reset email
- Application module: approval/rejection/waiting list emails
- Payment module: bill generated email  
**Technology:** Brevo HTTP API via RestTemplate

---

## SECTION 4 — BUSINESS DOMAIN MAP

```
REGISTRATION_PERIOD (period_id)
    │ 1:N
    ▼
REGISTRATION_ELIGIBILITIES (eligibility_id)
    [Only for RESTRICTED periods]
    cccd, email, student_code, target (FRESHMAN/RETURNEE)

    │ (period_id references)
    ▼
DORMITORY_APPLICATIONS (application_id)
    │ student identity: cccd, full_name, dob, gender
    │ personal: phone, email, address, family info
    │ academic: faculty, student_code, ethnic, pob
    │ status: DRAFT/PENDING/APPROVED/REJECTED/WAITING_LIST/WAITING_PAYMENT/PAID
    │ priority_score (composite from application_priorities)
    │ commitment_accepted + client_ip_address (legal record)
    │
    ├── APPLICATION_PRIORITIES (priority_category, priority_score)
    │       POOR_HOUSEHOLD, ETHNIC_MINORITY, MERIT_SCHOLARSHIP, DISABLED, etc.
    │
    ├── VERIFICATION_DOCUMENTS (file_url, document_type, status)
    │       Uploaded supporting documents per priority
    │
    ├── DORMITORY_APPLICATION_STATUS_HISTORY
    │       Audit trail of all status transitions
    │
    └── APPLICATION_GENERATED_DOCUMENTS
            PDF of application form (auto-generated)

    │ (approved application triggers assignment)
    ▼
STUDENT_HOUSING_ASSIGNMENTS (assignment_id)
    │ status: RESERVED → OCCUPIED → TERMINATED / CANCELLED
    │ links: application_id, student_id, bed_id
    │ timestamps: reserved_at, check_in_at, check_out_at
    │
    ├── BILLS (bill_id)
    │       Reservation deposit / Monthly rent
    │       status: UNPAID → PAID / OVERDUE / CANCELLED
    │       linked: assignment_id, room_id, student_id
    │
    └── PAYMENTS (payment_id)
            Records of actual payments against a bill

STUDENTS (student_id) ←── created after application APPROVED
    │ source_application_id (1:1 unique)
    │ student_code, cccd, full_name, dob, gender
    │ family info, faculty, academic_year
    │
    └── FACE_PROFILES (profile_id)  ← 1:1 per student
            face_image_url (Cloudinary)
            pending_face_image_url
            status: PENDING_REVIEW / APPROVED / REJECTED
            │
            └── FACE_EMBEDDINGS (embedding_id)
                    vector(512) stored in pgvector
                    HNSW index (cosine similarity)

USER_ACCOUNTS (account_id)
    │ username, email, password (BCrypt)
    │ role: ADMIN / STUDENT
    │ status: PENDING_ACTIVATION / ACTIVE
    │ student_id (nullable FK → students)
    └── (linked to student after activation)

BUILDINGS → FLOORS (occupancy_policy: MALE/FEMALE) → ROOMS → BEDS → ASSIGNMENTS

CURFEW_POLICIES (per building, resident_type, time window)
ACCESS_HISTORY (append-only log: student, gate, building, method, decision)
FACE_VERIFICATION_ATTEMPTS (gate_device_id, confidence_score, status)
```

---

## SECTION 5 — END-TO-END BUSINESS FLOWS

### 5.1 Student Journey

```
1. UNIVERSITY IMPORTS STUDENT LIST
   Admin → POST /admin/registration-periods/{id}/eligibilities/import (Excel)
   Creates: registration_eligibilities (cccd, student_code, email)
   [Only for RESTRICTED periods; OPEN periods skip this]

2. STUDENT CHECKS ELIGIBILITY (Public)
   POST /registrations/check-eligibility  { cccd, periodId }
   Returns: eligible = true/false

3. STUDENT CREATES DRAFT APPLICATION (Public - no auth required)
   POST /applications  { periodId, fullName, dob, gender, cccd, ... }
   Creates: dormitory_applications (status=DRAFT)
   Returns: applicationId

4. STUDENT UPLOADS SUPPORTING DOCUMENTS (Public)
   POST /applications/{id}/documents?type=PRIORITY_PAPER&fileUrl=...
   [File already uploaded to Cloudinary via POST /uploads/avatar]

5. STUDENT SUBMITS APPLICATION (Public)
   POST /applications/{id}/submit
   Status: DRAFT → PENDING
   System: Validates commitment_accepted, generates PDF

6. ADMIN REVIEWS APPLICATION (Requires ADMIN auth)
   GET  /admin/applications       (queue with filters)
   GET  /admin/applications/{id}  (detail with documents)
   
   Option A: Approve
   PATCH /admin/applications/{id}/approve
   Status: PENDING → APPROVED
   System: Creates student record (if not exists), creates housing assignment (RESERVED), generates bill (WAITING_PAYMENT)

   Option B: Reject
   PATCH /admin/applications/{id}/reject  { note }
   Status: PENDING → REJECTED

   Option C: Request Revision
   PATCH /admin/applications/{id}/request-revision  { note, deadlineDays }
   Status: PENDING → REQUEST_REVISION

   Option D: Waiting List
   Application lands on waiting list if no beds available
   Status: PENDING → WAITING_LIST
   [Automated job promotes WAITING_LIST → WAITING_PAYMENT when beds free up]

7. STUDENT PAYS (WAITING_PAYMENT)
   Public page: GET /public/room/assignment/{applicationId}  (room info)
   Payment: POST /payments/...  (method TBD based on gateway)
   Status on payment: WAITING_PAYMENT → PAID → Assignment status: OCCUPIED

8. STUDENT ACTIVATES ACCOUNT (After approval + payment)
   POST /auth/activate  { email, tempPassword (=CCCD), newPassword }
   Status: PENDING_ACTIVATION → ACTIVE

9. STUDENT REGISTERS FACE
   POST /students/me/face  { faceImageUrl }  [with X-Student-Id header]
   Status: face_profile → PENDING_REVIEW

10. ADMIN APPROVES FACE
    POST /admin/faces/{profileId}/approve
    Status: PENDING_REVIEW → APPROVED
    System: Triggers embedding generation (AI service call)

11. STUDENT ENTERS DORMITORY (IoT)
    ESP32 captures face/RFID → publishes MQTT message
    Backend: Evaluates access decision (face match + curfew policy)
    Decision: GRANTED / DENIED
    Log: access_history (append-only)

12. CHECK-IN (Admin physical action)
    PATCH /admin/check-in/assignments/{id}/check-in
    Assignment: RESERVED → OCCUPIED

13. CHECK-OUT (Admin physical action)
    PATCH /admin/check-in/assignments/{id}/check-out
    Assignment: OCCUPIED → TERMINATED
```

### 5.2 Admin Journey
- Login: `POST /auth/login` → receives JWT
- Dashboard: Student counts, room stats, pending queues
- Manage Periods: Create, activate, deactivate, import eligibility Excel
- Review Applications: Filter by status, approve/reject/request-revision
- Room Dashboard: Building occupancy overview
- Face Approval Queue: Approve/reject pending face photos
- Payment Management: View bills, record payments
- Check-In Management: Physical check-in/check-out of students

### 5.3 Application Lifecycle
```
DRAFT → PENDING → APPROVED → WAITING_PAYMENT → PAID
                ↘ REJECTED
                ↘ WAITING_LIST → (auto-promotion) → WAITING_PAYMENT
                ↘ REQUEST_REVISION → (student re-submits) → PENDING
```

### 5.4 Room Assignment Lifecycle
```
Application APPROVED
    → Assignment created: RESERVED
    → Bill created: UNPAID (with due_date = now + 3 days)

Payment Received
    → Bill: PAID
    → Assignment: OCCUPIED
    → (Check-in physically performed)

Student departs / contract ends
    → Assignment: TERMINATED
    → Bed status: AVAILABLE (counter updated)

Payment expired (job runs)
    → Bill: OVERDUE
    → Assignment: CANCELLED
    → Bed freed → Waiting list promotion triggered
```

### 5.5 Payment Lifecycle
```
Bill created (UNPAID) when assignment RESERVED
    due_date = CURRENT_DATE + 3 days (configurable via application.payment.deadline-days)

Student pays:
    POST /payments  { billId, amount, method }
    Payment: PENDING → CONFIRMED
    Bill: UNPAID → PAID

Scheduled job (daily):
    Scans bills WHERE status=UNPAID AND due_date < NOW()
    → Bill: OVERDUE
    → Assignment: CANCELLED
    → Bed freed
    → Waiting list promotion runs
```

### 5.6 Face Lifecycle
```
Student uploads face photo (Cloudinary URL)
    → FaceProfile: PENDING_REVIEW (pending_face_image_url set)

Admin reviews in Face Approval Queue
    → APPROVED:
        face_image_url = pending_face_image_url
        Trigger AI embedding generation
        FaceEmbedding: vector(512) stored
    → REJECTED:
        rejection_reason recorded
        Student may re-submit

At Gate (IoT):
    Camera captures frame
    AI service: extract embedding → cosine similarity against stored vectors
    Score > threshold → GRANTED
    Score < threshold → DENIED
    Log: face_verification_attempts + access_history
```

### 5.7 Access Lifecycle (IoT Gate)
```
ESP32 at gate:
    Captures face frame via camera OR reads RFID card
    Publishes MQTT: sdms/gate/{gateId}/verify  { studentId/rfid, method }

Backend MQTT Consumer:
    Receives event
    Checks: Student is ACTIVE resident (OCCUPIED assignment)
    Checks: Curfew policy for building + current time
    Checks: Face embedding match (if method=FACE_AI)
    Decision: GRANTED / DENIED
    
    Publishes MQTT response: sdms/gate/{gateId}/decision  { decision, studentId }
    Logs: access_history (append-only)
    Logs: face_verification_attempts (if face method)

Gate Action:
    GRANTED → relay activates → door opens
    DENIED  → relay stays closed → alert/beep
```

---

## SECTION 6 — API LANDSCAPE

### 6.1 Base URL
```
http://localhost:8080/api/v1
```
Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 6.2 Auth Module — Controller: AuthController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| POST | `/auth/login` | Public | — | Returns accessToken + refreshToken |
| POST | `/auth/activate` | Public | — | First-time activation with CCCD temp password |
| POST | `/auth/refresh-token` | Public | — | Rotate tokens |
| POST | `/auth/logout` | Required | ANY | Invalidates refresh token |
| POST | `/auth/forgot-password` | Public | — | Sends reset email via Brevo |
| POST | `/auth/reset-password` | Public | — | Token-based password reset |
| POST | `/auth/change-password` | Required | ANY | Changes password for authenticated user |

**Key DTOs:**
- LoginRequest: `{ usernameOrEmail, password }`
- ActivateRequest: `{ email, tempPassword, newPassword }`
- AuthResponse: `{ accessToken, refreshToken }`

### 6.3 User Module — Controller: UserController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| GET | `/users/me` | Required | ANY | Returns user profile + student profile |

**Response includes:** `accountId, username, email, role, studentProfile{studentId, fullName, studentCode, dob, gender, cccd, phone, roomCode, bedCode, faceImageUrl}`

### 6.4 Registration Module — Controllers: RegistrationController, AdminRegistrationController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| POST | `/registrations/check-eligibility` | Public | — | Check if CCCD eligible for period |
| GET | `/admin/registration-periods` | Required | ADMIN | List all periods |
| POST | `/admin/registration-periods` | Required | ADMIN | Create new period |
| PATCH | `/admin/registration-periods/{id}` | Required | ADMIN | Update period metadata |
| PATCH | `/admin/registration-periods/{id}/activate` | Required | ADMIN | Set is_active=true |
| PATCH | `/admin/registration-periods/{id}/deactivate` | Required | ADMIN | Set is_active=false |
| POST | `/admin/registration-periods/{id}/eligibilities/import` | Required | ADMIN | Import Excel file |
| GET | `/admin/registration-periods/{id}/eligibilities` | Required | ADMIN | List eligibilities |
| DELETE | `/admin/registration-periods/{id}/eligibilities/{eid}` | Required | ADMIN | Delete one eligibility |

### 6.5 Application Module — Controllers: ApplicationController, AdminApplicationController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| POST | `/applications` | Public | — | Create draft application |
| GET | `/applications/{id}` | Public | — | Get application by ID |
| GET | `/applications/status?cccd=` | Public | — | Check status by CCCD |
| POST | `/applications/{id}/documents` | Public | — | Upload supporting document |
| PUT | `/applications/{id}/documents/{docId}/resubmit` | Public | — | Resubmit document after revision request |
| POST | `/applications/{id}/submit` | Public | — | Submit application (DRAFT→PENDING) |
| GET | `/admin/applications` | Required | ADMIN | List applications with filters |
| PATCH | `/admin/applications/{id}/approve` | Required | ADMIN | Approve application |
| PATCH | `/admin/applications/{id}/reject` | Required | ADMIN | Reject application |
| PATCH | `/admin/applications/{id}/request-revision` | Required | ADMIN | Request document revision |
| PATCH | `/admin/documents/{docId}/verify` | Required | ADMIN | Verify individual document |

### 6.6 Room Module — Controllers: RoomController, AdminRoomController, AdminDashboardController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| GET | `/public/room/assignment/{appId}` | Public | — | Get room/bed info for payment page |
| GET | `/admin/buildings` | Required | ADMIN | List buildings |
| GET | `/admin/buildings/{id}` | Required | ADMIN | Building detail with floors/rooms |
| GET | `/admin/dashboard/room` | Required | ADMIN | Room occupancy overview |
| GET | `/admin/dashboard/room/beds` | Required | ADMIN | Bed-level statistics |

### 6.7 Payment Module — Controllers: PaymentController, AdminPaymentController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| GET | `/admin/payments` | Required | ADMIN | List all bills/payments |
| POST | `/admin/payments/bills/{id}/pay` | Required | ADMIN | Record manual payment |
| GET | `/admin/payments/bills/{id}` | Required | ADMIN | Bill detail |

> **[UNCERTAINTY]** Payment public endpoints for student-facing payment page were not fully traced. The `PaymentPage.jsx` calls `GET /public/room/assignment/{applicationId}` to get context. The actual payment submission endpoint URL requires source code confirmation.

### 6.8 Face Module — Controllers: FaceController, AdminFaceController
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| POST | `/students/me/face` | Required* | STUDENT | Register face image (X-Student-Id header) |
| GET | `/students/me/face` | Required* | STUDENT | Get own face profile |
| GET | `/admin/faces/pending` | Required | ADMIN | Pending face approval queue |
| POST | `/admin/faces/{id}/approve` | Required | ADMIN | Approve face (X-Admin-Id header) |
| POST | `/admin/faces/{id}/reject` | Required | ADMIN | Reject face with reason |

*Note: `FaceRegistrationPage` passes X-Student-Id header directly — suggests possible public/header-auth endpoint for student-facing face registration.

### 6.9 Smart Access Module
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| GET | `/admin/access/history` | Required | ADMIN | Access history log |
| GET | `/admin/access/policies/curfew` | Required | ADMIN | Curfew policy list |
| POST | `/admin/access/policies/curfew` | Required | ADMIN | Create curfew policy |

> **[UNCERTAINTY]** IoT access decision endpoints may be MQTT-only (not HTTP). Admin override endpoints (REMOTE_UNLOCK, FIRE_EMERGENCY, SECURITY_LOCKDOWN) are designed but implementation status unclear.

### 6.10 Upload Module
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| POST | `/uploads/avatar` | Public | — | Upload file to Cloudinary, returns URL |

### 6.11 Check-In Management
| Method | Endpoint | Auth | Roles | Notes |
|--------|----------|------|-------|-------|
| GET | `/admin/check-in/assignments` | Required | ADMIN | List assignments for check-in management |
| PATCH | `/admin/check-in/assignments/{id}/check-in` | Required | ADMIN | Record physical check-in |
| PATCH | `/admin/check-in/assignments/{id}/check-out` | Required | ADMIN | Record physical check-out |

---

## SECTION 7 — DATABASE KNOWLEDGE BASE

### 7.1 Current Database Version
**Flyway Version:** V23 (`V23__add_revision_deadline_to_application.sql`)  
**Latest Migration:** Adds `revision_deadline` column to `dormitory_applications`

### 7.2 Complete Table Inventory

| Table | Migration | Purpose |
|-------|-----------|---------|
| `registration_periods` | V1, V5 | Registration period metadata |
| `registration_eligibilities` | V5, V16 | Per-period eligible student list |
| `dormitory_applications` | V1, V10, V16, V19, V23 | Application form + status |
| `application_priorities` | V16 | Priority categories per application |
| `verification_documents` | V1, V16 | Supporting documents |
| `dormitory_application_status_history` | V16 | Status transition audit trail |
| `application_generated_documents` | V16 | Auto-generated PDFs |
| `students` | V1, V4 | Student profile |
| `user_accounts` | V1, V2, V3 | Authentication accounts |
| `buildings` | V7 | Dormitory building |
| `floors` | V7 | Building floor with gender policy |
| `rooms` | V7, V9, V17 | Room within floor |
| `beds` | V7 | Bed within room |
| `student_housing_assignments` | V7, V8, V10, V12 | Student-bed assignment |
| `bills` | V13, V18 | Financial bill |
| `payments` | V13, V18 | Payment record |
| `shedlock` | V11 | Distributed job lock table |
| `curfew_policies` | V21_02 | Gate access time window rules |
| `time_window_policies` | V21_03 | Additional time-based policies |
| `access_history` | V21_04 | Gate access event log (append-only) |
| `processed_messages` | V21_05 | MQTT idempotency dedup table |
| `face_profiles` | V22_02 | Student face registration |
| `face_embeddings` | V22_03 | 512-dim vector embeddings |
| `face_verification_attempts` | V22_04 | Per-gate verification log |

### 7.3 Key Relationships
```
user_accounts.student_id → students.student_id (1:1, nullable)
students.source_application_id → dormitory_applications.application_id (1:1 unique)
dormitory_applications.period_id → registration_periods.period_id (N:1)
registration_eligibilities.period_id → registration_periods.period_id (N:1)
application_priorities.application_id → dormitory_applications.application_id (N:1)
verification_documents.application_id → dormitory_applications.application_id (N:1)
dormitory_application_status_history.application_id → dormitory_applications (N:1)
application_generated_documents.application_id → dormitory_applications (N:1)
student_housing_assignments.application_id → dormitory_applications (N:1)
student_housing_assignments.student_id → students (N:1, nullable)
student_housing_assignments.bed_id → beds (N:1)
bills.assignment_id → student_housing_assignments (N:1)
bills.room_id → rooms (N:1, nullable)
bills.student_id → students (N:1, nullable)
payments.bill_id → bills (N:1)
floors.building_id → buildings (N:1)
rooms.floor_id → floors (N:1)
beds.room_id → rooms (N:1)
face_profiles.student_id → students (1:1 unique)
face_embeddings.profile_id → face_profiles (1:1 unique)
face_verification_attempts.profile_id → face_profiles (N:1, nullable)
curfew_policies.building_id → buildings (soft reference, no FK constraint)
access_history.building_id → buildings (soft reference, no FK constraint)
```

### 7.4 Critical Indexes
| Index | Table | Type | Purpose |
|-------|-------|------|---------|
| `uk_active_assignment_application` | student_housing_assignments | Unique partial | Prevent duplicate active assignments per application |
| `uk_active_assignment_student` | student_housing_assignments | Unique partial | Prevent student in two beds simultaneously |
| `uk_active_assignment_bed` | student_housing_assignments | Unique partial | Prevent double-booking a bed |
| `idx_dorm_app_waiting_list_promotion` | dormitory_applications | B-tree composite | Optimize waiting list promotion job |
| `idx_access_history_timestamp` | access_history | BRIN | Time-series performance for large volumes |
| `idx_face_embeddings_hnsw` | face_embeddings | HNSW | Cosine similarity vector search |
| `uk_period_cccd` | dormitory_applications | Unique | One application per CCCD per period |
| `uk_eligibility_period_cccd` | registration_eligibilities | Unique | No duplicate eligibility entries |

### 7.5 PostgreSQL Extensions
- `uuid-ossp` — UUID generation
- `vector` (pgvector) — 512-dimensional face embedding storage and HNSW search

### 7.6 Module Ownership Boundaries
| Module | Owns Tables |
|--------|-------------|
| Auth | user_accounts |
| Student | students |
| Registration | registration_periods, registration_eligibilities |
| Application | dormitory_applications, application_priorities, verification_documents, dormitory_application_status_history, application_generated_documents |
| Room | buildings, floors, rooms, beds, student_housing_assignments |
| Payment | bills, payments |
| Face | face_profiles, face_embeddings, face_verification_attempts |
| Smart Access | curfew_policies, time_window_policies, access_history, processed_messages |

---

## SECTION 8 — EVENT CATALOG

### 8.1 Event Architecture
Events are **Spring ApplicationEvents** — in-process, synchronous/async within the monolith. No external broker confirmed.

| Event | Producer | Consumer | Purpose | Trigger |
|-------|----------|----------|---------|---------|
| `ApplicationApprovedEvent` | ApplicationService | RoomService | Create housing assignment + bill | Admin approves application |
| `AssignmentCreatedEvent` | RoomService | PaymentService | Generate bill for reservation deposit | Assignment RESERVED |
| `PaymentConfirmedEvent` | PaymentService | RoomService | Update assignment status RESERVED→OCCUPIED | Payment recorded |
| `AssignmentExpiredEvent` | Scheduler (AssignmentExpireJob) | RoomService, WaitingListService | Cancel overdue assignments, free beds | Daily scheduled job |
| `WaitingListPromotionEvent` | WaitingListPromotionJob | ApplicationService, RoomService | Move WAITING_LIST→WAITING_PAYMENT | Bed freed up |
| `FaceApprovedEvent` | FaceAdminService | AI Embedding Service | Trigger embedding generation | Admin approves face |

> **[UNCERTAINTY]** `FaceApprovedEvent` → AI embedding: the actual HTTP call mechanism (RestTemplate call to Python service? Internal?) is not confirmed from available source. The vector is stored in `face_embeddings` table — something must populate it after face approval.

### 8.2 Scheduled Jobs
| Job | Trigger | Action |
|-----|---------|--------|
| `AssignmentExpireJob` | Daily (cron) | Cancel RESERVED assignments with overdue UNPAID bills |
| `WaitingListPromotionJob` | Triggered by bed freed | Promote next WAITING_LIST application to WAITING_PAYMENT |

**ShedLock:** Prevents concurrent job execution across clustered instances. Lock table: `shedlock`.

### 8.3 MQTT Events (Planned/Designed)
| Topic | Direction | Publisher | Consumer |
|-------|-----------|-----------|---------|
| `sdms/gate/{gateId}/verify` | IoT → Backend | ESP32 | MQTT consumer in SmartAccess |
| `sdms/gate/{gateId}/decision` | Backend → IoT | SmartAccess | ESP32 |
| `sdms/gate/{gateId}/override` | Admin → IoT | Admin portal | ESP32 |

**Idempotency:** `processed_messages` table prevents duplicate MQTT event processing.

---

## SECTION 9 — WEB KNOWLEDGE BASE

### 9.1 Technology
- **Framework:** React 18.3.1 + Vite 8.x
- **UI Library:** Material UI (MUI) v6.5 + Emotion
- **Routing:** React Router DOM v6.30
- **HTTP:** Axios 1.7.9 with automatic token refresh interceptor
- **Base API URL:** `${VITE_API_URL}/api` (env var)

### 9.2 Admin Web — Implemented Screens
| Route | Component | Purpose | Status |
|-------|-----------|---------|--------|
| `/admin/login` | `LoginPage.jsx` | Admin login form | ✅ Done |
| `/admin` | `AdminDashboard.jsx` | Overview stats | ✅ Done |
| `/admin/registration-periods` | `RegistrationPeriodManager.jsx` | Period CRUD + eligibility import | ✅ Done |
| `/admin/applications/review` | `ApplicationReviewQueue.jsx` | Application queue with filters | ✅ Done |
| `/admin/applications/:id/review` | `ApplicationReviewDetail.jsx` | Full application detail + document review | ✅ Done |
| `/admin/faces/approve` | `FaceApprovalQueue.jsx` | Face photo approval | ✅ Done |
| `/admin/rooms/dashboard` | `RoomDashboard.jsx` | Room occupancy overview | ✅ Done |
| `/admin/payments` | `PaymentManagement.jsx` | Bill and payment management | ✅ Done |
| `/admin/check-in` | `CheckInManagement.jsx` | Physical check-in/check-out | ✅ Done |

### 9.3 Public Web — Implemented Screens
| Route | Component | Purpose | Status |
|-------|-----------|---------|--------|
| `/` | `HomePage.jsx` | Landing page | ✅ Done |
| `/register` | `RegistrationPage.jsx` | Student application form | ✅ Done |
| `/status` | `StatusPage.jsx` | Check application status by CCCD | ✅ Done |
| `/payment/:applicationId` | `PaymentPage.jsx` | Payment instructions page | ✅ Done |
| `/face-registration` | `FaceRegistrationPage.jsx` | Student face photo upload | ✅ Done |
| `/activate` | `ActivateAccountPage.jsx` | Account activation form | ✅ Done |

### 9.4 Missing Admin Screens
Based on analysis, these features are in the backend but lack dedicated UI:
- Student directory / search
- Individual student profile detail
- Access history log viewer
- Curfew policy manager
- Smart access override panel
- Reports / analytics dashboard
- Notification/email history

### 9.5 Navigation Structure
```
Public (PublicLayout):
  / (HomePage)
  /register (RegistrationPage)
  /status (StatusPage)
  /payment/:id (PaymentPage)
  /face-registration (FaceRegistrationPage)
  /activate (ActivateAccountPage)

Admin (RequireAdmin guard → AdminLayout):
  /admin/login (LoginPage — AuthLayout)
  /admin (AdminDashboard)
  /admin/registration-periods (RegistrationPeriodManager)
  /admin/applications/review (ApplicationReviewQueue)
  /admin/applications/:id/review (ApplicationReviewDetail)
  /admin/faces/approve (FaceApprovalQueue)
  /admin/rooms/dashboard (RoomDashboard)
  /admin/payments (PaymentManagement)
  /admin/check-in (CheckInManagement)
```

### 9.6 API Client Architecture
- **axiosClient.js:** Single Axios instance with base URL, 15s timeout, Bearer token injection, silent 401 refresh
- **Refresh flow:** On 401, pauses queue, refreshes token, replays all failed requests
- **Redirect:** On refresh failure in `/admin/*` routes, redirects to `/admin/login`

### 9.7 Demo Readiness — Web
| Screen | Readiness |
|--------|-----------|
| Login | ✅ Ready |
| Dashboard | ✅ Ready |
| Application Review | ✅ Ready |
| Face Approval | ✅ Ready |
| Room Dashboard | ✅ Ready |
| Payment Management | ✅ Ready |
| Check-In | ✅ Ready |
| Registration Periods | ✅ Ready |
| Student portal (public) | ✅ Ready |

---

## SECTION 10 — MOBILE KNOWLEDGE BASE

### 10.1 Student App Vision
A mobile app (Flutter or React Native planned) that allows students to:
1. Activate account (first-time, with CCCD + university email)
2. Login (biometric shortcut via device FaceID/fingerprint, backed by refresh token)
3. View personal profile and room assignment
4. Create and submit dormitory application
5. Upload supporting documents (camera capture)
6. View application status and notifications
7. View and pay bills
8. Register face for smart access

### 10.2 Required Screens (Designed, Not Implemented)
| Screen | API Required |
|--------|-------------|
| Account Activation | `POST /auth/activate` |
| Login | `POST /auth/login` |
| Home / Dashboard | `GET /users/me` |
| Application Form | `POST /applications`, `POST /applications/{id}/documents`, `POST /applications/{id}/submit` |
| Application Status | `GET /applications/status?cccd=` |
| Room Info | `GET /public/room/assignment/{id}` |
| Payment Screen | Payment API (TBD) |
| Face Registration | `POST /students/me/face` |
| Notifications | FCM push (future) |

### 10.3 API Contracts (Confirmed Ready)
All APIs listed in Section 6 are available. The backend is mobile-ready.

### 10.4 Offline Considerations
- Cache `GET /users/me` in SQLite/Room Database for offline profile display
- Cache application status locally
- Queue document uploads for retry when offline

### 10.5 Authentication Flow (Mobile)
1. First run → Account Activation screen → sets password, receives JWT pair
2. Subsequent runs → Login with email/password OR biometric shortcut (device-level, backed by stored refresh token)
3. Silent refresh: when access token expires, app calls `/auth/refresh-token` silently
4. Store tokens in iOS Keychain / Android Keystore

### 10.6 Current Status
**⚠️ NOT IMPLEMENTED** — No mobile app exists. Only API contracts documented. Backend API is ready for mobile integration.

---

## SECTION 11 — AI KNOWLEDGE BASE

### 11.1 Current State
- **Face Profile CRUD:** Implemented (student uploads image, admin approves)
- **Face Embeddings DB:** Implemented (V22_03 — `face_embeddings` table, 512-dim vector, HNSW index)
- **Face Verification Log:** Implemented (V22_04 — `face_verification_attempts`)
- **AI Embedding Pipeline:** ⚠️ External integration point — Python service call not confirmed in source

### 11.2 Target State
```
[Student Photo Upload] 
    → Cloudinary (URL stored)
    → Admin Approves
    → Backend calls AI Python service: POST /embeddings { imageUrl }
    → AI returns: float[512]
    → Backend stores vector in face_embeddings table

[Gate Camera Capture]
    → IoT sends frame or triggers backend
    → Backend calls AI: POST /verify { imageFrame }
    → AI returns: { profileId, confidenceScore }
    → Backend evaluates: score vs threshold + curfew policy
    → Decision: GRANTED / DENIED
    → Logged in access_history + face_verification_attempts
```

### 11.3 Face Recognition Pipeline
```
1. Image Upload: Student captures face → Cloudinary → URL stored
2. Admin Approval: Human review of photo quality
3. Embedding Generation: AI service extracts 512-dim vector from face image
4. Vector Storage: Stored in face_embeddings with HNSW index (cosine similarity)
5. Real-time Verification: New frame → AI extract → cosine search → match score → decision
```

### 11.4 Embedding Generation
- **Model:** Not specified in code — AI service is an external black box from backend's perspective
- **Dimensions:** 512 (confirmed by `vector(512)` in V22_03)
- **Index:** HNSW (Hierarchical Navigable Small World) with cosine ops
- **Trigger:** Backend calls AI service after admin approves face profile

### 11.5 Vector Search
```sql
-- Conceptual query for face verification
SELECT profile_id, student_id, 
       vector <=> :queryVector AS cosine_distance
FROM face_embeddings e
JOIN face_profiles p ON e.profile_id = p.profile_id
WHERE p.status = 'APPROVED'
ORDER BY cosine_distance ASC
LIMIT 1;
-- Accept if cosine_distance < threshold (e.g., 0.4)
```

### 11.6 Simulation Strategy (Demo)
For demo without real IoT hardware:
1. Pre-register a student face via `/students/me/face`
2. Admin approves via `/admin/faces/{id}/approve`
3. AI service (mock Python) returns fixed embedding
4. Simulate gate access via HTTP POST to backend access endpoint or MQTT publisher script
5. View result in access_history via admin dashboard

### 11.7 AI Ownership
- **Python AI Service:** External service (separate repo/container expected)
- **Backend:** Owns embedding storage and verification decision logic
- **Interface:** HTTP REST between backend and AI service

---

## SECTION 12 — IOT KNOWLEDGE BASE

### 12.1 Current State
- Database schema: ✅ Complete (V21_01 through V21_05)
- MQTT topics and payload contracts: ✅ Designed
- Curfew policy engine: ✅ Schema ready
- Backend MQTT consumer: ⚠️ Implementation status unclear
- Hardware: ❌ Not procured/deployed
- Simulation: Not formalized

### 12.2 Target State
```
Physical Gate Controller (ESP32):
  ├── Camera module → JPEG frame capture
  ├── RFID reader (RC522) → card UID
  ├── Relay module → door lock control
  └── Wi-Fi → MQTT broker → Backend
```

### 12.3 Planned Devices
| Device | Role | Protocol |
|--------|------|---------|
| ESP32 | Main microcontroller | Wi-Fi + MQTT |
| IP Camera / OV2640 | Face capture | JPEG frame |
| RC522 RFID Reader | Card UID scan | SPI → ESP32 |
| Fingerprint Sensor | (Optional) | UART → ESP32 |
| Relay Module | Door lock control | GPIO |
| Door Magnetic Lock | Physical lock | 12V relay |

### 12.4 MQTT Topics
| Topic | Publisher | Subscriber | Payload |
|-------|-----------|-----------|---------|
| `sdms/gate/{gateId}/verify` | ESP32 | Backend | `{ studentId?, rfidUid?, method, timestamp }` |
| `sdms/gate/{gateId}/decision` | Backend | ESP32 | `{ decision: GRANTED/DENIED, reason? }` |
| `sdms/gate/{gateId}/override` | Admin Portal | ESP32 | `{ type: REMOTE_UNLOCK/FIRE_EMERGENCY/SECURITY_LOCKDOWN }` |
| `sdms/gate/{gateId}/heartbeat` | ESP32 | Backend | `{ status: ONLINE, timestamp }` |

### 12.5 Access Decision Flow
```
ESP32 Event → MQTT Broker → Backend Consumer
    ↓
Idempotency check (processed_messages table)
    ↓
Student active resident check (OCCUPIED assignment)
    ↓
Curfew policy evaluation (building + time + resident_type)
    ↓
Face match check (if method=FACE_AI, call AI service)
    ↓
Decision: GRANTED | DENIED
    ↓
Log to access_history (append-only)
Log to face_verification_attempts (if face method)
    ↓
Publish to sdms/gate/{gateId}/decision
```

### 12.6 MQTT Payload Contracts
**Verify Request (ESP32 → Backend):**
```json
{
  "gateId": "gate-building-A-entrance",
  "method": "FACE_AI",
  "studentId": "uuid-optional",
  "rfidUid": "string-optional",
  "timestamp": "2026-06-22T23:00:00Z",
  "messageId": "uuid-for-dedup"
}
```

**Decision Response (Backend → ESP32):**
```json
{
  "decision": "GRANTED",
  "studentId": "uuid",
  "method": "FACE_AI",
  "timestamp": "2026-06-22T23:00:01Z"
}
```

### 12.7 MQTT Enums (V21_01)
- `access_decision_enum`: GRANTED, DENIED
- `override_type_enum`: REMOTE_UNLOCK, FIRE_EMERGENCY, SECURITY_LOCKDOWN
- `verification_method_enum`: FACE_AI, RFID, MANUAL_OVERRIDE, REMOTE_UNLOCK
- `resident_type_enum`: BOARDING, NON_BOARDING
- `curfew_type_enum`: STRICT, SOFT_WARNING

### 12.8 Simulation Strategy
For demo without hardware:
1. Run Mosquitto MQTT broker locally
2. Use MQTT Explorer or Python script to publish `sdms/gate/gate-001/verify` messages
3. Backend processes and publishes decision
4. Subscribe to decision topic to see result
5. Verify `access_history` table for logged events

### 12.9 Future Hardware Strategy
- Deploy ESP32 at building entrance with RC522 RFID + camera
- Connect to campus Wi-Fi (dedicated IoT VLAN recommended)
- MQTT broker on server — ESP32 connects to same internal network

---

## SECTION 13 — NETWORK & INFRASTRUCTURE

### 13.1 Network Topology (Planned)
```
Internet
    │
    ▼
[Nginx Reverse Proxy / Load Balancer]
    ├── /api/*  → Spring Boot (port 8080)
    └── /*      → React static files

[Database Server]
    └── PostgreSQL 17 (with pgvector)
        Port: 5432

[MQTT Broker]
    └── Mosquitto/HiveMQ
        Port: 1883 (MQTT)
        Port: 8883 (MQTT/TLS)

[Cloudinary] (External CDN)
    └── Image storage (avatars, documents, face photos)

[Brevo] (External Email)
    └── Transactional email service

[AI Python Service]
    └── Flask/FastAPI (port TBD)
        Endpoints: /embed, /verify

[IoT Devices — Campus LAN]
    └── ESP32 devices at gates
        MQTT over Wi-Fi → MQTT Broker
```

### 13.2 VLAN Strategy (Packet Tracer Design — Planned)
| VLAN | Name | Devices | Purpose |
|------|------|---------|---------|
| VLAN 10 | Server | Backend, DB, MQTT, AI Service | Isolated server zone |
| VLAN 20 | Admin | Admin workstations | Privileged access zone |
| VLAN 30 | IoT | ESP32 devices | Isolated IoT zone (MQTT only to broker) |
| VLAN 40 | Student | Student laptops/phones | Internet access only |

### 13.3 Security Zones
- IoT devices cannot directly access backend HTTP — only MQTT
- MQTT broker is the sole bridge between IoT VLAN and Server VLAN
- Admin VLAN has full backend access
- Student VLAN has internet access only (for mobile app)

> **[UNCERTAINTY]** The actual network topology from Packet Tracer design files was not found in the repository. This is a planned/theoretical design.

---

## SECTION 14 — SECURITY KNOWLEDGE BASE

### 14.1 Authentication
| Mechanism | Details |
|-----------|---------|
| **JWT Access Token** | HS256, 15-min expiry, contains userId + role |
| **JWT Refresh Token** | HS512 or separate secret, 7-day expiry |
| **BCrypt** | Password hashing (confirmed in db.sql seed: `$2a$10$...`) |
| **CCCD as temp password** | Initial activation uses student's national ID as temporary password |
| **Account status** | `PENDING_ACTIVATION` → `ACTIVE` (block login until activated) |

### 14.2 Authorization
| Approach | Details |
|----------|---------|
| **URL-level** | SecurityConfig defines public vs authenticated endpoints |
| **Method-level** | `@EnableMethodSecurity` + `@PreAuthorize("hasRole('ADMIN')")` on service/controller methods |
| **Roles** | `ADMIN`, `STUDENT` (stored as string in user_accounts.role) |

### 14.3 Public Endpoints (No Auth Required)
```
/api/v1/auth/**                  (all auth operations)
/api/v1/registrations/**         (check eligibility)
/api/v1/uploads/**               (file upload — public for application flow)
/api/v1/applications (POST)     (create draft)
/api/v1/applications/{id} (GET) (get application)
/api/v1/applications/status (GET)
/api/v1/applications/** (POST)  (submit, upload docs)
/swagger-ui/**
/v3/api-docs/**
```

### 14.4 CORS Configuration
```
Allowed Origins: http://localhost:5173 (dev only)
Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Allowed Headers: Authorization, Content-Type, Accept, Origin, X-Requested-With
Allow Credentials: true
```

> **[WARNING]** Production deployment requires updating CORS to actual domain. Wildcard is not used but only `localhost:5173` is whitelisted.

### 14.5 Face Security
- Face images stored on Cloudinary (CDN URLs)
- Admin must review and approve before face is used for access
- Verification confidence threshold must be tuned (not visible in current code)
- `face_verification_attempts` provides full audit trail

### 14.6 IoT Security
- MQTT broker should require authentication (username/password per device)
- TLS recommended for MQTT in production (port 8883)
- `processed_messages` table prevents replay attacks
- Access history is append-only (REVOKE DELETE, UPDATE from PUBLIC at DB level)
- Override types (FIRE_EMERGENCY, SECURITY_LOCKDOWN) require ADMIN auth

---

## SECTION 15 — DOCUMENTATION QUALITY AUDIT

### 15.1 Document Inventory
| Location | Status |
|----------|--------|
| `sdms-backend/docs/00-overview/` | Exists |
| `sdms-backend/docs/01-auth/` | Exists |
| `sdms-backend/docs/02-student/` | Exists |
| `sdms-backend/docs/03-registration/` | Exists |
| `sdms-backend/docs/04-application/` | Exists |
| `sdms-backend/docs/05-room/` | Exists |
| `sdms-backend/docs/06-payment/` | Exists |
| `sdms-backend/docs/07-face/` | Exists |
| `sdms-backend/docs/08-smart-access/` | Exists |
| `sdms-backend/docs/09-notification/` | Exists |
| `sdms-backend/docs/10-admin-web/` | Exists |
| `sdms-backend/docs/11-student-mobile/` | Exists |
| `sdms-backend/docs/12-audit/` | Exists |
| `sdms-backend/docs/13-archive/` | Exists |
| `sdms-backend/docs/14-infra/` | Exists |
| `sdms-backend/docs/15-iot/` | Exists |
| `sdms-backend/docs/APP-API-DOCS.md` | Exists — Mobile-focused API guide |
| `sdms-backend/docs/db.sql` | Seed data script |
| `sdms-frontend/docs/PROJECT_RULES.md` | Frontend coding rules |
| `docs/` (root) | Empty directory |
| `README.md` (root) | Exists |

### 15.2 Issues Identified
| Issue Type | Description |
|------------|-------------|
| **Missing** | No IoT simulation guide exists |
| **Missing** | No deployment guide |
| **Missing** | No AI service API contract document |
| **Missing** | No environment variable setup guide (only .env.example) |
| **Missing** | Root `docs/` directory is completely empty |
| **Outdated** | APP-API-DOCS.md references `localhost:8082` (different port from application.yml default 8080) |
| **Incomplete** | Mobile API docs only cover auth, profile, and application — missing face, payment, access APIs |
| **Uncertainty** | Payment public endpoint for student payment flow not fully documented |

---

## SECTION 16 — PROJECT READINESS AUDIT

### 16.1 Backend Readiness
| Module | Readiness | Notes |
|--------|-----------|-------|
| Auth | ✅ PASS | Full implementation |
| User | ✅ PASS | Full implementation |
| Student | ✅ PASS | Full implementation |
| Registration | ✅ PASS | Full implementation with Excel import |
| Application | ✅ PASS | Most complex module, fully implemented |
| Room | ✅ PASS | Full CRUD + assignment lifecycle |
| Payment | ⚠️ WARNING | No live gateway; manual recording only |
| Face | ⚠️ WARNING | Backend complete; AI service integration external |
| Smart Access | ⚠️ WARNING | Schema+design complete; MQTT consumer TBD |
| Upload | ✅ PASS | Cloudinary integration working |

### 16.2 Web Readiness
| Area | Readiness | Notes |
|------|-----------|-------|
| Admin Login | ✅ PASS | |
| Admin Dashboard | ✅ PASS | |
| Application Management | ✅ PASS | Full review workflow |
| Face Approval | ✅ PASS | |
| Room Dashboard | ✅ PASS | |
| Payment Management | ✅ PASS | |
| Check-In Management | ✅ PASS | |
| Student Public Portal | ✅ PASS | Registration + face + payment + status |
| Student Directory | ❌ FAIL | No screen exists |
| Access History Viewer | ❌ FAIL | No screen exists |
| IoT Controls | ❌ FAIL | No screen exists |

### 16.3 Mobile Readiness
| Area | Readiness | Notes |
|------|-----------|-------|
| API Contracts | ✅ PASS | All APIs ready |
| Mobile App | ❌ FAIL | Not implemented |

### 16.4 AI Readiness
| Area | Readiness | Notes |
|------|-----------|-------|
| DB Schema | ✅ PASS | Vector storage ready |
| Backend API | ✅ PASS | Face profile + embedding endpoints |
| Python AI Service | ❌ FAIL | Not in repository |
| Integration | ⚠️ WARNING | HTTP contract not finalized |

### 16.5 IoT Readiness
| Area | Readiness | Notes |
|------|-----------|-------|
| DB Schema | ✅ PASS | Complete |
| MQTT Design | ✅ PASS | Topics designed |
| Backend Consumer | ⚠️ WARNING | Implementation unclear |
| Hardware | ❌ FAIL | Not procured |
| Simulation | ❌ FAIL | No simulation script exists |

### 16.6 Demo Readiness
| Demo Scenario | Readiness |
|---------------|-----------|
| Student applies, admin approves | ✅ PASS |
| Student pays, gets room assignment | ⚠️ WARNING (manual payment) |
| Admin approves face photo | ✅ PASS |
| Student enters dormitory (IoT) | ❌ FAIL (needs simulation setup) |
| Admin views access logs | ⚠️ WARNING (no frontend screen) |

---

## SECTION 17 — ROADMAP

### 17.1 Next 3 Days (Critical Path)
1. **IoT Simulation Script** — Python MQTT publisher to simulate gate events (1 day)
2. **AI Mock Service** — Python Flask service returning fixed 512-dim embeddings (1 day)
3. **Access History UI** — Admin screen to view `access_history` log (1 day)

### 17.2 Next 2 Weeks
1. **Payment Gateway** — Integrate VNPay or mock gateway for student payment flow
2. **Student Directory UI** — Admin screen to search/view students
3. **Mobile App Skeleton** — Flutter or React Native with auth + profile + application screens
4. **Curfew Policy UI** — Admin screen to create/edit curfew rules
5. **Demo Environment Setup** — Docker compose with backend + DB + MQTT + AI mock

### 17.3 Next Month
1. **Complete Mobile App** — All screens + push notification (FCM)
2. **IoT Hardware Setup** — ESP32 + RC522 + relay at test gate
3. **Real AI Service** — Python with actual face recognition model (InsightFace or FaceNet)
4. **CORS Production Config** — Update for real domain
5. **Full End-to-End Demo** — All 5 flows working with real hardware

### 17.4 Next Semester (Production)
1. **University SIS Integration** — Direct API import of student roster
2. **Online Payment** — Live VNPay/MoMo integration
3. **Multi-building Scale** — Multiple gates, floors, buildings
4. **Analytics Dashboard** — Administrative reporting (occupancy rates, payment delinquency, access anomalies)
5. **Security Hardening** — MQTT TLS, VLAN deployment, penetration testing

---

## SECTION 18 — MASTER RECOMMENDATION

### Priority 1: AI Mock Service & IoT Simulator (Demo Critical)
The core value proposition of a "Smart" dormitory relies on the gate access flow. Since physical hardware is missing, immediately build software simulators.
- **Deliverable:** Python Flask App to mock the Face Embedding pipeline (return fixed 512-dim vectors).
- **Deliverable:** Python MQTT Publisher to simulate gate ESP32 events.

### Priority 2: Missing UI Screens (High Value)
**Access History Viewer + Student Directory**  
Admin needs to see who entered the dormitory when. Add:
- `/admin/access` — access_history log with student name, timestamp, decision, method
- `/admin/students` — searchable student directory

### Priority 3: Mobile App Skeleton
The API backend is 100% ready for a mobile app. 
- **Deliverable:** A basic Flutter or React Native app for Students (Login, View Profile, Application Status).
