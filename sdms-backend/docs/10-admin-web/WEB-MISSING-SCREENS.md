# WEB-MISSING-SCREENS

## SECTION 3: Missing Business Flows

While the initial Application Submission is complete, the subsequent operational flows are entirely absent from the React codebase:

1. **Application Review Flow:** Admins currently have no UI to view the submitted applications or approve/reject them.
2. **Face Registration Flow:** Students have no UI to upload their face portrait after application approval.
3. **Face Approval Flow:** Admins have no UI to review and approve uploaded face portraits.
4. **Payment Flow:** Students have no UI to view their room invoice or process online payment.
5. **Smart Access Flow:** Admins have no UI to monitor gate access history or trigger emergency unlocks.
6. **Room Management Flow:** Admins have no UI to view Building/Floor/Room/Bed inventory statuses visually.

---

## SECTION 4: Missing Screens

To complete the end-to-end SDMS ecosystem, the following screens MUST be built in React:

### Missing Admin Web Screens (`/admin/*`)
1. `ApplicationReviewQueue`: A data grid to list all `PENDING` applications.
2. `ApplicationDetailDialog`: A split-view modal to show applicant data on the left and uploaded identity documents on the right, with Approve/Reject buttons.
3. `FaceApprovalQueue`: A gallery view of uploaded student faces awaiting AI ingestion.
4. `RoomDashboard`: A visual layout of beds (Available/Occupied/Maintenance).
5. `SmartAccessDashboard`: Real-time logs of gate access events with Curfew toggles.

### Missing Public Web Screens (`/*`)
1. `FaceRegistrationPage`: A wizard (preferably using `react-webcam`) to help students capture a well-lit, frontal portrait.
2. `PaymentCheckoutPage`: A summary of fees and a VietQR code generation view.
