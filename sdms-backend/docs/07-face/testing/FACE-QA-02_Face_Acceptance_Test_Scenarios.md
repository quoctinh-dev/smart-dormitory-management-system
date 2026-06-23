> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-QA-02: Face Acceptance Test Scenarios

## 1. Executive Summary
This document provides the official User Acceptance Test (UAT) scenarios for the SDMS Face Recognition subsystem. These scenarios validate end-to-end user journeys across the Student App, Admin Web, and the underlying AI/Backend services, ensuring full alignment with the governance and UI/UX constraints.

---

## 2. Test Scenarios

### UAT-01: Student registers face successfully
*   **Preconditions:** Student is logged in. Face status is `NOT_REGISTERED`.
*   **Test Steps:**
    1. Navigate to the Face Dashboard.
    2. Click "Setup Face Access".
    3. Capture a clear portrait photo via Camera (or Gallery upload).
    4. Click "Submit".
*   **Expected Result:** A success toast appears. The UI redirects to the `Face Pending` screen.
*   **Post Conditions:** Student's Face Status is updated to `PENDING` in the database. The image is stored securely, awaiting Admin review.

### UAT-02: Student uploads invalid image
*   **Preconditions:** Student is logged in. Face status is `NOT_REGISTERED`.
*   **Test Steps:**
    1. Navigate to the Capture screen.
    2. Upload an image containing two faces (or an image larger than 5MB).
    3. Click "Submit".
*   **Expected Result:** The UI intercepts the `HTTP 400 (ERR_MULTIPLE_FACES)` or `HTTP 413` error and displays an inline error message: "Please ensure only one face is clearly visible" or "Image exceeds 5MB".
*   **Post Conditions:** Face Status remains `NOT_REGISTERED`. No data is saved to the database.

### UAT-03: Student re-registers face
*   **Preconditions:** Student face status is `REJECTED` or `REVOKED`.
*   **Test Steps:**
    1. Navigate to Face Dashboard.
    2. Review the rejection/revocation reason displayed on the card.
    3. Click "Re-capture Photo".
    4. Upload a new, valid photo and submit.
*   **Expected Result:** The UI returns to the `Face Pending` screen.
*   **Post Conditions:** Face Status transitions back to `PENDING`. Previous invalid embeddings are overwritten or safely archived.

### UAT-04: Admin approves face profile
*   **Preconditions:** A student has a `PENDING` face profile. Admin/Staff is logged into the Admin Web with `FACE_APPROVAL` permission.
*   **Test Steps:**
    1. Navigate to "Face Approval Queue".
    2. Click "Review" on the pending student's row.
    3. Compare the newly uploaded photo with the Official Student ID in the modal.
    4. Click "Approve".
*   **Expected Result:** Modal closes. Success toast appears. The row is removed from the Queue.
*   **Post Conditions:** Student Face Status becomes `APPROVED`. `IdentityVerifiedEvent` readiness is activated. A push notification is sent to the Student.

### UAT-05: Admin rejects face profile
*   **Preconditions:** A student has a `PENDING` face profile. Admin/Staff is logged in with `FACE_APPROVAL` permission.
*   **Test Steps:**
    1. Open the Review Modal for the student.
    2. Click "Reject".
    3. Select "Photo too blurry" from the reason dropdown and click confirm.
*   **Expected Result:** Modal closes. Success toast appears. The row is removed from the Queue.
*   **Post Conditions:** Student Face Status becomes `REJECTED`. The rejection reason is saved. A push notification is sent to the Student.

### UAT-06: Admin revokes face profile
*   **Preconditions:** Student Face Status is `APPROVED`. Admin is logged in with `FACE_REVOKE` permission.
*   **Test Steps:**
    1. Navigate to the "Face Directory".
    2. Search for the student and open the Details Panel.
    3. Click "Revoke Access".
    4. Provide a reason (e.g., "Disciplinary Action") and confirm the dialog.
*   **Expected Result:** The status badge changes to `REVOKED` in the directory.
*   **Post Conditions:** The student's biometric template is immediately invalidated. Physical gate access is blocked. A notification is sent to the Student.

### UAT-07: Face AI timeout
*   **Preconditions:** A physical Gate triggers an access request. The Docker container running the Python AI Service is deliberately paused or heavily throttled.
*   **Test Steps:**
    1. IoT Gate sends a captured image to the Spring Boot Backend for verification.
    2. Spring Boot forwards the request to the Python AI Service.
*   **Expected Result:** After exactly 1000ms, Spring Boot aborts the connection. The IoT Gate receives a "System Offline - Access Denied" fallback response.
*   **Post Conditions:** The Gate remains locked (Fail Closed). Metrics log the timeout incident.

### UAT-08: Permission denied
*   **Preconditions:** Staff member logs into Admin Web possessing `FACE_APPROVAL` but lacking `FACE_REVOKE`.
*   **Test Steps:**
    1. Navigate to the "Face Directory".
    2. Open a student's Detail Panel.
*   **Expected Result:** The "Revoke Access" button is completely hidden from the UI. If the API is invoked manually via Postman, it returns `HTTP 403 Forbidden`.
*   **Post Conditions:** No state changes. System remains secure.

### UAT-09: Face profile not found
*   **Preconditions:** Student is logged in but has never initiated face registration.
*   **Test Steps:**
    1. Navigate to the Face Dashboard.
*   **Expected Result:** The Biometric Status Card displays an empty state: "No face data registered."
*   **Post Conditions:** The system waits for the user to initiate the capture flow.

### UAT-10: Access verification successful
*   **Preconditions:** Student Face Status is `APPROVED`. Curfew is inactive. Student account is in good standing.
*   **Test Steps:**
    1. Student stands in front of the physical IoT Gate camera.
    2. Camera captures the face and transmits it to the backend.
*   **Expected Result:** Python AI extracts the vector. Java `pgvector` finds a match $\ge 0.60$ with an ambiguity gap $\ge 0.05$. Smart Access validates the rules. Gate opens (Relay ON).
*   **Post Conditions:** Access History logs a successful entry/exit.

### UAT-11: Access verification denied
*   **Preconditions:** Student Face Status is `APPROVED`. Curfew is currently **ACTIVE** (e.g., it is 2:00 AM).
*   **Test Steps:**
    1. Student stands in front of the physical IoT Gate camera.
*   **Expected Result:** Python AI extracts the vector. Java matches the identity. Smart Access evaluates the curfew rule and denies access. Gate remains locked. LED turns RED.
*   **Post Conditions:** Access History logs a `DENIED - CURFEW` event.

### UAT-12: Model version upgraded
*   **Preconditions:** The system currently uses `insightface-arcface-v1`. A new `v2` Python endpoint is deployed.
*   **Test Steps:**
    1. Send an image to the new `/api/v2/face/extract` endpoint.
*   **Expected Result:** Python responds with the vector and strictly includes `"modelVersion": "insightface-arcface-v2"` in the payload. Java persists this exactly into the database.
*   **Post Conditions:** The system successfully handles the new vector format without corrupting existing `v1` vectors, enabling safe batch migration.

---

## 3. Final Decision

**UAT Coverage Complete?**
**YES.** 🟢

The Acceptance Test Scenarios comprehensively cover the happy paths, negative paths, cross-module integrations (Smart Access policies), and administrative safeguards. The QA team is fully aligned with the technical and business boundaries.

