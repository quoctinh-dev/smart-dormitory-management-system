# FEATURE MAP — Bản đồ Chức năng Hệ thống SDMS
> **Mục đích:** Làm nền tảng để sinh Use Case Chi tiết, Bảng mô tả Use Case, Sơ đồ Tuần tự và Sơ đồ Hoạt động.  
> **Nguồn:** Audit trực tiếp từ mã nguồn Backend + Frontend (Code is Truth).  
> **Cập nhật:** 2026-07-24 (Đã chia tách 10 phân nhóm CRUD và Nghiệp vụ)

---

## HƯỚNG DẪN SỬ DỤNG
Khi làm **Bảng mô tả Use Case chi tiết** cho một chức năng, tra cứu dòng tương ứng để biết:
- **Controller** → Điểm tiếp nhận request HTTP
- **Service** → Nơi xử lý logic nghiệp vụ
- **Repository** → Nơi tương tác CSDL
- **UI Screen** → Màn hình Frontend tương ứng
- **Endpoint** → API call thực tế

---

## MODULE 1: HỆ THỐNG & TÀI KHOẢN (UC1)

### 1.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC1-06 | Xem hồ sơ cá nhân | CRUD (R) | SV KTX | `UserController`, `StudentController` | `UserService`, `StudentService` | `UserAccountRepository`, `StudentRepository` | App Student (me) | GET `/api/v1/users/me`, GET `/api/v1/students/me` |
| UC1-07 | Cập nhật hồ sơ cá nhân | CRUD (U) | SV KTX | `StudentController` | `StudentService` | `StudentRepository` | App Student (profile edit) | PATCH `/api/v1/students/me` |
| UC1-08 | Tạo tài khoản nhân viên | CRUD (C) | ADMIN | `AdminAccountController` | `UserService` | `UserAccountRepository` | `AccountManagementPage.tsx` | POST `/api/v1/admin/accounts/staff` |
| UC1-09 | Xem danh sách tài khoản cán bộ | CRUD (R) | ADMIN | `AdminAccountController` | `UserService` | `UserAccountRepository` | `AccountManagementPage.tsx` | GET `/api/v1/admin/accounts` |
| UC1-10 | Khóa/Mở khóa tài khoản cán bộ | CRUD (U) | ADMIN | `AdminAccountController` | `UserService` | `UserAccountRepository` | `AccountManagementPage.tsx` | PUT `/api/v1/admin/accounts/{id}/toggle-lock` |
| UC1-11 | Xem danh sách sinh viên | CRUD (R) | ADMIN/STAFF | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | GET `/api/v1/students` |
| UC1-12 | Xem hồ sơ chi tiết sinh viên | CRUD (R) | ADMIN/STAFF | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | GET `/api/v1/students/{id}/profile` |
| UC1-13 | Cập nhật thông tin sinh viên | CRUD (U) | ADMIN | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | PATCH `/api/v1/students/{id}` |
| UC1-15 | Thiết lập cấu hình hệ thống | CRUD (U) | ADMIN | `SystemConfigController` | `SystemConfigService` | `SystemConfigRepository` | `SystemConfigPage.tsx` | GET/PUT `/api/v1/admin/system-configs` |

### 1.2 Nhóm Quy trình Nghiệp vụ (Logic Lõi)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC1-01 | Đăng nhập | Nghiệp vụ | Tất cả | `AuthController` | `AuthService`, `JwtService` | `UserAccountRepository` | `LoginPage.tsx` (Admin), `ActivateAccountPage.tsx` (SV) | POST `/api/v1/auth/login` |
| UC1-02 | Kích hoạt tài khoản (OTP) | Nghiệp vụ | SV Trường | `AuthController` | `AuthService` | `UserAccountRepository` | `ActivateAccountPage.tsx` | POST `/api/v1/auth/activate` |
| UC1-03 | Đăng xuất | Nghiệp vụ | Tất cả | `AuthController` | `AuthService`, `JwtService` | — | `LoginPage.tsx` | POST `/api/v1/auth/logout` |
| UC1-04 | Đổi mật khẩu | Nghiệp vụ | Tất cả | `AuthController` | `AuthService` | `UserAccountRepository` | Trang Profile (Admin/SV) | POST `/api/v1/auth/change-password` |
| UC1-05 | Quên & Đặt lại mật khẩu | Nghiệp vụ | Tất cả | `AuthController` | `AuthService` | `UserAccountRepository` | `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` | POST `/api/v1/auth/forgot-password`, `/reset-password` |
| UC1-14 | Gắn thẻ RFID cho sinh viên | Nghiệp vụ | ADMIN | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | POST `/api/v1/students/{id}/rfid` |
| UC1-16 | Xem Dashboard thống kê | Nghiệp vụ | ADMIN | `DashboardController` | `DashboardService` | — | `AdminDashboard.tsx` | GET `/api/v1/dashboard/stats` |
| UC1-17 | Xem hợp đồng sắp hết hạn | Nghiệp vụ | ADMIN | `DashboardController` | `DashboardService` | `StudentHousingAssignmentRepository` | `AdminDashboard.tsx` | GET `/api/v1/dashboard/expiring-assignments` |

---

## MODULE 2: CƠ SỞ VẬT CHẤT (UC2)

### 2.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC2-01 | Tạo Tòa nhà | CRUD (C) | ADMIN | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/buildings` |
| UC2-02 | Xem danh sách Tòa nhà | CRUD (R) | ADMIN/STAFF | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/buildings` |
| UC2-03 | Cập nhật Tòa nhà | CRUD (U) | ADMIN | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | PUT `/api/v1/admin/buildings/{id}` |
| UC2-04 | Đổi trạng thái Tòa nhà | CRUD (U) | ADMIN/STAFF | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | PATCH `/api/v1/admin/buildings/{id}/status` |
| UC2-05 | Tạo Tầng | CRUD (C) | ADMIN | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/floors` |
| UC2-06 | Xem danh sách Tầng | CRUD (R) | ADMIN/STAFF | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/floors/building/{buildingId}` |
| UC2-07 | Cập nhật Tầng | CRUD (U) | ADMIN | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | PUT `/api/v1/admin/floors/{floorId}` |
| UC2-08 | Tạo Phòng | CRUD (C) | ADMIN | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/rooms` |
| UC2-09 | Xem danh sách Phòng | CRUD (R) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/rooms` |
| UC2-10 | Xem chi tiết Phòng | CRUD (R) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository`, `BedRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/rooms/{roomId}` |
| UC2-11 | Cập nhật Phòng | CRUD (U) | ADMIN | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | PUT `/api/v1/admin/rooms/{roomId}` |
| UC2-12 | Đổi trạng thái Phòng | CRUD (U) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | PATCH `/api/v1/admin/rooms/{roomId}/status` |
| UC2-13 | Tạo Giường thủ công | CRUD (C) | ADMIN | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/beds` |
| UC2-15 | Đổi trạng thái Giường | CRUD (U) | ADMIN/STAFF | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | PATCH `/api/v1/admin/beds/{bedId}/status` |
| UC2-19 | Xem thông tin phòng ở hiện tại (SV) | CRUD (R) | SV KTX | `StudentRoomController` | `StudentRoomService` | `StudentHousingAssignmentRepository`, `RoomRepository` | App Student | GET `/api/v1/student/room/current` |
| UC2-23 | Xóa Tòa nhà (Draft) | CRUD (D) | ADMIN | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/buildings/{id}` |
| UC2-24 | Xóa Tầng (Draft) | CRUD (D) | ADMIN | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/floors/{floorId}` |
| UC2-25 | Xóa Phòng (Draft) | CRUD (D) | ADMIN | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/rooms/{roomId}` |
| UC2-26 | Xóa Giường | CRUD (D) | ADMIN | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/beds/{bedId}` |

### 2.2 Nhóm Quy trình Nghiệp vụ (Logic Lõi)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC2-14 | Tự động sinh Giường | Nghiệp vụ | ADMIN | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/beds/room/{roomId}/auto-generate` |
| UC2-16 | Quản lý Mã PIN cửa phòng | Nghiệp vụ | ADMIN | `RoomPinController` | `RoomPinService` | — | `RoomManagementPage.tsx` | GET/POST `/api/v1/room-pins/{roomId}` |
| UC2-17 | Sinh PIN hàng loạt | Nghiệp vụ | ADMIN | `RoomPinController` | `RoomPinService` | — | `RoomManagementPage.tsx` | POST `/api/v1/room-pins/bulk-generate` |
| UC2-18 | Xem kết quả xếp phòng (SV) | Nghiệp vụ | SV/ADMIN | `PublicRoomController` | `HousingAssignmentService` | `StudentHousingAssignmentRepository` | App Student | GET `/api/v1/student/room-result/assignment/{applicationId}` |
| UC2-20 | Xem phòng còn trống (SV) | Nghiệp vụ | SV KTX | `RoomStudentController` | `RoomService` | `RoomRepository` | App Student | GET `/api/v1/student/rooms/available` |

---

## MODULE 3: DỊCH VỤ LƯU TRÚ (UC3)

### 3.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC3-01 | Xem đợt đăng ký đang mở | CRUD (R) | Công khai | `RegistrationController` | `RegistrationService` | `RegistrationPeriodRepository` | `RegistrationPage.tsx` | GET `/api/v1/registrations/active` |
| UC3-05 | Tra cứu trạng thái hồ sơ | CRUD (R) | SV Trường | `ApplicationController` | `ApplicationService` | `DormitoryApplicationRepository` | `StatusPage.tsx` | GET `/api/v1/applications/status` |

### 3.2 Nhóm Quy trình Nghiệp vụ (Logic Lõi)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC3-02 | Kiểm tra điều kiện đăng ký | Nghiệp vụ | SV Trường | `RegistrationController` | `RegistrationService`, `RegistrationEligibilityService` | `RegistrationEligibilityRepository` | `RegistrationPage.tsx` | POST `/api/v1/registrations/check-eligibility` |
| UC3-03 | Nộp đơn đăng ký nội trú | Nghiệp vụ | SV Trường | `ApplicationController` | `ApplicationService` | `DormitoryApplicationRepository` | `RegistrationPage.tsx` | POST `/api/v1/applications` → submit |
| UC3-04 | Tải lên minh chứng | Nghiệp vụ | SV Trường | `ApplicationController`, `UploadController` | `ApplicationService`, `CloudinaryService` | `VerificationDocumentRepository` | `RegistrationPage.tsx` | POST `/api/v1/applications/{id}/documents` |
| UC3-06 | Nộp lại minh chứng bị yêu cầu | Nghiệp vụ | SV Trường | `ApplicationController` | `ApplicationService` | `VerificationDocumentRepository` | `StatusPage.tsx` | PUT `/api/v1/applications/{id}/documents/{docId}/resubmit` |
| UC3-07 | Tạo và kích hoạt đợt đăng ký | Nghiệp vụ | ADMIN | `RegistrationAdminController` | `RegistrationAdminService` | `RegistrationPeriodRepository` | `RegistrationPeriodManager.tsx` | POST/PATCH `/api/v1/admin/registration-periods` |
| UC3-08 | Import danh sách SV đủ điều kiện | Nghiệp vụ | ADMIN | `RegistrationEligibilityController` | `RegistrationEligibilityService` | `RegistrationEligibilityRepository` | `RegistrationPeriodManager.tsx` | POST `/api/v1/admin/registration-periods/{id}/eligibilities/import` |
| UC3-09 | Xét duyệt hồ sơ đăng ký | Nghiệp vụ | ADMIN/STAFF | `ApplicationReviewController` | `ApplicationReviewService` | `DormitoryApplicationRepository`, `VerificationDocumentRepository` | `ApplicationReviewQueue.tsx`, `ApplicationReviewDetail.tsx` | PATCH `/api/v1/admin/applications/{id}/approve|reject` |
| UC3-10 | Yêu cầu bổ sung hồ sơ | Nghiệp vụ | ADMIN/STAFF | `ApplicationReviewController` | `ApplicationReviewService` | `DormitoryApplicationRepository` | `ApplicationReviewDetail.tsx` | PATCH `/api/v1/admin/applications/{id}/request-revision` |
| UC3-11 | Xác nhận thanh toán (Admin) | Nghiệp vụ | ADMIN/STAFF | `ApplicationReviewController` | `ApplicationReviewService`, `BillService` | `BillRepository` | `ApplicationReviewDetail.tsx` | PATCH `/api/v1/admin/applications/{id}/confirm-payment` |
| UC3-12 | Xem & Xác nhận Check-in | Nghiệp vụ | ADMIN/STAFF | `CheckInController` | `CheckInService` | `StudentHousingAssignmentRepository` | `CheckInManagement.tsx` | GET search + POST `/api/v1/admin/check-in/{assignmentId}` |
| UC3-13 | Nộp đơn gia hạn lưu trú | Nghiệp vụ | SV KTX | `StayExtensionController` | `StayExtensionService` | `StayExtensionRepository` | App Student | POST `/api/v1/students/extensions` |
| UC3-14 | Duyệt đơn gia hạn | Nghiệp vụ | ADMIN/STAFF | `StayExtensionAdminController` | `StayExtensionService` | `StayExtensionRepository` | `StayExtensionManagement.tsx` | PUT `/api/v1/admin/extensions/{id}/status` |
| UC3-15 | Nộp đơn xin chuyển phòng (SV) | Nghiệp vụ | SV KTX | `StudentChangeRoomController` | `ChangeRoomService` | `ChangeRoomRequestRepository` | App Student | POST `/api/v1/student/change-room` |
| UC3-16 | Duyệt đơn chuyển phòng (Admin) | Nghiệp vụ | ADMIN/STAFF | `AdminChangeRoomController` | `ChangeRoomService` | `ChangeRoomRequestRepository`, `BedRepository` | `ChangeRoomManagement/index.tsx` | POST `/api/v1/admin/change-room/requests/{id}/process` |
| UC3-18 | Nộp đơn trả phòng (SV) | Nghiệp vụ | SV KTX | `CheckoutRequestController` | `CheckoutRequestService` | `CheckoutRequestRepository` | App Student | POST `/api/v1/students/checkout-requests` |
| UC3-19 | Duyệt đơn trả phòng (Admin) | Nghiệp vụ | ADMIN/STAFF | `CheckoutRequestAdminController` | `CheckoutRequestService` | `CheckoutRequestRepository` | `CheckoutManagement.tsx` | POST `/api/v1/admin/checkout-requests/{id}/review` |

---

## MODULE 4: TÀI CHÍNH & THANH TOÁN (UC4)

### 4.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC4-02 | Xem chỉ số điện tất cả phòng | CRUD (R) | ADMIN/STAFF | `UtilityUsageController` | `UtilityUsageManagementService` | `UtilityUsageRepository` | `UtilityReadingPage.tsx` | GET `/api/v1/admin/utilities/rooms` |
| UC4-03 | Xóa chỉ số điện sai | CRUD (D) | ADMIN/STAFF | `UtilityUsageController` | `UtilityUsageManagementService` | `UtilityUsageRepository` | `UtilityReadingPage.tsx` | DELETE `/api/v1/admin/utilities/record` |
| UC4-05 | Xem tất cả hóa đơn hệ thống | CRUD (R) | ADMIN/STAFF | `BillController` | `BillService` | `BillRepository` | `PaymentManagement.tsx` | GET `/api/v1/bills` |
| UC4-06 | Xem hóa đơn theo hồ sơ | CRUD (R) | Tất cả | `BillController` | `BillService` | `BillRepository` | `PaymentPage.tsx`, `ApplicationReviewDetail.tsx` | GET `/api/v1/bills/application/{applicationId}` |
| UC4-07 | Xem hóa đơn của bản thân (SV) | CRUD (R) | SV KTX | `BillController` | `BillService` | `BillRepository` | App Student | GET `/api/v1/bills/me` |
| UC4-11 | Xem hướng dẫn thanh toán | CRUD (R) | Công khai | `PaymentInstructionController` | `PaymentInstructionService` | — | `PaymentPage.tsx` | GET `/api/v1/public/payment-instructions` |

### 4.2 Nhóm Quy trình Nghiệp vụ (Logic Lõi)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC4-01 | Ghi chỉ số điện định kỳ | Nghiệp vụ | ADMIN/STAFF | `UtilityUsageController` | `UtilityUsageManagementService` | `UtilityUsageRepository` | `UtilityReadingPage.tsx` | POST `/api/v1/admin/utilities/record` |
| UC4-04 | Tạo hóa đơn thủ công | Nghiệp vụ | ADMIN/STAFF | `BillController` | `BillService` | `BillRepository` | `PaymentManagement.tsx` | POST `/api/v1/bills/manual` |
| UC4-08 | Thanh toán trực tuyến QR | Nghiệp vụ | SV KTX / SV Trường | `PaymentController` | `PaymentService` | `PaymentRepository`, `BillRepository` | `PaymentPage.tsx`, App Student | POST `/api/v1/payments/online` |
| UC4-09 | Xác nhận thanh toán tiền mặt | Nghiệp vụ | ADMIN/STAFF | `PaymentController` | `PaymentService` | `PaymentRepository`, `BillRepository` | `PaymentManagement.tsx` | POST `/api/v1/payments/cash/approve` |
| UC4-10 | Nhận Webhook SePay (tự động) | Nghiệp vụ | SePay System | `SepayWebhookController` | `SepayService`, `BillService` | `BillRepository`, `PaymentRepository` | — (background) | POST `/api/webhooks/sepay` |

---

## MODULE 5: AN NINH & THÔNG BÁO (UC5)

### 5.1 Nhóm Quản trị dữ liệu cơ bản (CRUD)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC5-09 | Xem trạng thái Face ID (SV) | CRUD (R) | SV KTX | `FaceStudentController` | `FaceProfileService` | `FaceProfileRepository` | App Student | GET `/api/v1/students/me/face` |
| UC5-10 | Xem lịch sử xác thực của SV | CRUD (R) | SV KTX | `FaceStudentController`, `AccessHistoryController` | `FaceVerificationService` | `FaceVerificationAttemptRepository` | App Student | GET `/api/v1/students/me/face/verifications`, GET `/api/v1/access/history/me` |
| UC5-13 | Quản lý Cổng/Thiết bị IoT | CRUD | ADMIN | `GateController` | `GateService` | `GateRepository` | `GateManagement.tsx` | GET/POST/PUT/DELETE `/api/v1/gates` |
| UC5-14 | Xem lịch sử ra vào (Admin) | CRUD (R) | ADMIN/STAFF | `AccessHistoryController` | — | `AccessHistoryRepository` | `SmartAccessManagement.tsx` | GET `/api/v1/access/history` và các filter |

### 5.2 Nhóm Quy trình Nghiệp vụ (Logic Lõi)
| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC5-01 | Xác thực thẻ RFID tại cổng | Nghiệp vụ | IoT Device | `IotVerificationController` | `AccessEvaluationService`, `EligibilityEvaluationService` | `AccessHistoryRepository`, `GateRepository` | — (IoT) | POST `/api/v1/smartaccess/verify/card` |
| UC5-02 | Xác thực khuôn mặt tại cổng | Nghiệp vụ | IoT Device | `IotVerificationController`, `FaceInternalController` | `FaceAiOrchestrator`, `AccessEvaluationService` | `FaceProfileRepository`, `AccessHistoryRepository` | — (IoT + AI) | POST `/api/v1/smartaccess/verify/face` |
| UC5-03 | Xác thực mã PIN cửa phòng | Nghiệp vụ | IoT Device | `IotVerificationController` | `RoomPinService`, `AccessEvaluationService` | `AccessHistoryRepository` | — (IoT) | POST `/api/v1/smartaccess/verify/pin` |
| UC5-04 | Lấy danh sách RFID hợp lệ | Nghiệp vụ | IoT Device | `IotVerificationController` | `EligibilityEvaluationService` | `StudentRepository` | — (IoT sync) | GET `/api/v1/smartaccess/rfid-whitelist` |
| UC5-06 | Đồng bộ log offline IoT | Nghiệp vụ | IoT Device | `IotVerificationController` | `AccessEvaluationService`, `IdempotencyService` | `AccessHistoryRepository`, `ProcessedMessageRepository` | — | POST `/api/v1/smartaccess/offline-log-batch` |
| UC5-07 | Đăng ký Face ID (SV) | Nghiệp vụ | SV KTX | `FaceStudentController` | `FaceProfileService`, `FaceAiOrchestrator` | `FaceProfileRepository`, `FaceEmbeddingRepository` | App Student | POST `/api/v1/students/me/face` |
| UC5-08 | Yêu cầu thay ảnh Face ID (SV) | Nghiệp vụ | SV KTX | `FaceStudentController` | `FaceProfileService` | `FaceProfileRepository` | App Student | POST `/api/v1/students/me/face/replacements` |
| UC5-11 | Duyệt đăng ký Face ID | Nghiệp vụ | ADMIN/STAFF | `FaceAdminController` | `FaceProfileService` | `FaceProfileRepository` | `FaceApprovalQueue.tsx` | POST `/api/v1/admin/faces/{id}/approve|reject` |
| UC5-12 | Thu hồi Face ID | Nghiệp vụ | ADMIN/STAFF | `FaceAdminController` | `FaceProfileService` | `FaceProfileRepository` | `FaceApprovalQueue.tsx` | POST `/api/v1/admin/faces/{id}/revoke` |
| UC5-15 | Mở cửa từ xa | Nghiệp vụ | ADMIN | `RemoteUnlockController` | `RemoteUnlockService` | `GateRepository` | `SmartAccessManagement.tsx` | POST `/api/v1/access/gates/{gateId}/unlock` |
| UC5-16 | Mở cửa khẩn cấp toàn hệ thống | Nghiệp vụ | ADMIN | `EmergencyOverrideController` | `EmergencyOverrideService` | `GateRepository` | `SmartAccessManagement.tsx` | POST `/api/v1/access/emergency` |
| UC5-17 | Cấu hình khung giờ RFID/Face | Nghiệp vụ | ADMIN | `TimeWindowPolicyController` | `AccessEvaluationService` | — | `SmartAccessManagement.tsx` | POST/PUT `/api/v1/access/time-window-policies` |
| UC5-18 | Cấu hình chính sách giờ giới nghiêm | Nghiệp vụ | ADMIN | `CurfewPolicyController` | `AccessEvaluationService` | `CurfewPolicyRepository` | `SmartAccessManagement.tsx` | POST/PUT `/api/v1/access/curfew-policies` |
| UC5-24 | Đồng bộ trạng thái IoT thủ công | Nghiệp vụ | ADMIN | `AccessHistoryController` | `ManualSyncService` | `AccessHistoryRepository` | `SmartAccessManagement.tsx` | POST `/api/v1/access/history/sync-state` |



---

## HỆ THỐNG PHÂN CẤP USE CASE (UML HIERARCHY)
Dưới đây là sơ đồ phân rã từ 5 Phân hệ (Package) thành các Chức năng chính (Main Use Case) và các Chức năng chi tiết (Sub-functions / Scenarios). Phần này phục vụ trực tiếp cho việc vẽ **Sơ đồ Use Case Tổng quát** (Chương 2).

### 1. Phân hệ Hệ thống & Tài khoản
*   **UC Lớn 1.1: Quản trị Tài khoản & Phân quyền**
    *   *Chi tiết:* Đăng nhập, Kích hoạt tài khoản (OTP), Đăng xuất, Đổi mật khẩu, Quên & Đặt lại mật khẩu, Tạo tài khoản nhân viên, Xem danh sách tài khoản cán bộ, Khóa/Mở khóa tài khoản cán bộ.
*   **UC Lớn 1.2: Quản lý Hồ sơ Người dùng**
    *   *Chi tiết:* Xem hồ sơ cá nhân, Cập nhật hồ sơ cá nhân, Xem danh sách sinh viên, Xem hồ sơ chi tiết sinh viên, Cập nhật thông tin sinh viên, Gắn thẻ RFID cho sinh viên.
*   **UC Lớn 1.3: Quản trị & Thống kê**
    *   *Chi tiết:* Thiết lập cấu hình hệ thống, Xem Dashboard thống kê, Xem hợp đồng sắp hết hạn.

### 2. Phân hệ Cơ sở vật chất
*   **UC Lớn 2.1: Quản lý Tòa nhà & Tầng**
    *   *Chi tiết:* Tạo Tòa nhà, Xem danh sách Tòa nhà, Cập nhật Tòa nhà, Đổi trạng thái Tòa nhà, Xóa Tòa nhà, Tạo Tầng, Xem danh sách Tầng, Cập nhật Tầng, Xóa Tầng.
*   **UC Lớn 2.2: Quản lý Phòng, Giường & Khóa thông minh**
    *   *Chi tiết:* Tạo Phòng, Xem danh sách Phòng, Xem chi tiết Phòng, Cập nhật Phòng, Đổi trạng thái Phòng, Xóa Phòng, Tạo Giường thủ công, Tự động sinh Giường, Đổi trạng thái Giường, Xóa Giường, Quản lý Mã PIN cửa phòng, Sinh PIN hàng loạt.
*   **UC Lớn 2.3: Tra cứu Cơ sở vật chất (Dành cho Sinh viên)**
    *   *Chi tiết:* Xem kết quả xếp phòng, Xem thông tin phòng ở hiện tại, Xem phòng còn trống.

### 3. Phân hệ Dịch vụ lưu trú
*   **UC Lớn 3.1: Quản lý Đợt Đăng ký Nội trú (Admin)**
    *   *Chi tiết:* Tạo và kích hoạt đợt đăng ký, Cập nhật đợt đăng ký, Xem danh sách đợt đăng ký, Import danh sách SV đủ điều kiện.
*   **UC Lớn 3.2: Nộp đơn & Xét duyệt Lưu trú**
    *   *Chi tiết:* Xem đợt đăng ký đang mở (SV), Kiểm tra điều kiện đăng ký (SV), Nộp đơn đăng ký nội trú (SV), Tải lên minh chứng (SV), Tra cứu trạng thái hồ sơ (SV), Nộp lại minh chứng (SV), Xét duyệt hồ sơ (Admin), Yêu cầu bổ sung hồ sơ (Admin), Xác nhận thanh toán (Admin).
*   **UC Lớn 3.3: Thực thi Lưu trú (Check-in/Check-out)**
    *   *Chi tiết:* Xem & Xác nhận Check-in, Nộp đơn trả phòng (SV), Duyệt đơn trả phòng (Admin).
*   **UC Lớn 3.4: Quản lý Biến động Lưu trú**
    *   *Chi tiết:* Nộp đơn gia hạn lưu trú, Duyệt đơn gia hạn, Nộp đơn xin chuyển phòng (SV), Duyệt đơn chuyển phòng (Admin).

### 4. Phân hệ Tài chính & Thanh toán
*   **UC Lớn 4.1: Quản lý Chỉ số Điện nước**
    *   *Chi tiết:* Ghi chỉ số điện định kỳ, Xem chỉ số điện tất cả phòng, Xóa chỉ số điện sai.
*   **UC Lớn 4.2: Quản lý Hóa đơn & Công nợ**
    *   *Chi tiết:* Tạo hóa đơn thủ công, Xem tất cả hóa đơn hệ thống, Xem hóa đơn theo hồ sơ, Xem hóa đơn của bản thân (SV).
*   **UC Lớn 4.3: Thanh toán & Đối soát**
    *   *Chi tiết:* Thanh toán trực tuyến QR, Xác nhận thanh toán tiền mặt, Nhận Webhook SePay (tự động), Xem hướng dẫn thanh toán.

### 5. Phân hệ An ninh thông minh IoT
*   **UC Lớn 5.1: Kiểm soát Cổng ra vào & Thiết bị IoT**
    *   *Chi tiết:* Xác thực thẻ RFID tại cổng, Xác thực khuôn mặt tại cổng, Xác thực mã PIN cửa phòng, Lấy danh sách RFID hợp lệ, Đồng bộ log offline IoT, Xem lịch sử ra vào (Admin), Mở cửa từ xa, Mở cửa khẩn cấp, Cấu hình khung giờ RFID/Face, Cấu hình giờ giới nghiêm, Đồng bộ trạng thái IoT thủ công.
*   **UC Lớn 5.2: Quản trị Dữ liệu Sinh trắc học (Biometrics)**
    *   *Chi tiết:* Đăng ký Face ID (SV), Yêu cầu thay ảnh Face ID (SV), Xem trạng thái Face ID (SV), Xem lịch sử xác thực của SV, Duyệt đăng ký Face ID, Thu hồi Face ID.

---

## CÁC LUỒNG NGHIỆP VỤ CỐT LÕI (BUSINESS WORKFLOWS)
*(Dùng làm nền tảng để vẽ Sơ đồ Tuần tự - Sequence Diagram & Sơ đồ Hoạt động - Activity Diagram)*

Để tránh việc phải vẽ sơ đồ cho từng API đơn lẻ một cách vụn vặt, các chức năng phức tạp (ngoài CRUD cơ bản) đã được **gộp lại** thành 6 luồng nghiệp vụ hoàn chỉnh. Mỗi luồng thể hiện một hành trình thực tế của người dùng, liên kết nhiều API từ nhiều Use Case Lớn khác nhau.

### 1. Luồng Đăng ký nội trú & Tự động xếp phòng
Luồng này thể hiện toàn bộ quy trình từ lúc sinh viên nộp đơn đến khi hệ thống tự động gán giường.
*   **Các API / Chức năng được gộp:**
    *   Kiểm tra điều kiện đăng ký (UC 3.1)
    *   Nộp đơn đăng ký + Upload minh chứng (UC 3.1)
    *   Admin xét duyệt hồ sơ (UC 3.1)
    *   Hệ thống Tự động xếp Giường/Phòng (UC 2.2)

### 2. Luồng Thanh toán QR tự động (Tích hợp Webhook)
Luồng xử lý logic tự động gạch nợ khi sinh viên quét mã QR chuyển khoản ngân hàng.
*   **Các API / Chức năng được gộp:**
    *   Hệ thống tạo Hóa đơn công nợ (UC 4.2)
    *   Sinh viên tạo mã QR thanh toán (UC 4.3)
    *   Nhận Webhook từ SePay báo có biến động số dư (UC 4.3)
    *   Tự động đổi trạng thái hóa đơn thành "Đã thanh toán" (UC 4.2)

### 3. Luồng Check-in & Đồng bộ Thiết bị IoT (Biometrics)
Luồng này diễn ra khi sinh viên đến KTX nhận phòng và được cấp quyền ra vào cổng an ninh.
*   **Các API / Chức năng được gộp:**
    *   Xác nhận Check-in thực tế (UC 3.2)
    *   Gắn thẻ RFID cho sinh viên (UC 1.2)
    *   Sinh viên đăng ký Khuôn mặt - Face ID (UC 5.2)
    *   Hệ thống Push dữ liệu sinh trắc học xuống Cổng IoT (UC 5.3)

### 4. Luồng Kiểm soát Ra vào thông minh & Xử lý Cảnh báo
Luồng này liên tục chạy ngầm/kích hoạt khi có sự kiện vật lý tại Cổng/Cửa KTX.
*   **Các API / Chức năng được gộp:**
    *   Thiết bị quét FaceID/RFID/PIN gọi API Xác thực (UC 5.1)
    *   Kiểm tra logic giờ giới nghiêm (UC 5.1)
    *   Lưu lịch sử vào/ra thành công (UC 5.1)

### 5. Luồng Quản lý Biến động Lưu trú (Chuyển phòng/Trả phòng)
Luồng này giải quyết các nghiệp vụ phát sinh trong quá trình ở của sinh viên, đảm bảo giải phóng tài nguyên hệ thống.
*   **Các API / Chức năng được gộp:**
    *   Sinh viên nộp đơn Chuyển/Trả phòng (UC 3.3)
    *   Admin duyệt đơn (UC 3.3)
    *   Hệ thống tự động giải phóng Giường cũ thành "Trống" (UC 2.2)
    *   Xử lý ngầm: Thu hồi quyền mở cửa từ xa của FaceID/RFID (UC 5.2)

### 6. Luồng Khởi tạo Hạ tầng hàng loạt (Dành cho Admin)
Luồng giúp Admin thiết lập dữ liệu nhanh chóng cho toàn bộ tòa nhà KTX mới mà không cần nhập tay từng dòng.
*   **Các API / Chức năng được gộp:**
    *   Tạo Tòa nhà (UC 2.1)
    *   Tự động sinh các Tầng dựa trên số tầng khai báo (UC 2.1)
    *   Tự động sinh hàng loạt Phòng & Giường cho từng Tầng (UC 2.2)
    *   Tự động sinh và lưu trữ Mã PIN cửa thông minh cho từng Phòng (UC 2.2)

---

## PHÂN TÍCH ĐỘ PHỦ NGHIỆP VỤ (API COVERAGE ANALYSIS)
Dựa trên danh sách 90 chức năng chi tiết và 6 Luồng Nghiệp vụ cốt lõi, dưới đây là bản đồ phân loại: Những API nghiệp vụ nào được "gom" vào 6 sơ đồ liên kết, và những API nghiệp vụ/CRUD nào đứng ngoài.

### Nhóm 1: Các API Nghiệp vụ ĐƯỢC TRÍCH VÀO 6 Sơ đồ Tuần tự
Đây là những "mắt xích" đặc biệt quan trọng cấu thành nên 6 luồng phức tạp:
1.  **Thuộc Phân hệ Dịch vụ (UC 3.x):** Kiểm tra điều kiện đăng ký, Nộp đơn/Upload minh chứng, Xét duyệt hồ sơ (Flow 1); Xác nhận Check-in (Flow 3); Nộp/Duyệt đơn chuyển phòng, trả phòng (Flow 5).
2.  **Thuộc Phân hệ Tài chính (UC 4.x):** Tạo hóa đơn công nợ, Đổi trạng thái hóa đơn, Thanh toán QR tự động, Nhận Webhook từ SePay (Flow 2).
3.  **Thuộc Phân hệ An ninh & IoT (UC 5.x):** Đăng ký/Thu hồi Face ID, Gắn thẻ RFID (Flow 3, Flow 5); Push đồng bộ dữ liệu xuống IoT (Flow 3); Xác thực Face/RFID/PIN tại cổng, Kiểm tra giới nghiêm, Ghi lịch sử ra vào (Flow 4).
4.  **Thuộc Phân hệ Cơ sở vật chất (UC 2.x):** Tự động sinh Tầng/Phòng/Giường, Sinh mã PIN hàng loạt (Flow 6); Tự động xếp phòng (Flow 1), Tự động giải phóng giường trống (Flow 5).

### Nhóm 2: Các API Nghiệp vụ KHÔNG NẰM TRONG 6 Sơ đồ (Đứng độc lập)
Đây là những nghiệp vụ hoặc độc lập, hoặc là nhánh phụ rẽ ngang, hoặc mang tính Report/View-only. Ta sẽ không vẽ sơ đồ tuần tự riêng rẽ cho chúng để tránh làm rác đồ án, mà chỉ mô tả bằng chữ trong Bảng đặc tả Use Case:
1.  **Nghiệp vụ Xác thực (Auth):** Đăng nhập, Kích hoạt OTP, Quên mật khẩu, Khóa tài khoản (UC 1.1). Đây là luồng Security tiêu chuẩn (hệ thống nào cũng có), hội đồng hiếm khi yêu cầu vẽ trừ khi là đồ án chuyên về Bảo mật.
2.  **Nghiệp vụ Báo cáo & Tra cứu (Read-only):** Xem Dashboard thống kê (UC 1.3), Xem kết quả xếp phòng (UC 2.3). Các API này thuần gọi lệnh `GET` + `Query` từ Database, không làm thay đổi trạng thái hệ thống.
3.  **Nghiệp vụ Vận hành định kỳ:** Ghi chỉ số điện nước hàng tháng (UC 4.1). Đây là action nộp form độc lập của cán bộ, không có chuỗi phản ứng dây chuyền phức tạp.
4.  **Nghiệp vụ Nhánh rẽ/Phụ trợ:** Yêu cầu bổ sung hồ sơ, Nộp lại minh chứng (Đây chỉ là luồng phụ Alternative Flow của Flow 1).
5.  **Các API thuần CRUD và Quản lý (Sẽ được đại diện bằng 5 Sơ đồ Tuần tự CRUD mẫu tương ứng với 5 Phân hệ):**
    *   *Hệ thống & Tài khoản:* Đổi mật khẩu, Tạo tài khoản nhân viên, Xem danh sách tài khoản cán bộ, Khóa/Mở khóa tài khoản cán bộ, Xem hồ sơ cá nhân, Cập nhật hồ sơ cá nhân, Xem danh sách sinh viên, Xem hồ sơ chi tiết sinh viên, Cập nhật thông tin sinh viên, Thiết lập cấu hình hệ thống, Xem hợp đồng sắp hết hạn.
    *   *Cơ sở vật chất:* Tạo Tòa nhà (thủ công), Xem danh sách Tòa nhà, Cập nhật Tòa nhà, Đổi trạng thái Tòa nhà, Xóa Tòa nhà, Tạo Tầng (thủ công), Xem danh sách Tầng, Cập nhật Tầng, Xóa Tầng, Tạo Phòng (thủ công), Xem danh sách Phòng, Xem chi tiết Phòng, Cập nhật Phòng, Đổi trạng thái Phòng, Xóa Phòng, Tạo Giường thủ công, Đổi trạng thái Giường, Xóa Giường, Quản lý Mã PIN cửa phòng.
    *   *Dịch vụ lưu trú:* Tạo và kích hoạt đợt đăng ký, Import danh sách SV đủ điều kiện, Xem đợt đăng ký đang mở, Tra cứu trạng thái hồ sơ, Nộp đơn gia hạn lưu trú, Duyệt đơn gia hạn.
    *   *Tài chính & Thanh toán:* Xem chỉ số điện tất cả phòng, Xóa chỉ số điện sai, Xem tất cả hóa đơn hệ thống, Xem hóa đơn theo hồ sơ, Xem hóa đơn của bản thân, Xác nhận thanh toán tiền mặt, Xem hướng dẫn thanh toán.
    *   *An ninh & Thông báo:* Lấy danh sách RFID hợp lệ, Mở cửa từ xa, Mở cửa khẩn cấp toàn hệ thống, Xem lịch sử ra vào (Admin), Yêu cầu thay ảnh Face ID, Xem trạng thái Face ID, Xem lịch sử xác thực của SV, Quản lý Cổng/Thiết bị IoT, Cấu hình khung giờ RFID/Face, Cấu hình chính sách giờ giới nghiêm, Đồng bộ trạng thái IoT thủ công.
