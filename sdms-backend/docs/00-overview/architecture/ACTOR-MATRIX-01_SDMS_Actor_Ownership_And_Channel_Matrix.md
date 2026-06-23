# ACTOR-MATRIX-01: SDMS Actor Ownership & Channel Matrix

## 1. Executive Summary
This document defines the definitive product architecture and actor ownership boundaries for the Smart Dormitory Management System (SDMS). It guarantees that frontend teams (Student Mobile, Admin Web) and integration teams (AI, IoT) have a single source of truth regarding which features and APIs belong in their specific UI channels.

## 2. Actor Ownership Matrix
This matrix maps core system modules to the specific actors allowed to trigger domain workflows.

| Module | Student Actions | Admin / Staff Actions | System / AI / IoT Actions |
| --- | --- | --- | --- |
| **Auth / User** | Login, Password Reset, Logout | Manage User Accounts, Assign Roles/Permissions, Suspend Accounts | JWT Expiration (System) |
| **Student** | View Profile, Update Info (Emergency Contact, Academic Info, Personal Profile, Dormitory Status) | Search Students, Ban Students, Review Academic Records | Auto-Sync Status (System) |
| **Registration**| N/A (View-Only Periods) | Open/Close Periods, Import Eligibility | N/A |
| **Application** | Submit App, Cancel App | Approve/Reject Apps, Assign Beds | Auto-Expire Pending (System) |
| **Room** | View Bed Info | Create Buildings, Manage Beds | Check-in Timeout (System) |
| **Payment** | View Bills, Pay via Gateway | Generate Manual Bills, View Stats | Auto-Generate Bills (System) |
| **Face** | Upload Face Photo, Re-Upload | Review & Approve/Reject Photos | Extract Vector (AI) |
| **Smart Access**| View Access History, View Access Status, View Curfew Policy, View Access Restrictions | Remote Unlock Gate, Configure Curfew & Time Window Policies | Gate Scan (IoT) |
| **Notification**| Read Notifications, Manage Notification Preferences (Push/Email/In-App) | Send Broadcast Notifications, Monitor Delivery Logs | Dispatch Domain Alerts (System) |

## 3. Channel Feature Lists & Screen Inventory

### 3.1 Student Mobile App
The primary interface for residents. Focuses on self-service operations.
**Feature List:**
- Authenticate via SDMS Account.
- Browse available Dormitory Registration Periods.
- Submit, view, and track the status of Dormitory Applications.
- View detailed Room, Bed, and Roommate information.
- Update Personal Profile, Emergency Contacts, and Academic Information.
- View pending invoices and complete checkout via Payment Gateway.
- Upload portrait photos via live camera for Face Recognition.
- Smart Access: View personal Gate Access history, Curfew rules, and current physical presence status.
- Notifications: Receive push/in-app notifications, configure preferences (opt-in/out of emails).

**Mobile Screen Inventory:**
1. `LoginScreen` & `ForgotPasswordScreen`
2. `DashboardScreen` (Widgets for Bills, Bed, Access Status)
3. `ProfileScreen` (Personal, Academic, Emergency Contacts)
4. `RegistrationListScreen` & `ApplicationFormScreen`
5. `RoommateDetailScreen`
6. `InvoiceListScreen` & `PaymentCheckoutScreen`
7. `FaceRegistrationScreen` (Live Camera View)
8. `SmartAccessDashboard` (History, Policies, Restrictions)
9. `NotificationCenterScreen` & `NotificationPreferencesScreen`

### 3.2 Admin Web Portal
The primary interface for Dormitory Management. Focuses on bulk operations, dashboards, and hardware overrides.
**Feature List:**
- Dashboard analytics (Occupancy, Revenue, Applications).
- User Management: Create UserAccounts, assign Role and Permission bounds.
- Create and schedule Registration Periods; import eligible student CSVs.
- Process Dormitory Applications (Approve, Reject, Auto-Assign).
- Manage physical hierarchy (Buildings $\rightarrow$ Floors $\rightarrow$ Rooms $\rightarrow$ Beds).
- Financial oversight and manual bill generation.
- Side-by-side dashboard review for Face Registration approvals.
- Smart Access control center (View live gate logs, trigger Emergency Overrides).
- Send global Broadcast Notifications to selected cohorts.

**Admin Web Screen Inventory:**
1. `AdminLoginScreen`
2. `AdminDashboardOverview`
3. `UserAccountManager` (Auth & Role Provisioning)
4. `StudentManagementDirectory`
5. `RegistrationPeriodManager`
6. `ApplicationReviewQueue`
7. `RoomAndBedInventoryManager`
8. `FinancialDashboard`
9. `FaceApprovalQueue`
10. `SmartAccessControlCenter` (Live Logs, Curfew Configs & Overrides)
11. `BroadcastNotificationDispatcher`

### 3.3 Backend Internal & Automated Features
Features that require zero UI interaction and execute via cron jobs or internal events.
- **System:** Application Expiration Job (Cancels unpaid/unclaimed beds).
- **System:** Monthly Billing Generation Job (Room fees, electricity).
- **System:** Overdue Payment Dunning Job.
- **System:** Cloudinary Orphan Image Cleanup Job.
- **System:** Automated Notification Dispatcher (Translating Domain Events like `PaymentFailedEvent` into Push/Email payloads).

### 3.4 AI & IoT Integration Features
- **AI Service:** Consumes face portrait images, returns 512-dimension pgvector embeddings.
- **IoT Gateways:** Scans face via camera, sends identity payload to Backend, receives `OPEN/CLOSE` command via MQTT.

## 4. API Ownership Matrix
A structural mapping of how REST endpoints map directly to UI Channels.

| Endpoint Blueprint | Consumer Channel | Actor | Domain |
| --- | --- | --- | --- |
| `POST /api/v1/auth/login` | Student Mobile, Admin Web | Student, Admin | `Auth` |
| `POST /api/v1/admin/users/roles`| Admin Web | Admin | `User` / `Auth` |
| `GET /api/v1/students/me` | Student Mobile | Student | `Student` |
| `PATCH /api/v1/students/me/contacts`| Student Mobile | Student | `Student` |
| `POST /api/v1/admin/registration-periods` | Admin Web | Admin | `Registration` |
| `POST /api/v1/applications/submit` | Student Mobile | Student | `Application` |
| `POST /api/v1/admin/applications/{id}/approve` | Admin Web | Admin | `Application` |
| `GET /api/v1/invoices/my-bills` | Student Mobile | Student | `Payment` |
| `POST /api/v1/student/face/register` | Student Mobile | Student | `Face` |
| `GET /api/v1/student/access/policies`| Student Mobile | Student | `Smart Access` |
| `POST /api/v1/admin/face/profiles/pending` | Admin Web | Admin | `Face` |
| `POST /api/v1/student/notifications/preferences`| Student Mobile | Student | `Notification`|
| `POST /api/v1/admin/notifications/broadcast` | Admin Web | Admin | `Notification`|
| `POST /api/v1/ai/extract` | Backend Service | System | `AI Integration` |
| `POST /api/v1/access/gates/{id}/scan` | IoT Gateway | System | `IoT Integration` |
| `POST /api/v1/access/gates/{id}/unlock` | Admin Web | Security Staff | `Smart Access` |

## Final Decision
**PASS WITH FIXES**
This matrix successfully isolates all SDMS business logic into strictly defined UI channels, accommodating all fine-grained Student capabilities (Emergency Contacts, Curfew policies) and comprehensive Notification preferences. By formally separating the Student Mobile scope from the Admin Web scope, the downstream frontend and hardware teams can construct their UI routing architectures with absolute certainty.
