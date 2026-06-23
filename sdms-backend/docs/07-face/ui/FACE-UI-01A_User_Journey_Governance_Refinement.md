> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-UI-01A: User Journey Governance Refinement

## 1. Executive Summary
This document serves as an addendum to the `FACE-UI-01` User Journey & Screen Architecture, applying strict governance refinements regarding Role vs Permission boundaries, Image Source policies, and Access Status visibility.

**Overall Refinement Result: PASS** ✅

---

## 2. Review Area 1: Role vs Permission
**Status: Frozen**

To comply with the SDMS security architecture, the frontend must distinguish between what a user can *see* versus what a user can *do*.
* **UI Visibility:** Can be driven by coarse-grained Roles (e.g., `STUDENT_ROLE`, `STAFF_ROLE`, `ADMIN_ROLE`). For example, displaying the "Face Approval Queue" menu item to users with `STAFF_ROLE`.
* **Business Actions:** MUST be guarded by fine-grained Permissions.
  * Approving/Rejecting a face requires the `FACE_APPROVAL` permission.
  * Viewing the detailed queue requires the `FACE_VIEW_QUEUE` permission.
  * Revoking an approved profile requires the `FACE_REVOKE` permission.
  * Students updating their own profile requires the `FACE_UPDATE_SELF` permission.
* **Impact Analysis:** Frontend components must be designed to check both context-level roles (for rendering layouts) and granular permissions (for enabling/disabling action buttons like "Approve" or "Revoke").

---

## 3. Review Area 2: Image Source Policy
**Status: Frozen**

Evaluating the constraint of forcing live camera captures versus allowing gallery uploads for SDMS V1.
* **Constraint:** Forcing "Camera Only" via WebRTC (`getUserMedia`) provides strong anti-spoofing guarantees but introduces severe cross-browser and cross-device compatibility issues, leading to high friction during mass onboarding.
* **Refined Decision:** For SDMS V1, the UI must support **Camera + Gallery**.
* **Impact Analysis:** 
  * The frontend team is unblocked from implementing a universal file upload component.
  * The burden of anti-spoofing is securely shifted to the Admin Approval workflow, where staff manually verifies the uploaded high-quality portrait against the official student ID.

---

## 4. Review Area 3: Access Status Visibility
**Status: Frozen**

Clarifying the display logic on the Student Dashboard to prevent user confusion between biometric enrollment and building access policies.
* **Refined Decision:** The UI MUST explicitly separate **Face Registration Status** from **Gate Access Eligibility Status**.
* **Rationale:** A student's Face Status may be perfectly `APPROVED` and embedded in the AI system. However, their Access Status may be `DENIED - CURFEW ACTIVE` or `DENIED - ACCOUNT LOCKED` due to Smart Access rules. Combining these into a single "Gate Status" would lead students to incorrectly believe their face data was deleted or rejected.
* **Impact Analysis:** The React/Mobile teams must design two distinct UI cards/badges on the dashboard:
  1. Biometric Status: `APPROVED` (Green)
  2. Building Access: `DENIED (Curfew Active)` (Red/Orange)

---

## Final Decision
**PASS** ✅
All governance refinements have been successfully evaluated and injected into `FACE-UI-01_Face_User_Journey_And_Screen_Architecture.md`. The UI architecture is securely aligned with SDMS Access Control policies.

