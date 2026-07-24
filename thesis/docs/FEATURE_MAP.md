# FEATURE MAP — Bản đồ Chức năng Hệ thống SDMS
> **Mục đích:** Làm nền tảng để sinh Use Case Chi tiết, Bảng mô tả Use Case, Sơ đồ Tuần tự và Sơ đồ Hoạt động.  
> **Nguồn:** Audit trực tiếp từ mã nguồn Backend + Frontend (Code is Truth).  
> **Cập nhật:** 2026-07-23

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

| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC1-01 | Đăng nhập | Nghiệp vụ | Tất cả | `AuthController` | `AuthService`, `JwtService` | `UserAccountRepository` | `LoginPage.tsx` (Admin), `ActivateAccountPage.tsx` (SV) | POST `/api/v1/auth/login` |
| UC1-02 | Kích hoạt tài khoản (OTP) | Nghiệp vụ | SV Trường | `AuthController` | `AuthService` | `UserAccountRepository` | `ActivateAccountPage.tsx` | POST `/api/v1/auth/activate` |
| UC1-03 | Đăng xuất | Nghiệp vụ | Tất cả | `AuthController` | `AuthService`, `JwtService` | — | `LoginPage.tsx` | POST `/api/v1/auth/logout` |
| UC1-04 | Đổi mật khẩu | Nghiệp vụ | Tất cả | `AuthController` | `AuthService` | `UserAccountRepository` | Trang Profile (Admin/SV) | POST `/api/v1/auth/change-password` |
| UC1-05 | Quên & Đặt lại mật khẩu | Nghiệp vụ | Tất cả | `AuthController` | `AuthService` | `UserAccountRepository` | `ForgotPasswordPage.tsx`, `ResetPasswordPage.tsx` | POST `/api/v1/auth/forgot-password`, `/reset-password` |
| UC1-06 | Xem hồ sơ cá nhân | CRUD (R) | SV KTX | `UserController`, `StudentController` | `UserService`, `StudentService` | `UserAccountRepository`, `StudentRepository` | App Student (me) | GET `/api/v1/users/me`, GET `/api/v1/students/me` |
| UC1-07 | Cập nhật hồ sơ cá nhân | CRUD (U) | SV KTX | `StudentController` | `StudentService` | `StudentRepository` | App Student (profile edit) | PATCH `/api/v1/students/me` |
| UC1-08 | Tạo tài khoản nhân viên | CRUD (C) | ADMIN | `AdminAccountController` | `UserService` | `UserAccountRepository` | `AccountManagementPage.tsx` | POST `/api/v1/admin/accounts/staff` |
| UC1-09 | Xem danh sách tài khoản cán bộ | CRUD (R) | ADMIN | `AdminAccountController` | `UserService` | `UserAccountRepository` | `AccountManagementPage.tsx` | GET `/api/v1/admin/accounts` |
| UC1-10 | Khóa/Mở khóa tài khoản cán bộ | CRUD (U) | ADMIN | `AdminAccountController` | `UserService` | `UserAccountRepository` | `AccountManagementPage.tsx` | PUT `/api/v1/admin/accounts/{id}/toggle-lock` |
| UC1-11 | Xem danh sách sinh viên | CRUD (R) | ADMIN/STAFF | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | GET `/api/v1/students` |
| UC1-12 | Xem hồ sơ chi tiết sinh viên | CRUD (R) | ADMIN/STAFF | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | GET `/api/v1/students/{id}/profile` |
| UC1-13 | Cập nhật thông tin sinh viên | CRUD (U) | ADMIN | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | PATCH `/api/v1/students/{id}` |
| UC1-14 | Gắn thẻ RFID cho sinh viên | Nghiệp vụ | ADMIN | `StudentController` | `StudentService` | `StudentRepository` | `StudentManagementPage.tsx` | POST `/api/v1/students/{id}/rfid` |
| UC1-15 | Thiết lập cấu hình hệ thống | CRUD (U) | ADMIN | `SystemConfigController` | `SystemConfigService` | `SystemConfigRepository` | `SystemConfigPage.tsx` | GET/PUT `/api/v1/admin/system-configs` |
| UC1-16 | Xem Dashboard thống kê | Nghiệp vụ | ADMIN | `DashboardController` | `DashboardService` | — | `AdminDashboard.tsx` | GET `/api/v1/dashboard/stats` |
| UC1-17 | Xem hợp đồng sắp hết hạn | Nghiệp vụ | ADMIN | `DashboardController` | `DashboardService` | `StudentHousingAssignmentRepository` | `AdminDashboard.tsx` | GET `/api/v1/dashboard/expiring-assignments` |

---

## MODULE 2: CƠ SỞ VẬT CHẤT (UC2)

| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC2-01 | Tạo Tòa nhà | CRUD (C) | ADMIN/STAFF | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/buildings` |
| UC2-02 | Xem danh sách Tòa nhà | CRUD (R) | ADMIN/STAFF | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/buildings` |
| UC2-03 | Cập nhật Tòa nhà | CRUD (U) | ADMIN/STAFF | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | PUT `/api/v1/admin/buildings/{id}` |
| UC2-04 | Đổi trạng thái Tòa nhà | CRUD (U) | ADMIN/STAFF | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | PATCH `/api/v1/admin/buildings/{id}/status` |
| UC2-05 | Tạo Tầng | CRUD (C) | ADMIN/STAFF | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/floors` |
| UC2-06 | Xem danh sách Tầng | CRUD (R) | ADMIN/STAFF | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/floors/building/{buildingId}` |
| UC2-07 | Cập nhật Tầng | CRUD (U) | ADMIN/STAFF | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | PUT `/api/v1/admin/floors/{floorId}` |
| UC2-08 | Tạo Phòng | CRUD (C) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/rooms` |
| UC2-09 | Xem danh sách Phòng | CRUD (R) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/rooms` |
| UC2-10 | Xem chi tiết Phòng | CRUD (R) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository`, `BedRepository` | `RoomManagementPage.tsx` | GET `/api/v1/admin/rooms/{roomId}` |
| UC2-11 | Cập nhật Phòng | CRUD (U) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | PUT `/api/v1/admin/rooms/{roomId}` |
| UC2-12 | Đổi trạng thái Phòng | CRUD (U) | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | PATCH `/api/v1/admin/rooms/{roomId}/status` |
| UC2-13 | Tạo Giường thủ công | CRUD (C) | ADMIN/STAFF | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/beds` |
| UC2-14 | Tự động sinh Giường | Nghiệp vụ | ADMIN/STAFF | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | POST `/api/v1/admin/beds/room/{roomId}/auto-generate` |
| UC2-15 | Đổi trạng thái Giường | CRUD (U) | ADMIN/STAFF | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | PATCH `/api/v1/admin/beds/{bedId}/status` |
| UC2-16 | Quản lý Mã PIN cửa phòng | Nghiệp vụ | ADMIN | `RoomPinController` | `RoomPinService` | — | `RoomManagementPage.tsx` | GET/POST `/api/v1/room-pins/{roomId}` |
| UC2-17 | Sinh PIN hàng loạt | Nghiệp vụ | ADMIN | `RoomPinController` | `RoomPinService` | — | `RoomManagementPage.tsx` | POST `/api/v1/room-pins/bulk-generate` |
| UC2-18 | Xem kết quả xếp phòng (SV) | Nghiệp vụ | SV/ADMIN | `PublicRoomController` | `HousingAssignmentService` | `StudentHousingAssignmentRepository` | App Student | GET `/api/v1/student/room-result/assignment/{applicationId}` |
| UC2-19 | Xem thông tin phòng ở hiện tại (SV) | CRUD (R) | SV KTX | `StudentRoomController` | `StudentRoomService` | `StudentHousingAssignmentRepository`, `RoomRepository` | App Student | GET `/api/v1/student/room/current` |
| UC2-20 | Xem phòng còn trống (SV) | Nghiệp vụ | SV KTX | `RoomStudentController` | `RoomService` | `RoomRepository` | App Student | GET `/api/v1/student/rooms/available` |
| UC2-21 | Xem đếm ngược hạn xác nhận | Nghiệp vụ | SV KTX | `StudentAssignmentCountdownController` | `HousingAssignmentService` | `StudentHousingAssignmentRepository` | App Student | GET `/api/v1/student/assignments/countdown` |
| UC2-22 | Báo cáo phân tích phòng (Admin) | Nghiệp vụ | ADMIN/STAFF | `RoomController` | `RoomService` | `RoomRepository` | `DashboardView.tsx` | GET `/api/v1/admin/rooms/analytics/*` |
| UC2-23 | Xóa Tòa nhà (Draft) | CRUD (D) | ADMIN | `BuildingController` | `BuildingService` | `BuildingRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/buildings/{id}` |
| UC2-24 | Xóa Tầng (Draft) | CRUD (D) | ADMIN | `FloorController` | `FloorService` | `FloorRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/floors/{floorId}` |
| UC2-25 | Xóa Phòng (Draft) | CRUD (D) | ADMIN | `RoomController` | `RoomService` | `RoomRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/rooms/{roomId}` |
| UC2-26 | Xóa Giường | CRUD (D) | ADMIN | `BedController` | `BedService` | `BedRepository` | `RoomManagementPage.tsx` | DELETE `/api/v1/admin/beds/{bedId}` |

---

## MODULE 3: DỊCH VỤ LƯU TRÚ (UC3)

| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC3-01 | Xem đợt đăng ký đang mở | CRUD (R) | Công khai | `RegistrationController` | `RegistrationService` | `RegistrationPeriodRepository` | `RegistrationPage.tsx` | GET `/api/v1/registrations/active` |
| UC3-02 | Kiểm tra điều kiện đăng ký | Nghiệp vụ | SV Trường | `RegistrationController` | `RegistrationService`, `RegistrationEligibilityService` | `RegistrationEligibilityRepository` | `RegistrationPage.tsx` | POST `/api/v1/registrations/check-eligibility` |
| UC3-03 | Nộp đơn đăng ký nội trú | Nghiệp vụ | SV Trường | `ApplicationController` | `ApplicationService` | `DormitoryApplicationRepository` | `RegistrationPage.tsx` | POST `/api/v1/applications` → submit |
| UC3-04 | Tải lên minh chứng | Nghiệp vụ | SV Trường | `ApplicationController`, `UploadController` | `ApplicationService`, `CloudinaryService` | `VerificationDocumentRepository` | `RegistrationPage.tsx` | POST `/api/v1/applications/{id}/documents` |
| UC3-05 | Tra cứu trạng thái hồ sơ | CRUD (R) | SV Trường | `ApplicationController` | `ApplicationService` | `DormitoryApplicationRepository` | `StatusPage.tsx` | GET `/api/v1/applications/status` |
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
| UC3-17 | Dời phòng khẩn cấp (bảo trì) | Nghiệp vụ | ADMIN/STAFF | `AdminChangeRoomController` | `ChangeRoomService` | `ChangeRoomRequestRepository` | `ChangeRoomManagement/index.tsx` | POST `/api/v1/admin/change-room/maintenance/relocate` |
| UC3-18 | Nộp đơn trả phòng (SV) | Nghiệp vụ | SV KTX | `CheckoutRequestController` | `CheckoutRequestService` | `CheckoutRequestRepository` | App Student | POST `/api/v1/students/checkout-requests` |
| UC3-19 | Duyệt đơn trả phòng (Admin) | Nghiệp vụ | ADMIN/STAFF | `CheckoutRequestAdminController` | `CheckoutRequestService` | `CheckoutRequestRepository` | `CheckoutManagement.tsx` | POST `/api/v1/admin/checkout-requests/{id}/review` |

---

## MODULE 4: TÀI CHÍNH & THANH TOÁN (UC4)

| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC4-01 | Ghi chỉ số điện định kỳ | Nghiệp vụ | ADMIN/STAFF | `UtilityUsageController` | `UtilityUsageManagementService` | `UtilityUsageRepository` | `UtilityReadingPage.tsx` | POST `/api/v1/admin/utilities/record` |
| UC4-02 | Xem chỉ số điện tất cả phòng | CRUD (R) | ADMIN/STAFF | `UtilityUsageController` | `UtilityUsageManagementService` | `UtilityUsageRepository` | `UtilityReadingPage.tsx` | GET `/api/v1/admin/utilities/rooms` |
| UC4-03 | Xóa chỉ số điện sai | CRUD (D) | ADMIN/STAFF | `UtilityUsageController` | `UtilityUsageManagementService` | `UtilityUsageRepository` | `UtilityReadingPage.tsx` | DELETE `/api/v1/admin/utilities/record` |
| UC4-04 | Tạo hóa đơn thủ công | Nghiệp vụ | ADMIN/STAFF | `BillController` | `BillService` | `BillRepository` | `PaymentManagement.tsx` | POST `/api/v1/bills/manual` |
| UC4-05 | Xem tất cả hóa đơn hệ thống | CRUD (R) | ADMIN/STAFF | `BillController` | `BillService` | `BillRepository` | `PaymentManagement.tsx` | GET `/api/v1/bills` |
| UC4-06 | Xem hóa đơn theo hồ sơ | CRUD (R) | Tất cả | `BillController` | `BillService` | `BillRepository` | `PaymentPage.tsx`, `ApplicationReviewDetail.tsx` | GET `/api/v1/bills/application/{applicationId}` |
| UC4-07 | Xem hóa đơn của bản thân (SV) | CRUD (R) | SV KTX | `BillController` | `BillService` | `BillRepository` | App Student | GET `/api/v1/bills/me` |
| UC4-08 | Thanh toán trực tuyến QR | Nghiệp vụ | SV KTX / SV Trường | `PaymentController` | `PaymentService` | `PaymentRepository`, `BillRepository` | `PaymentPage.tsx`, App Student | POST `/api/v1/payments/online` |
| UC4-09 | Xác nhận thanh toán tiền mặt | Nghiệp vụ | ADMIN/STAFF | `PaymentController` | `PaymentService` | `PaymentRepository`, `BillRepository` | `PaymentManagement.tsx` | POST `/api/v1/payments/cash/approve` |
| UC4-10 | Nhận Webhook SePay (tự động) | Nghiệp vụ | SePay System | `SepayWebhookController` | `SepayService`, `BillService` | `BillRepository`, `PaymentRepository` | — (background) | POST `/api/webhooks/sepay` |
| UC4-11 | Xem hướng dẫn thanh toán | CRUD (R) | Công khai | `PaymentInstructionController` | `PaymentInstructionService` | — | `PaymentPage.tsx` | GET `/api/v1/public/payment-instructions` |

---

## MODULE 5: AN NINH & THÔNG BÁO (UC5)

| ID | Chức năng | Loại | Actor | Controller | Service | Repository | UI Screen | Endpoint |
|----|-----------|------|-------|------------|---------|------------|-----------|----------|
| UC5-01 | Xác thực thẻ RFID tại cổng | Nghiệp vụ | IoT Device | `IotVerificationController` | `AccessEvaluationService`, `EligibilityEvaluationService` | `AccessHistoryRepository`, `GateRepository` | — (IoT) | POST `/api/v1/smartaccess/verify/card` |
| UC5-02 | Xác thực khuôn mặt tại cổng | Nghiệp vụ | IoT Device | `IotVerificationController`, `FaceInternalController` | `FaceAiOrchestrator`, `AccessEvaluationService` | `FaceProfileRepository`, `AccessHistoryRepository` | — (IoT + AI) | POST `/api/v1/smartaccess/verify/face` |
| UC5-03 | Xác thực mã PIN cửa phòng | Nghiệp vụ | IoT Device | `IotVerificationController` | `RoomPinService`, `AccessEvaluationService` | `AccessHistoryRepository` | — (IoT) | POST `/api/v1/smartaccess/verify/pin` |
| UC5-04 | Lấy danh sách RFID hợp lệ | Nghiệp vụ | IoT Device | `IotVerificationController` | `EligibilityEvaluationService` | `StudentRepository` | — (IoT sync) | GET `/api/v1/smartaccess/rfid-whitelist` |
| UC5-05 | Báo lỗi phần cứng | Nghiệp vụ | IoT Device | `IotVerificationController` | `GateService` | `GateRepository` | — | POST `/api/v1/smartaccess/report/hardware-error` |
| UC5-06 | Đồng bộ log offline IoT | Nghiệp vụ | IoT Device | `IotVerificationController` | `AccessEvaluationService`, `IdempotencyService` | `AccessHistoryRepository`, `ProcessedMessageRepository` | — | POST `/api/v1/smartaccess/offline-log-batch` |
| UC5-07 | Đăng ký Face ID (SV) | Nghiệp vụ | SV KTX | `FaceStudentController` | `FaceProfileService`, `FaceAiOrchestrator` | `FaceProfileRepository`, `FaceEmbeddingRepository` | App Student | POST `/api/v1/students/me/face` |
| UC5-08 | Yêu cầu thay ảnh Face ID (SV) | Nghiệp vụ | SV KTX | `FaceStudentController` | `FaceProfileService` | `FaceProfileRepository` | App Student | POST `/api/v1/students/me/face/replacements` |
| UC5-09 | Xem trạng thái Face ID (SV) | CRUD (R) | SV KTX | `FaceStudentController` | `FaceProfileService` | `FaceProfileRepository` | App Student | GET `/api/v1/students/me/face` |
| UC5-10 | Xem lịch sử xác thực của SV | CRUD (R) | SV KTX | `FaceStudentController`, `AccessHistoryController` | `FaceVerificationService` | `FaceVerificationAttemptRepository` | App Student | GET `/api/v1/students/me/face/verifications`, GET `/api/v1/access/history/me` |
| UC5-11 | Duyệt đăng ký Face ID | Nghiệp vụ | ADMIN/STAFF | `FaceAdminController` | `FaceProfileService` | `FaceProfileRepository` | `FaceApprovalQueue.tsx` | POST `/api/v1/admin/faces/{id}/approve|reject` |
| UC5-12 | Thu hồi Face ID | Nghiệp vụ | ADMIN/STAFF | `FaceAdminController` | `FaceProfileService` | `FaceProfileRepository` | `FaceApprovalQueue.tsx` | POST `/api/v1/admin/faces/{id}/revoke` |
| UC5-13 | Quản lý Cổng/Thiết bị IoT | CRUD | ADMIN | `GateController` | `GateService` | `GateRepository` | `GateManagement.tsx` | GET/POST/PUT/DELETE `/api/v1/gates` |
| UC5-14 | Xem lịch sử ra vào (Admin) | CRUD (R) | ADMIN/STAFF | `AccessHistoryController` | — | `AccessHistoryRepository` | `SmartAccessManagement.tsx` | GET `/api/v1/access/history` và các filter |
| UC5-15 | Mở cửa từ xa | Nghiệp vụ | ADMIN | `RemoteUnlockController` | `RemoteUnlockService` | `GateRepository` | `SmartAccessManagement.tsx` | POST `/api/v1/access/gates/{gateId}/unlock` |
| UC5-16 | Mở cửa khẩn cấp toàn hệ thống | Nghiệp vụ | ADMIN | `EmergencyOverrideController` | `EmergencyOverrideService` | `GateRepository` | `SmartAccessManagement.tsx` | POST `/api/v1/access/emergency` |
| UC5-17 | Cấu hình khung giờ RFID/Face | Nghiệp vụ | ADMIN | `TimeWindowPolicyController` | `AccessEvaluationService` | — | `SmartAccessManagement.tsx` | POST/PUT `/api/v1/access/time-window-policies` |
| UC5-18 | Cấu hình chính sách giờ giới nghiêm | Nghiệp vụ | ADMIN | `CurfewPolicyController` | `AccessEvaluationService` | `CurfewPolicyRepository` | `SmartAccessManagement.tsx` | POST/PUT `/api/v1/access/curfew-policies` |
| UC5-19 | Xin phép về trễ (SV) | Nghiệp vụ | SV KTX | `CurfewRequestController` | `CurfewRequestService` | `CurfewRequestRepository` | App Student | POST `/api/v1/curfew-requests` |
| UC5-20 | Duyệt đơn về trễ (Admin) | Nghiệp vụ | ADMIN | `CurfewRequestController` | `CurfewRequestService` | `CurfewRequestRepository` | `SmartAccessManagement.tsx` | PATCH/POST `/api/v1/curfew-requests/{id}`, bulk |
| UC5-21 | Gửi thông báo hàng loạt | Nghiệp vụ | ADMIN | `AdminNotificationController` | `NotificationService` | `NotificationRepository` | `NotificationHistory.tsx` | POST `/api/v1/admin/notifications/broadcast` |
| UC5-22 | Nhận & Xem thông báo (SV/Admin) | CRUD (R) | Đã đăng nhập | `NotificationController` | `InAppNotificationService` | `NotificationRepository` | App Student, Admin | GET `/api/v1/notifications` |
| UC5-23 | Báo cáo sự cố cơ sở vật chất | Nghiệp vụ | SV KTX | `NotificationController` | `NotificationService` | `NotificationRepository` | App Student | POST `/api/v1/notifications/issues` |
| UC5-24 | Đồng bộ trạng thái IoT thủ công | Nghiệp vụ | ADMIN | `AccessHistoryController` | `ManualSyncService` | `AccessHistoryRepository` | `SmartAccessManagement.tsx` | POST `/api/v1/access/history/sync-state` |
