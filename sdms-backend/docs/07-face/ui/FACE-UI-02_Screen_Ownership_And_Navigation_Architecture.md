> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE-UI-02: Screen Ownership & Navigation Architecture Audit

## 1. Frontend Boundary Definition
This document establishes the strict separation between the Student-facing UI and the Staff/Admin-facing UI for the SDMS Face Subsystem. 

**First Apply Governance Freeze:**
* **UI-01:** Student App $\neq$ Admin Web. They are fundamentally separate frontend applications (or entirely separate domain boundaries).
* **UI-02:** Every screen must declare an absolute Owner.
* **UI-03:** Navigation trees must be separated. Zero crossover.

**Boundary Responsibilities:**
* **Student App Responsibilities:** Self-service profile onboarding, camera/gallery upload, and monitoring personal biometric & gate access status.
* **Admin Web Responsibilities:** Operational management at scale. Queuing, reviewing, approving, rejecting, and revoking profiles for thousands of students.

---

## 2. Student App Screen Inventory
Owner: **React Native / Mobile Web Team**

| Screen Name | Purpose | Route | Navigation Entry |
| :--- | :--- | :--- | :--- |
| **Face Dashboard** | Displays Biometric Status and Access Status separately. | `/face/dashboard` | Main Menu/Bottom Tab $\rightarrow$ Access |
| **Face Capture** | Interface for Camera/Gallery upload with positioning guide. | `/face/capture` | Face Dashboard $\rightarrow$ "Setup/Update Face" |
| **Face Pending** | Informational screen indicating photo is under manual review. | `/face/pending` | Redirected immediately post-upload |
| **Notification Center** | In-app inbox storing Approval, Rejection, and Revocation messages. | `/notifications` | Main Menu $\rightarrow$ Notifications |

---

## 3. Admin Web Screen Inventory
Owner: **React Admin (Web) Team**

| Screen Name | Purpose | Route | Navigation Entry |
| :--- | :--- | :--- | :--- |
| **Face Approval Queue** | DataGrid listing students waiting for photo verification. | `/admin/face/queue` | Sidebar $\rightarrow$ Access Control $\rightarrow$ Approvals |
| **Face Review Modal** | Side-by-side comparison (Official ID vs New Upload). | `N/A (Overlay)` | Triggered from DataGrid Row Click |
| **Face Directory** | Searchable registry of all `APPROVED` and `REVOKED` faces. | `/admin/face/directory` | Sidebar $\rightarrow$ Access Control $\rightarrow$ Directory |

---

## 4. Student Navigation Tree
```text
(Student App Root)
├── Access (Bottom Tab / Main Menu)
│   └── Face Dashboard (/face/dashboard)
│       ├── If [Status == NOT_REGISTERED] or [REJECTED]
│       │   └── Face Capture Screen (/face/capture)
│       │       └── Upload Success -> Face Pending Screen (/face/pending)
│       │
│       ├── If [Status == PENDING]
│       │   └── Face Pending Screen (Buttons disabled)
│       │
│       └── If [Status == APPROVED] or [REVOKED]
│           └── Request Re-registration -> Face Capture Screen (/face/capture)
│
└── Notifications (Bottom Tab)
    └── Notification Center (/notifications)
        └── Face Approval/Rejection/Revoke Alerts
```

---

## 5. Admin Navigation Tree
```text
(Admin Web Root)
└── Sidebar Navigation
    └── Access Control (Category)
        ├── Face Approvals Queue (/admin/face/queue)
        │   ├── Row Click -> Face Review Modal
        │   │   ├── Approve -> Success Toast -> Return to Queue
        │   │   └── Reject -> Reject Reason Modal -> Return to Queue
        │   └── Filter/Sort tools
        │
        └── Face Directory (/admin/face/directory)
            ├── Search by Student ID / Name
            └── Row Click -> Face Profile Details Panel
                └── Revoke Access Action
```

---

## 6. Access Control Visibility Matrix

| Screen | `FACE_VIEW_SELF` / `FACE_UPDATE_SELF` | `FACE_APPROVAL` / `FACE_VIEW_QUEUE` | `FACE_REVOKE` |
| :--- | :--- | :--- | :--- |
| **Student: Face Dashboard** | ✅ View | ❌ Denied | ❌ Denied |
| **Student: Face Capture** | ✅ View/Action | ❌ Denied | ❌ Denied |
| **Student: Notifications** | ✅ View | ❌ Denied | ❌ Denied |
| **Admin: Approval Queue** | ❌ Denied | ✅ View/Action | ✅ View/Action |
| **Admin: Review Modal** | ❌ Denied | ✅ View/Action | ✅ View/Action |
| **Admin: Face Directory**| ❌ Denied | ✅ View | ✅ View/Action |

*Note: Only users with `FACE_REVOKE` can universally Revoke profiles, while users with `FACE_APPROVAL` can handle daily Approvals/Rejections.*

---

## 7. Cross Navigation Rules
**Rule: Strict Sandbox Isolation.**

* **Can Admin open Student Screens?** **NO.** The Admin Web operates on a completely different Single Page Application (SPA) architecture than the Student App. Admins view student data via the "Face Profile Details Panel" in the Admin directory, not by navigating to the Student's personal `/face/dashboard`.
* **Can Student open Admin Screens?** **NO.**
* **Redirect Behavior:**
  * If a user lacking Admin/Staff permissions manually types an Admin Web route (e.g., `https://sdms.edu/admin/face/queue`), the Frontend Router MUST intercept the permission mismatch and instantly redirect to `/403-forbidden` or force a logout.
  * If an unauthenticated user hits any route, redirect to `/login`.

---

## 8. Implementation Readiness & Final Output

**Screen Ownership Matrix:** Defined and isolated.
**Navigation Architecture:** Hierarchies mapped.
**Visibility Matrix:** Role-based rendering rules frozen.

**Readiness Assessment:**
* **React App Team:** Has absolute clarity on the 3 screens they own and the state-based routing logic linking them.
* **React Admin Team:** Has absolute clarity on the DataGrid and Modal components they must build, free from Student UI constraints.

**Final Decision: PASS** ✅

The UI Screen Ownership and Navigation Architecture is strictly bounded and ready for Frontend Implementation.

