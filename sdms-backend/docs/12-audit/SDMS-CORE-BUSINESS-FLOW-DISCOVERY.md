# SDMS-CORE-BUSINESS-FLOW-DISCOVERY

## ROLE
Chief Solution Architect, Business Analyst, Frontend Integration Architect, System Analyst

## OBJECTIVE
Analyze the complete core business flow of SDMS from end-to-end based purely on existing codebase capabilities (Controllers, APIs, Events).

---

## SECTION 1: Business Journey

### Student Journey
1. **Authentication:** Student receives email, activates account (`/activate`), and logs in (`/login`).
2. **Registration:** Student browses available dormitory periods and checks if their student ID is eligible (`/check-eligibility`).
3. **Application:** Student creates an application, uploads required documents (`/documents`), and submits it (`/submit`).
4. **Payment:** After approval, student pays the required fee via online gateway (`/payment/online`).
5. **Face Registration:** Student captures and uploads their portrait photo for smart access (`/face`).
6. **Dormitory Living:** Student moves in. The IoT Gate validates them via internal API (`/face-verifications`), and the student views their access history (`/access/student/{id}`).

### Admin Journey
1. **Registration Setup:** Admin creates a Registration Period and imports eligible students. *(Note: Period creation API is abstractly mapped, eligibility uses `/{periodId}/eligibilities`)*.
2. **Application Review:** Admin views pending applications, starts review (`/start-review`), verifies documents (`/verify`), and approves the application (`/approve`).
3. **Payment Reconciliation:** Admin approves manual cash payments if necessary (`/cash/approve`).
4. **Face Moderation:** Admin reviews pending face photos and approves them (`/{profileId}/approve`).
5. **Smart Access Monitoring:** Admin adjusts Curfew Policies (`/curfew-policies/{id}/status`).

---

## SECTION 2: Public Web Screen Catalog (Student Portal)

Based on actual APIs, the Student Web Portal must implement:

**1. Authentication Journey**
- `StudentActivateScreen`
- `StudentLoginScreen`

**2. Application Journey**
- `RegistrationLandingScreen` (View periods)
- `ApplicationFormScreen` (Check eligibility and create app)
- `DocumentUploadScreen` (Upload CCCD, priority papers)
- `ApplicationStatusScreen` (Poll for approval status)

**3. Move-in Journey**
- `PaymentCheckoutScreen` (Process online payment)
- `FaceRegistrationScreen` (Capture photo from webcam)

---

## SECTION 3: Admin Web Screen Catalog

Based on actual APIs, the Admin Web Portal must implement:

**1. Registration Operations**
- `RegistrationPeriodManager`
- `EligibilityImportScreen` (Add/Remove students from period)

**2. Application Operations**
- `ApplicationReviewQueue` (List pending apps)
- `ApplicationDetailWorkspace` (Verify documents side-by-side and Approve/Reject)

**3. Financial Operations**
- `ManualPaymentApprover` (Approve cash transactions)

**4. Face Operations**
- `FaceApprovalQueue` (List pending faces and replacements)

**5. Infrastructure Operations**
- `RoomDashboardScreen` (Manage Buildings, Floors, Rooms, Beds status)
- `SmartAccessConfigScreen` (Enable/Disable Curfews and Time Windows)

---

## SECTION 4: API Inventory By Screen

| Screen | Target API | Module | Purpose |
| :--- | :--- | :--- | :--- |
| **StudentActivateScreen** | `POST /api/v1/auth/activate` | `auth` | Set up initial password |
| **StudentLoginScreen** | `POST /api/v1/auth/login` | `auth` | Obtain JWT |
| **ApplicationFormScreen** | `POST /api/v1/registration/check-eligibility` | `registration` | Verify student can apply |
| **DocumentUploadScreen** | `POST /api/v1/applications/{id}/documents` | `application` | Upload proofs |
| **ApplicationFormScreen** | `POST /api/v1/applications/{id}/submit` | `application` | Finalize submission |
| **ApplicationReviewQueue**| `PATCH /api/v1/admin/applications/{id}/approve` | `application` | Admin approves application |
| **PaymentCheckoutScreen** | `POST /api/v1/payment/online` | `payment` | Initiate gateway payment |
| **FaceRegistrationScreen**| `POST /api/v1/students/me/face` | `face` | Submit face for AI |
| **FaceApprovalQueue** | `POST /api/v1/admin/faces/{id}/approve` | `face` | Admin approves face vector |
| **RoomDashboardScreen** | `GET /api/v1/rooms/beds` | `room` | View bed availability |

---

## SECTION 5: Screen Dependency Matrix

The flow is strictly sequential and enforced by the Backend State Machines. Screens must unlock in this exact order:

1. **Auth** unlocks **Registration**. (Cannot apply without JWT).
2. **Registration** unlocks **Application**. (Cannot submit app if not eligible in current period).
3. **Application Approval** unlocks **Payment**. (Cannot pay for a bed if application is pending).
4. **Payment Completion** unlocks **Face**. (Cannot register face if room fee is unpaid).
5. **Face Approval** unlocks **Smart Access**. (Cannot open gate without AI vector in DB).

*If the Frontend tries to jump steps (e.g., calling Face API before Payment), the Backend will throw Business Rule Exceptions.*

---

## SECTION 6: Minimum Demo Scope (Wednesday)

To prove SDMS works end-to-end, you **DO NOT** need to build every screen by Wednesday. Focus strictly on:

1. `StudentLoginScreen`
2. `ApplicationFormScreen` (Bypass documents if possible, just submit)
3. `ApplicationReviewQueue` (Admin clicks Approve)
4. `FaceRegistrationScreen` (Upload photo)
5. `FaceApprovalQueue` (Admin clicks Approve)

*(Mock the Payment step via DB script or Postman to save frontend development time).*

---

## SECTION 7: UI Readiness

- **Admin Web Team:** **WARNING**. The API backend is massive and fully complete. However, the Frontend is missing the `ApplicationReviewQueue` and `FaceApprovalQueue` which are critical for the core flow. 
- **Student Web Team:** **WARNING**. The `RegistrationPage` exists, but needs to be wired to the exact `/{applicationId}/submit` endpoint. `FaceRegistrationScreen` is missing.
- **Student App Team:** **FAIL**. Zero mobile screens exist. Redirect all mobile requirements to the Public Web Portal for the demo.

**Final Verdict:** The Backend is a highly sophisticated, production-ready system. The Frontend UI needs 2 days of rapid focused development on exactly 5 screens to bridge the gap and deliver a perfect Wednesday Demo.
