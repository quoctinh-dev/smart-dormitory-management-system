> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-UI-03: Screen Specification & Wireframe Architecture

## 1. Executive Summary
This document provides the definitive screen-by-screen specifications and wireframe architecture for the SDMS Face Subsystem. It translates the user journeys (`FACE-UI-01`) and screen boundaries (`FACE-UI-02`) into granular component-level requirements for the Frontend Engineering teams.

---

## PART A: STUDENT APP SPECIFICATIONS

### 1. Face Dashboard
*   **1. Screen Purpose:** Central hub for students to view their biometric enrollment status and their physical gate access eligibility.
*   **2. Components:**
    *   **Biometric Status Card:** Displays the current AI state (e.g., `APPROVED`, `REJECTED`).
    *   **Gate Access Status Card:** Displays the Smart Access state (e.g., `ACCESS GRANTED`, `DENIED - CURFEW`).
    *   **Action Button:** "Update Photo" or "Setup Face Access".
*   **3. UI States:** Renders conditionally based on `NOT_REGISTERED`, `PENDING`, `APPROVED`, `REJECTED`, or `REVOKED`.
*   **4. User Actions:** Tap Action Button $\rightarrow$ Navigates to `/face/capture`.
*   **5. Validation Rules:** Action Button is disabled if state is `PENDING`.
*   **6. Empty States:** If `NOT_REGISTERED`, display a placeholder avatar with "No face data registered."
*   **7. Error States:** Network offline banner if status cannot be fetched.
*   **8. Success States:** Green checkmark and "You are ready for gate access!" when both cards are positive.

### 2. Face Capture
*   **1. Screen Purpose:** Interface for capturing or uploading a high-quality face portrait.
*   **2. Components:**
    *   **Camera Viewport / Gallery Picker:** Video stream or file upload area.
    *   **Guide Overlay:** A dashed oval shape indicating where the face should be positioned.
    *   **Action Bar:** "Capture" / "Switch Camera" / "Pick from Gallery" / "Submit".
*   **3. UI States:** `Ready`, `Capturing`, `Reviewing`, `Uploading`.
*   **4. User Actions:** Take Photo $\rightarrow$ Review Photo $\rightarrow$ Submit.
*   **5. Validation Rules:** Image file size must be $\le$ 5MB. Must be JPEG/PNG.
*   **6. Empty States:** N/A (Camera feed is live).
*   **7. Error States:**
    *   "Camera permission denied" $\rightarrow$ Show fallback gallery button.
    *   "Multiple Faces Detected" (caught from API) $\rightarrow$ Prompt recapture.
    *   "Image too large" $\rightarrow$ Prompt recapture.
*   **8. Success States:** Transitions immediately to Face Pending screen.

### 3. Face Pending
*   **1. Screen Purpose:** A waiting screen indicating manual staff review is underway.
*   **2. Components:** Loading animation/illustration (e.g., an hourglass or magnifying glass over a profile). "Under Review" text block.
*   **3. UI States:** `Awaiting_Approval`.
*   **4. User Actions:** "Return to Dashboard".
*   **5. Validation Rules:** Capture action is strictly disabled.
*   **6. Empty States:** N/A.
*   **7. Error States:** N/A.
*   **8. Success States:** Push notification received upon approval.

### 4. Notification Center
*   **1. Screen Purpose:** In-app inbox to store permanent records of Approval, Rejection, and Revocation messages.
*   **2. Components:** List View of notification cards. Unread badges.
*   **3. UI States:** `Unread`, `Read`.
*   **4. User Actions:** Tap to read $\rightarrow$ Marks as read. Tap "Re-register" on a rejection notice $\rightarrow$ Navigates to Face Capture.
*   **5. Validation Rules:** N/A.
*   **6. Empty States:** "You have no new notifications." with a mail/bell illustration.
*   **7. Error States:** "Failed to load notifications. Pull to refresh."
*   **8. Success States:** Notification marks as read immediately.

---

## PART B: ADMIN WEB SPECIFICATIONS

### 1. Face Approval Queue
*   **1. Screen Purpose:** Allows Staff to rapidly process pending face registrations.
*   **2. Components:** DataGrid (Table), Search Bar, Bulk Actions (Optional).
*   **3. Data Grid Columns:** `Student ID`, `Name`, `Submission Date`, `Status (PENDING)`, `Actions (Review Button)`.
*   **4. Filters:** Filter by Date Range, Sort by Oldest/Newest.
*   **5. Actions:** Click "Review" $\rightarrow$ Opens Face Review Modal.
*   **6. Dialogs:** N/A.
*   **7. Error States:** "Unable to fetch queue" (Network Error).

### 2. Face Review Modal
*   **1. Screen Purpose:** Side-by-side comparison for manual anti-spoofing verification.
*   **2. Components:**
    *   Left Panel: **Official Student ID Photo** (fetched from student record).
    *   Right Panel: **Newly Uploaded Photo** (with bounding box overlay if possible).
    *   Decision Bar: "Approve" (Green), "Reject" (Red).
*   **3. Data Grid Columns:** N/A.
*   **4. Filters:** N/A.
*   **5. Actions:**
    *   Click "Approve" $\rightarrow$ API Call $\rightarrow$ Closes modal, removes row from queue.
    *   Click "Reject" $\rightarrow$ Opens Rejection Reason form.
*   **6. Dialogs:** Rejection Reason Dialog (Dropdown: "Not a clear face", "Wearing mask", "Not the same person").
*   **7. Error States:** "Failed to process decision. Please try again."

### 3. Face Directory
*   **1. Screen Purpose:** Master registry of all processed biometric profiles.
*   **2. Components:** DataGrid, Advanced Search, Detail Drawer/Panel.
*   **3. Data Grid Columns:** `Student ID`, `Name`, `Face Status` (`APPROVED`, `REVOKED`), `Approval Date`, `Approved By`.
*   **4. Filters:** Filter by `Status`, Search by `ID/Name`.
*   **5. Actions:**
    *   Click Row $\rightarrow$ Opens Details Panel.
    *   Inside Details $\rightarrow$ "Revoke Access" (Requires `FACE_REVOKE` permission).
*   **6. Dialogs:** Revocation Confirmation Dialog ("Are you sure you want to revoke biometric access for this student?").
*   **7. Error States:** "Failed to load directory."

---

## PART C: WIREFRAME ARCHITECTURE

*   **Layout:**
    *   **Student App:** Standard Mobile App layout. Bottom Navigation Bar (Dashboard, Notifications, Profile). Clean, card-based UI with ample padding (Touch targets $\ge$ 44x44pt).
    *   **Admin Web:** Desktop-optimized Dashboard layout. Fixed Left Sidebar (Navigation). Top Header (User Profile). Main Content Area (Full width DataGrids).
*   **Navigation:**
    *   **Student:** Stack navigation for the Capture flow (Pushes screens onto stack, pops back to Dashboard). Tab navigation for root.
    *   **Admin:** Single Page Application (SPA) routing (`react-router-dom`). URL reflects current view.
*   **Page Structure (Admin):** Breadcrumbs $\rightarrow$ Page Title $\rightarrow$ Toolbar (Search/Filters) $\rightarrow$ DataGrid $\rightarrow$ Pagination.
*   **Responsive Rules:**
    *   Student App: Fluid width for various mobile aspect ratios.
    *   Admin Web: DataGrids scroll horizontally on smaller screens. The Review Modal stacks photos vertically if the viewport width drops below 768px.

---

## PART D: PERMISSION VISIBILITY MATRIX

Strict governance: Visibility and actionability are governed by Permissions, not Roles.

| Screen / Component | Required Permission | Behavior if Missing |
| :--- | :--- | :--- |
| **Student Dashboard (Biometric)** | `FACE_VIEW_SELF` | Screen 403 / Redirect to Login |
| **Gate Access Status Card** | `FACE_VIEW_ACCESS_STATUS` | Card hidden (owned by Smart Access module) |
| **Capture & Upload** | `FACE_UPDATE_SELF` | Capture button hidden/disabled |
| **Approval Queue (View)** | `FACE_VIEW_QUEUE` | Nav item hidden. Route returns 403 |
| **Review Modal (Approve/Reject)** | `FACE_APPROVAL` | "Review" button disabled in Grid |
| **Face Directory (View)** | `FACE_VIEW_DIRECTORY` | Nav item hidden. Route returns 403 |
| **Revoke Action Button** | `FACE_REVOKE` | Button hidden inside Details Panel |

---

## PART E: IMPLEMENTATION READINESS

**Implementation Readiness Evaluation:**
*   **React App Team:** Possesses granular specifications for states, validations, and the explicit separation of biometric vs access cards. Ready to build components.
*   **React Admin Team:** Possesses detailed DataGrid column layouts, filter requirements, and the critical Side-by-Side review modal workflow. Ready to build components.

**Final Decision: PASS** ✅

The UI Screen Specifications and Wireframe Architecture are thoroughly defined, constraint-compliant, and ready for Frontend coding sprints.

