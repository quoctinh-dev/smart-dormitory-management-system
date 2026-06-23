# WEB-DEMO-GAP-ANALYSIS

## SECTION 5: API Coverage Matrix

This matrix maps the existing Backend APIs against the current React Frontend implementation to highlight immediate integration gaps.

| Target Flow | API Endpoint | Frontend Screen | Implementation Status |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST /api/v1/auth/login` | `LoginPage.jsx` | ✅ Implemented |
| **Registration**| `POST /api/v1/registration/check-eligibility` | `RegistrationPage.jsx` | ✅ Implemented |
| **Registration**| `POST /api/v1/admin/registration-periods` | `RegistrationPeriodManager.jsx` | ✅ Implemented |
| **Application** | `POST /api/v1/applications/{id}/submit` | `RegistrationPage.jsx` | ✅ Implemented |
| **Application** | `GET /api/v1/applications/{id}/status` | `StatusPage.jsx` | ✅ Implemented |
| **Application** | `PATCH /api/v1/admin/applications/{id}/approve` | *(Missing)* | ❌ **Missing UI** |
| **Face** | `POST /api/v1/students/me/face` | *(Missing)* | ❌ **Missing UI** |
| **Face** | `POST /api/v1/admin/faces/{id}/approve` | *(Missing)* | ❌ **Missing UI** |
| **Room** | `GET /api/v1/rooms/beds` | *(Missing)* | ❌ Missing UI |
| **Payment** | `POST /api/v1/payment/online` | *(Missing)* | ❌ Missing UI |
| **Smart Access**| `GET /api/v1/access/student/{id}` | *(Missing)* | ❌ Missing UI |

---

## SECTION 6: Wednesday Demo Readiness

### OVERALL STATUS: WARNING 

**Reasoning (Evidence):**
The SDMS ecosystem cannot currently be demonstrated end-to-end via the UI. 

While a student can successfully submit a dormitory application via `RegistrationPage.jsx`, the journey **dead-ends** there. Because there is no `ApplicationReviewQueue` in the Admin Web, the administrator cannot approve the application. Without approval, the student is blocked from advancing to Payment and Face Registration. Furthermore, the `FaceRegistrationPage` does not exist.

**Emergency Remediation Plan (To achieve a PASS by Wednesday):**

The Frontend Team must completely freeze all secondary features (like Room Dashboards or Payment Webhooks) and build exactly **three (3) screens** immediately:

1. **`ApplicationReviewQueue` (Admin):** A simple table calling `GET /api/v1/admin/applications/pending` with an "Approve" button calling `PATCH /approve`.
2. **`FaceRegistrationPage` (Public):** A simple page with an `<input type="file" />` calling `POST /api/v1/students/me/face`.
3. **`FaceApprovalQueue` (Admin):** A simple table calling `GET /api/v1/admin/faces/pending` with an "Approve" button calling `POST /approve`.

If these 3 screens are built, the entire business flow is unblocked and the Wednesday Demo will succeed.
