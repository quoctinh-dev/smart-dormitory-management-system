# API CONTRACT FREEZE

## SECTION A: BUSINESS PURPOSE
This document freezes the production API contract for the Smart Dormitory Management System (SDMS). It describes all public endpoints, request/response schemas, authentication requirements, error handling, and frontend usage to enable frontend teams to build interfaces without consulting backend source code.

## SECTION B: ENTITIES USED
- **UserAccount**: Authentication credentials and roles
- **Student**: Demographic and academic data
- **Application**: Dormitory application lifecycle
- **RoomAssignment**: Student housing assignment
- **Bill**: Financial billing record
- **FaceProfile**: Student face image and embedding
- **AccessHistory**: Gate access audit log
- **RegistrationPeriod**: Time-bound registration windows
- **Eligibility**: Student eligibility for registration periods

## SECTION C: ENDPOINTS

### Auth Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/auth/activate | ActivateAccountRequest | AuthResponse | Activate account using email, temporary password, and new password | Public | 200 OK, 400 Bad Request, 409 Conflict | BAD_REQUEST, CONFLICT | Public Web (Activation), Student Mobile (Activation) | UserService | Creates user account after validation |
| POST | /api/v1/auth/login | LoginRequest | AuthResponse | Authenticate user and issue JWT tokens | Public | 200 OK, 401 Unauthorized | UNAUTHORIZED | Public Web (Login), Student Mobile (Login) | AuthService | Validates credentials, returns access & refresh tokens |
| POST | /api/v1/auth/refresh-token | RefreshTokenRequest | AuthResponse | Refresh access token using refresh token | Public | 200 OK, 401 Unauthorized | UNAUTHORIZED | Public Web (Token Refresh), Student Mobile (Token Refresh) | AuthService | Issues new pair of tokens |
| POST | /api/v1/auth/logout | - | - | Revoke refresh token | Required | 200 OK | - | Public Web (Logout) | AuthService | No body required |
| POST | /api/v1/auth/change-password | ChangePasswordRequest | - | Change password for authenticated user | Required | 200 OK, 401 Unauthorized, 400 Bad Request | UNAUTHORIZED, BAD_REQUEST | Public Web (Change Password) | AuthService | Requires current password |
| POST | /api/v1/auth/forgot-password | ForgotPasswordRequest | - | Initiate password reset via email | Public | 200 OK, 400 Bad Request | BAD_REQUEST | Public Web (Forgot Password) | BrevoConfig | Sends reset email |
| POST | /api/v1/auth/reset-password | ResetPasswordRequest | - | Complete password reset using token | Public | 200 OK, 400 Bad Request, 409 Conflict | BAD_REQUEST, CONFLICT | Public Web (Reset Password) | AuthService | Validates token and new password |

### User Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | /api/v1/users/me | - | MeResponse | Retrieve current user profile | Authenticated | 200 OK, 401 Unauthorized, 403 Forbidden | UNAUTHORIZED, FORBIDDEN | Admin Web (Dashboard), Student Mobile (Profile) | UserService | Returns account info + student profile |

### Student Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | /api/v1/students/me/profile | - | StudentProfileResponse | Get student profile | Student | 200 OK, 401 Unauthorized, 403 Forbidden | UNAUTHORIZED, FORBIDDEN | Student Mobile (Profile), Admin Web (Student Management) | StudentService | Returns demographic and academic data |

### Registration Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/admin/registration-periods/{periodId}/eligibilities/import | MultipartFile | EligibilityImportResponse | Import eligible students from Excel | Admin, Staff | 200 OK, 400 Bad Request, 404 Not Found | BAD_REQUEST, NOT_FOUND | Admin Web (Registration Management) | RegistrationEligibilityService | Validates Excel structure, imports eligibility |
| GET | /api/v1/admin/registration-periods/{periodId}/eligibilities | - | List<EligibilityResponse> | Get eligibility list | Admin, Staff | 200 OK, 404 Not Found | NOT_FOUND | Admin Web (Registration Management) | RegistrationEligibilityService | Returns list of eligible students |
| DELETE | /api/v1/admin/registration-periods/{periodId}/eligibilities/{eligibilityId} | - | - | Delete single eligibility record | Admin, Staff | 200 OK | - | Admin Web (Registration Management) | RegistrationEligibilityService | Removes student from eligibility list |

### Application Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/applications | ApplicationCreateRequest | ApplicationResponse | Create draft application | Public | 201 Created, 400 Bad Request | BAD_REQUEST | Public Web (Apply), Student Mobile (Apply) | ApplicationService | Validates commitment_accepted, stores draft |
| GET | /api/v1/applications/{applicationId} | - | ApplicationResponse | Get application details | Public | 200 OK, 404 Not Found | NOT_FOUND | Public Web (Status), Student Mobile (Status) | ApplicationService | Returns application with documents |
| GET | /api/v1/applications/status | - | ApplicationStatusResponse | Check status by CCCD | Public | 200 OK, 404 Not Found | NOT_FOUND | Public Web (Status) | ApplicationService | Returns status and priority score |
| POST | /api/v1/applications/{applicationId}/documents | MultipartFile | DocumentUploadResponse | Upload supporting document | Public | 200 OK, 400 Bad Request, 404 Not Found | BAD_REQUEST, NOT_FOUND | Public Web (Upload Documents), Student Mobile (Upload) | DocumentService | Validates file type and size |
| PUT | /api/v1/applications/{applicationId}/documents/{docId}/resubmit | MultipartFile | DocumentUploadResponse | Resubmit revised document | Public | 200 OK, 400 Bad Request, 404 Not Found | BAD_REQUEST, NOT_FOUND | Public Web (Upload Documents), Student Mobile (Upload) | DocumentService | Updates document status |
| POST | /api/v1/applications/{applicationId}/submit | - | ApplicationResponse | Submit application for review | Public | 200 OK, 400 Bad Request, 409 Conflict | BAD_REQUEST, CONFLICT | Public Web (Submit), Student Mobile (Submit) | ApplicationService | Transitions DRAFT → PENDING |
| GET | /api/v1/admin/applications | - | Page<ApplicationResponse> | List applications (admin filter) | Admin, Staff | 200 OK | - | Admin Web (Application Review) | ApplicationService | Supports filtering by status, period |
| GET | /api/v1/admin/applications/{applicationId} | - | ApplicationDetailResponse | Get application detail | Admin | 200 OK, 404 Not Found | NOT_FOUND | Admin Web (Application Review) | ApplicationService | Returns full detail with documents |
| PATCH | /api/v1/admin/applications/{applicationId}/approve | - | ApplicationResponse | Approve application | Admin | 200 OK, 400 Bad Request, 409 Conflict | BAD_REQUEST, CONFLICT | Admin Web (Application Review) | ApplicationService, RoomService, BillService | Creates student record, assignment, bill |
| PATCH | /api/v1/admin/applications/{applicationId}/reject | - | ApplicationResponse | Reject application | Admin | 200 OK | - | Admin Web (Application Review) | ApplicationService | Closes application |
| PATCH | /api/v1/admin/applications/{applicationId}/request-revision | RevisionRequest | ApplicationResponse | Request document revision | Admin | 200 OK | - | Admin Web (Application Review) | ApplicationService | Updates status to REQUEST_REVISION |
| PATCH | /api/v1/admin/documents/{docId}/verify | - | DocumentVerificationResponse | Verify individual document | Admin | 200 OK | - | Admin Web (Application Review) | DocumentService | Marks document as verified |

### Room Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | /api/v1/admin/buildings | - | List<BuildingResponse> | List all buildings | Admin | 200 OK | - | Admin Web (Room Management) | BuildingService | Returns building hierarchy |
| GET | /api/v1/admin/buildings/{buildingId} | - | BuildingDetailResponse | Get building details | Admin | 200 OK, 404 Not Found | NOT_FOUND | Admin Web (Room Management) | BuildingService | Returns floors and rooms |
| GET | /api/v1/admin/dashboard/room | - | RoomDashboardResponse | Get room occupancy overview | Admin | 200 OK | - | Admin Web (Room Dashboard) | RoomService | Shows occupancy by floor/room |
| GET | /api/v1/admin/dashboard/room/beds | - | BedStatisticsResponse | Get bed-level statistics | Admin | 200 OK | - | Admin Web (Room Dashboard) | BedService | Shows bed availability |
| GET | /api/v1/public/room/assignment/{appId} | - | RoomAssignmentResponse | Get room/bed assignment for payment | Public | 200 OK, 404 Not Found | NOT_FOUND | Public Web (Payment), Student Mobile (Payment) | RoomAssignmentService | Returns assigned bed details |
| GET | /api/v1/admin/rooms/{roomId} | - | RoomResponse | Get room details | Admin | 200 OK, 404 Not Found | NOT_FOUND | Admin Web (Room Management) | RoomService | Returns room metadata |
| PUT | /api/v1/admin/rooms/{roomId} | UpdateRoomRequest | RoomResponse | Update room metadata | Admin | 200 OK, 400 Bad Request, 404 Not Found | BAD_REQUEST, NOT_FOUND | Admin Web (Room Management) | RoomService | Updates room capacity |
| PATCH | /api/v1/admin/rooms/{roomId}/status | UpdateRoomStatusRequest | - | Change room status | Admin | 200 OK | - | Admin Web (Room Management) | RoomService | Updates occupancy status |
| PATCH | /api/v1/admin/room/{roomId}/beds/{bedId}/status | UpdateBedStatusRequest | - | Change bed status | Admin | 200 OK | - | Admin Web (Room Management) | BedService | Updates bed availability |

### Payment Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/admin/payments/bills/{id}/pay | PaymentCreateRequest | PaymentResponse | Record manual payment | Admin | 200 OK, 400 Bad Request, 404 Not Found | BAD_REQUEST, NOT_FOUND | Admin Web (Payment Management) | PaymentService | Updates bill status to PAID |
| GET | /api/v1/admin/payments/bills/{id} | - | BillResponse | Get bill details | Admin | 200 OK, 404 Not Found | NOT_FOUND | Admin Web (Payment Management) | PaymentService | Shows payment history |
| POST | /api/v1/payments/online | OnlinePaymentRequest | PaymentResponse | Online payment (simulated) | Student | 200 OK, 400 Bad Request, 404 Not Found | BAD_REQUEST, NOT_FOUND | Public Web (Payment), Student Mobile (Payment) | PaymentService | Validates bill ID, records payment |
| POST | /api/v1/admin/payments/cash/approve | CashPaymentApproveRequest | - | Approve cash payment manually | Admin | 200 OK | - | Admin Web (Payment Management) | PaymentService | Marks payment as confirmed |

### Face Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/students/me/face | FaceUploadRequest | FaceProfileResponse | Upload face image for registration | Student | 200 OK, 400 Bad Request, 409 Conflict | BAD_REQUEST, CONFLICT | Student Mobile (Face Registration), Admin Web (Face Approval) | FaceService | Stores image URL, triggers approval workflow |
| GET | /api/v1/students/me/face | - | FaceProfileResponse | Get own face profile | Student | 200 OK, 404 Not Found | NOT_FOUND | Student Mobile (Face Profile) | FaceService | Returns pending face status |
| GET | /api/v1/admin/faces/pending | - | List<PendingFaceResponse> | Get pending face approvals | Admin | 200 OK | - | Admin Web (Face Approval) | FaceService | Lists faces awaiting review |
| POST | /api/v1/admin/faces/{id}/approve | - | FaceProfileResponse | Approve face profile | Admin | 200 OK | - | Admin Web (Face Approval) | FaceService | Transitions status to APPROVED, triggers embedding generation |
| POST | /api/v1/admin/faces/{id}/reject | RejectFaceRequest | - | Reject face profile | Admin | 200 OK | - | Admin Web (Face Approval) | FaceService | Records rejection reason |

### Smart Access Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| GET | /api/v1/admin/access/history | - | Page<AccessHistoryResponse> | Get access history log | Admin | 200 OK | - | Admin Web (Access History) | AccessHistoryService | Shows all gate access events |
| GET | /api/v1/admin/access/policies/curfew | - | List<CurfewPolicyResponse> | Get curfew policies | Admin | 200 OK | - | Admin Web (Smart Access) | CurfewPolicyService | Shows time-window rules |
| POST | /api/v1/admin/access/policies/curfew | CurfewPolicyCreateRequest | CurfewPolicyResponse | Create curfew policy | Admin | 201 Created, 400 Bad Request | BAD_REQUEST | Admin Web (Smart Access) | CurfewPolicyService | Defines allowed access windows |
| POST | /api/v1/admin/remote-unlock/{gateId} | - | - | Manually unlock gate | Admin | 200 OK | - | Admin Web (Smart Access) | RemoteUnlockService | Overrides normal decision |
| POST | /api/v1/admin/emergency-override | EmergencyOverrideRequest | - | Execute emergency override | Admin | 200 OK | - | Admin Web (Smart Access) | EmergencyOverrideService | Immediate gate control |
| POST | /api/v1/admin/time-window-policies | TimeWindowPolicyCreateRequest | TimeWindowPolicyResponse | Create time-window policy | Admin | 201 Created, 400 Bad Request | BAD_REQUEST | Admin Web (Smart Access) | TimeWindowPolicyService | Defines allowed access times |

### Upload Module
| Method | URL | Request DTO | Response DTO | Purpose | Roles | HTTP Status | Error Codes | Frontend Screens | Dependencies | Business Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| POST | /api/v1/uploads/avatar | MultipartFile | UploadResponse | Upload avatar image to Cloudinary | Public | 200 OK, 400 Bad Request | BAD_REQUEST | Public Web (Upload), Student Mobile (Upload) | CloudinaryConfig | Returns image URL for use in profile |

## SECTION D: AUTH MATRIX
| Endpoint Category | Public | Student | Admin |
|---|---|---|---|
| Auth endpoints | ✓ | ✓ | ✓ |
| Application endpoints (create/submit) | ✓ | ✓ | ✓ |
| Application admin endpoints (review) | - | - | ✓ |
| Room admin endpoints | - | - | ✓ |
| Payment admin endpoints | - | - | ✓ |
| Payment public endpoints | ✓ | ✓ | - |
| Face endpoints (student) | ✓ | ✓ | - |
| Face admin endpoints | - | - | ✓ |
| Smart Access admin endpoints | - | - | ✓ |
| Smart Access IoT endpoints | - | - | - (MQTT only) |
| Upload endpoints | ✓ | ✓ | - |

## SECTION E: ERROR CODES
| Code | Meaning | Typical Context |
|---|---|---|
| 400 | Bad Request | Validation failure, missing required fields |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Insufficient permissions for resource |
| 404 | Not Found | Application, document, bill, or record not found |
| 409 | Conflict | Duplicate application, conflicting business rules |
| 422 | Unprocessable Entity | Validation error details (Spring Validation) |
| 500 | Internal Server Error | Unexpected server failure |

## SECTION F: FRONTEND USAGE
| API Category | Admin Web Screens | Public Web Screens | Student Mobile Screens |
|---|---|---|---|
| Auth | Login, Register, Forgot Password | Register, Login | Login, Activation |
| Application | Application Review Queue, Detail, Approve/Reject | Application Status, Upload Documents | Apply, Track Status, Upload Documents |
| Payment | Payment Management, Bill Details | Payment Instructions | View Bill, Pay |
| Face | Face Approval Queue | - | Face Registration |
| Room | Room Dashboard, Assignment Details | Room Assignment Info | View Assigned Room |
| Smart Access | Access History, Curfew Management | - | - (IoT only) |
| Upload | Document Upload, Avatar Upload | Avatar Upload | Avatar Upload |

## SECTION G: DEPENDENCIES
- **Auth** → UserService, BrevoConfig
- **User** → AuthService
- **Student** → StudentService, FaceService
- **Registration** → RegistrationEligibilityService
- **Application** → ApplicationService, DocumentService, RoomService, BillService, StudentService
- **Room** → RoomService, BedService, BuildingService
- **Payment** → PaymentService, BillService
- **Face** → FaceService, StudentService
- **Smart Access** → AccessHistoryService, CurfewPolicyService, RemoteUnlockService, EmergencyOverrideService
- **Upload** → CloudinaryConfig

## SECTION H: DEMO CRITICALITY
| Module | Criticality |
|---|---|
| Auth | HIGH |
| Application | CRITICAL |
| Face | MEDIUM |
| Smart Access | MEDIUM |
| Payment | HIGH |
| Room | HIGH |
| Upload | LOW |
| Registration | MEDIUM |

## SECTION I: IMPLEMENTATION STATUS
- ✅ Auth, User, Student, Registration, Application, Room, Payment, Upload modules fully implemented
- ⚠️ Face module partially implemented (DB/API ready, AI service external)
- ⚠️ Smart Access module partially implemented (DB/schema ready, MQTT consumer pending)

## SECTION J: DEPLOYMENT REQUIREMENTS
- Environment variables: DB_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, BREVO_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
- PostgreSQL 17 with pgvector extension
- MQTT broker for IoT integration
- Cloudinary account for file storage
- Brevo account for email notifications

## SECTION K: AUDIT TRAIL
- All access decisions logged in `access_history` (append-only)
- Face verification attempts logged in `face_verification_attempts`
- Payment transactions recorded with timestamps
- All changes traceable via Flyway migration history
