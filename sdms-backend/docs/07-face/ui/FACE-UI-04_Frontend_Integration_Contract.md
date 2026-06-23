> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-UI-04: Frontend Integration Contract Audit

## 1. Executive Summary
This document establishes the definitive REST API integration contracts between the SDMS Frontend clients (React Native Student App & React Admin Web) and the Spring Boot SDMS Backend. It serves as the single source of truth for all data exchange DTOs, ensuring parallel development across teams.

---

## 2. Global Request & Response Standards

To guarantee system-wide consistency and robust observability across the SDMS Modular Monolith, the following standards apply to EVERY endpoint defined in this document:

*   **Traceability (`X-Request-Id`):** The Frontend clients (React/React Native) MUST generate and attach an `X-Request-Id` (UUID) to the headers of every outgoing HTTP request. This ensures end-to-end distributed tracing from the User's device, through the API Gateway and Spring Boot, all the way to the Python AI Service (aligning with `FACE-AI-03`).
*   **Standard Wrapper (`ApiResponse<T>`):** All successful responses from the Spring Boot backend will be wrapped in a standardized envelope. The JSON response structures defined in the sections below represent the actual `data` object inside this wrapper.
    ```json
    {
      "success": true,
      "message": "OK", // Or a specific success message
      "data": { ... } // The specific DTOs defined below
    }
    ```

---

## PART A: STUDENT APP CONTRACTS

### 1. `GET /api/v1/face/profile`
*   **Purpose:** Fetches the current biometric enrollment status for the authenticated student.
*   **Request:** No payload. JWT Bearer token required.
*   **Response:**
    ```json
    {
      "faceStatus": "APPROVED", // NOT_REGISTERED, PENDING, APPROVED, REJECTED, REVOKED
      "rejectionReason": null,
      "updatedAt": "2026-06-21T10:00:00Z"
    }
    ```
*   **Permissions:** `FACE_VIEW_SELF`

### 2. `POST /api/v1/face/upload`
*   **Purpose:** Submits a new face portrait for verification.
*   **Request:** `multipart/form-data` containing `file` (image) OR JSON containing `imageBase64`. (Header: `X-Request-Id: uuid`).
*   **Validation:** Max 5MB. JPEG/PNG only.
*   **Response:** `202 Accepted`
    ```json
    {
      "success": true,
      "message": "Photo uploaded successfully and is awaiting review.",
      "data": { "faceStatus": "PENDING" }
    }
    ```
*   **Error Codes:** `400` (Invalid Format / Multiple Faces / No Face), `413` (Too Large).
*   **Permissions:** `FACE_UPDATE_SELF`

### 3. `GET /api/v1/notifications`
*   **Purpose:** Retrieves the inbox of Face Approval/Rejection/Revoke alerts.
*   **Request:** `?page=0&size=20`
*   **Response:**
    ```json
    {
      "content": [
        { "id": "uuid", "type": "FACE_REJECTED", "message": "Photo too blurry.", "read": false, "createdAt": "..." }
      ],
      "totalPages": 1
    }
    ```
*   **Permissions:** `FACE_VIEW_SELF`

### 4. `GET /api/v1/access/status`
*   **Purpose:** Fetches the current physical gate access eligibility (Owned by Smart Access Module).
*   **Request:** No payload.
*   **Response:**
    ```json
    {
      "accessEligibility": "DENIED",
      "reason": "CURFEW_ACTIVE",
      "curfewEndTime": "2026-06-22T05:00:00Z"
    }
    ```
*   **Permissions:** `FACE_VIEW_ACCESS_STATUS`

---

## PART B: ADMIN WEB CONTRACTS

### 1. `GET /api/v1/admin/face/queue`
*   **Purpose:** Retrieves the paginated list of students awaiting face photo approval.
*   **Request:** `?page=0&size=50&sortBy=submittedAt&sortDir=ASC`
*   **Response:**
    ```json
    {
      "content": [
        { "studentId": "SV123", "fullName": "Nguyen Van A", "submittedAt": "...", "newPhotoUrl": "https://..." }
      ],
      "totalElements": 150
    }
    ```
*   **Permissions:** `FACE_VIEW_QUEUE`

### 2. `POST /api/v1/admin/face/approve`
*   **Purpose:** Staff manually approves a pending photo.
*   **Request:** `{ "studentId": "SV123" }`
*   **Response:** `200 OK`
*   **Permissions:** `FACE_APPROVAL`

### 3. `POST /api/v1/admin/face/reject`
*   **Purpose:** Staff rejects a pending photo with a specific reason.
*   **Request:**
    ```json
    { "studentId": "SV123", "reasonCode": "BLURRY_OR_DARK", "customMessage": "Please capture under better lighting." }
    ```
*   **Response:** `200 OK`
*   **Permissions:** `FACE_APPROVAL`

### 4. `GET /api/v1/admin/face/directory`
*   **Purpose:** Master list of all registered faces.
*   **Request:** `?status=APPROVED&search=Nguyen&page=0&size=50`
*   **Response:**
    ```json
    { "content": [ { "studentId": "SV123", "fullName": "...", "status": "APPROVED", "approvedBy": "admin_01" } ] }
    ```
*   **Permissions:** `FACE_VIEW_DIRECTORY`

### 5. `POST /api/v1/admin/face/revoke`
*   **Purpose:** Admin forcibly removes gate access for an approved student.
*   **Request:** `{ "studentId": "SV123", "reason": "SECURITY_VIOLATION" }`
*   **Response:** `200 OK`
*   **Permissions:** `FACE_REVOKE`

---

## PART C: ERROR HANDLING CONTRACT

The Frontend MUST globally intercept and handle standard HTTP status codes originating from the Spring Boot API Gateway.

*   **`401 Unauthorized`:** JWT is missing or expired. Action: Clear local state and redirect to `/login`.
*   **`403 Forbidden`:** User lacks the specific `FACE_*` permission for the requested action. Action: Display "Access Denied" overlay/modal. Do not logout.
*   **`404 Not Found`:** Requested resource (e.g., student profile) does not exist. Action: Redirect to `/404` or show empty state.
*   **`409 Conflict`:** Business rule violation (e.g., attempting to approve a photo that is already approved). Action: Show error toast and trigger a data refetch to sync UI state.
*   **`422 Unprocessable Entity`:** Validation failure (e.g., missing rejection reason). Action: Highlight the specific input field in red with the validation message.
*   **`500 Internal Server Error`:** Backend crash. Action: Display a generic "System Error" screen. Do not expose stack traces to the UI.

---

## PART D: LOADING STATES

To maintain perceived performance, the React/React Native clients must implement standardized loading behaviors.

*   **Skeleton Loaders:** Used on the `Face Dashboard` and `Approval Queue` during the initial API fetch (`GET`). Skeletons mimic the exact shape of the data cards/rows to prevent Cumulative Layout Shift (CLS).
*   **Spinner (Activity Indicator):** Used inside action buttons during mutations (`POST` /upload, /approve, /revoke) to prevent duplicate submissions. Buttons must be disabled while spinning.
*   **Empty State:** Displayed when `totalElements === 0` (e.g., Empty Approval Queue, or no Notifications). Must include an illustration and clear text (e.g., "Hooray! The queue is completely clear.").
*   **Offline State:** Detected via `navigator.onLine` (Web) or `NetInfo` (React Native). Disables all mutations and shows a persistent "No Internet Connection" banner.

---

## PART E: IMPLEMENTATION READINESS

**Implementation Readiness Evaluation:**
*   **React App Team:** Has full DTO structures for Profile, Upload, Notifications, and Access Status. Ready.
*   **React Admin Team:** Has full paginated DTOs for Queue and Directory, along with mutation contracts for decisions. Ready.
*   **Spring Boot Team:** Possesses the exact JSON Request/Response shapes they must expose to satisfy the UI. Ready.

**Final Decision: PASS** ✅

The Frontend Integration Contract perfectly encapsulates all business requirements while adhering to the SDMS Modular Monolith security boundaries. The teams are cleared to implement API clients (e.g., Axios/RTK Query).

