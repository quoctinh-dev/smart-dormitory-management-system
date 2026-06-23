# BACKEND-FREEZE-02A: Actor Ownership Validation Audit

## 1. Executive Summary
This audit validates the physical Spring Boot codebase against the strict actor ownership boundaries defined in `ACTOR-MATRIX-01`. By analyzing `@RequestMapping` paths, `@PreAuthorize` annotations, and controller structures, this report identifies architectural leaks, inconsistent UI channeling, and missing internal APIs that violate actor boundaries.

## 2. Controller Compliance Matrix
Evaluates whether HTTP Controller paths adhere to the `/student/` vs `/admin/` channeling standard.

| Module | Route Prefix Strategy | Compliance Status | Finding |
| --- | --- | --- | --- |
| `Room` | `/api/v1/admin/rooms`, `/api/v1/student/room` | **PASS** | Perfect isolation. Routes explicitly declare actor ownership. |
| `Application` | `/api/v1/applications`, `/api/v1/admin/applications`| **PASS WITH FIXES** | Admin is isolated, but Student route lacks the `/student/` explicit prefix. |
| `Registration`| `/api/v1/registrations`, `/api/v1/admin/registration-periods`| **PASS WITH FIXES** | Admin isolated, Student/Public route lacks explicit prefix. |
| `Payment` | `/api/payments`, `/api/webhooks/sepay` | **FAIL** | Completely ignores the `/v1/` standard and actor prefixes. |
| `Smart Access`| `/api/v1/access/*` | **FAIL** | Mixes Student (History) and Admin (Curfew, Unlock) routes without namespace distinction. |
| `Student` | `/api/v1/students` | **FAIL** | Lacks `/student/` vs `/admin/` namespace distinction. |

## 3. Permission Compliance Matrix
Evaluates whether the security annotations securely enforce the Actor Matrix.

| Module | Security Enforcement Strategy | Compliance Status | Finding |
| --- | --- | --- | --- |
| `Smart Access`| `SmartAccessPermissions` Constants | **PASS** | Strictly enforced via granular domain constants. Highly secure. |
| `Room` | `@PreAuthorize("hasRole('ADMIN')")` | **WARNING** | Operates securely, but violates the system's new constant-registry standard. |
| `Student` | `@PreAuthorize("hasRole('STUDENT')")` | **WARNING** | Operates securely, but uses legacy string hardcoding. |
| `Payment` | `@PreAuthorize("hasRole('STUDENT')")` | **WARNING** | Same as above. |
| `Registration`| `@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")` | **WARNING** | Same as above. |

## 4. API Compliance & Ownership Violations

### Violation 1: Inconsistent REST Channeling (Route Drift)
- **Observation:** The frontend teams (Student App vs Admin Web) require clean, predictable API paths. `Room` perfectly splits endpoints (`/api/v1/admin/beds` vs `/api/v1/student/room`). However, `Smart Access` throws all operations (Admin curfew config vs Student history) under a single `/api/v1/access/` namespace, relying purely on method-level `@PreAuthorize` for safety.
- **Impact:** Frontend integration requires digging into Swagger docs to figure out which `/access/` endpoint belongs to which App. High risk of UI teams accidentally calling wrong boundaries.
- **Recommendation:** Refactor all controllers globally to strictly enforce `/api/v1/admin/[domain]` and `/api/v1/student/[domain]`.

### Violation 2: Missing IoT System API (Gate Scans)
- **Observation:** The `ACTOR-MATRIX-01` clearly states the `IoT Service` actor scans faces and sends payloads to the Backend. However, zero controllers in `Smart Access` expose an IoT ingestion endpoint (e.g., `/api/v1/internal/access/scan`). 
- **Impact:** The hardware gate has no way to communicate with the Spring Boot backend. The IoT hardware flow is a dead end.
- **Recommendation:** Create `InternalAccessController` protected by IP-whitelisting or an Internal API Key (not JWT) to ingest Gate MQTT/REST payloads.

### Violation 3: Payment Webhook Security Verification
- **Observation:** `/api/webhooks/sepay` exists for the System/3rd-Party Actor.
- **Impact:** This must be a publicly exposed endpoint to allow SePay to reach the server.
- **Recommendation:** Ensure Spring Security `SecurityFilterChain` explicitly allows `permitAll()` for this specific webhook route, while enforcing strict cryptographical signature validation inside the controller payload.

## 5. Final Actor Ownership Compliance Matrix

| Actor Channel | API Readability | Security Enforcement | Missing Capability |
| --- | --- | --- | --- |
| **Student Mobile**| Poor (Inconsistent prefixes) | Strong (JWT + `@PreAuthorize`) | Face Registration API |
| **Admin Web** | Medium (Mostly `/admin/`) | Strong (JWT + `@PreAuthorize`) | Face Review Queue API |
| **IoT Service** | N/A | **Missing** | Gate Scan Ingestion API |
| **AI Service** | N/A | **Missing** | Extraction API (FastAPI) |
| **System** | N/A | Strong | Fully Automated |

## Final Decision
**PASS WITH FIXES**
The physical backend successfully protects all endpoints from unauthorized execution (No student can trigger an admin method thanks to `@PreAuthorize`). However, the HTTP routing architecture is severely fragmented and the IoT hardware ingestion pipeline is entirely missing from the codebase. The backend team must harmonize API paths to `v1/admin` and `v1/student` to align strictly with the Actor Matrix channels.
