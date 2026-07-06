# PERMISSION MATRIX

## Purpose
Định nghĩa ma trận phân quyền (RBAC) của SDMS. Quy định Actor nào được phép thực hiện Action trên Resource nào.

## Scope
Toàn bộ API Backend được bảo vệ bởi Spring Security + JWT.

## Source of Truth
Annotation `@PreAuthorize`, `SecurityConfig`, JWT parsing logic, `SmartAccessPermissions`.

## Contents

### Admin APIs

| Resource | Action | Method | Endpoint | Evidence |
|---|---|---|---|---|
| RegistrationPeriod | Mở/Đóng/CRUD | `POST/PUT/DELETE` | `/api/v1/admin/registrations/**` | `RegistrationAdminController` |
| RegistrationEligibility | Import danh sách đủ điều kiện | `POST` | `/api/v1/admin/registrations/eligibility/import` | `RegistrationEligibilityController` |
| Application | Duyệt/Từ chối/Xét hồ sơ | `PATCH` | `/api/v1/admin/applications/**` | `ApplicationReviewController` |
| Bed/Room/Floor/Building | CRUD | `POST/PUT/DELETE` | `/api/v1/admin/beds/**` ... | `BedController`, `RoomController`, `FloorController`, `BuildingController` |
| CheckIn | Tra cứu và thực hiện Check-in | `GET/POST` | `/api/v1/admin/check-in/**` | `CheckInController` |
| CheckoutRequest | Duyệt/Từ chối | `PATCH` | `/api/v1/admin/checkouts/**` | `CheckoutRequestAdminController` |
| StayExtension | Duyệt/Từ chối | `PATCH` | `/api/v1/admin/extensions/**` | `StayExtensionAdminController` |
| FaceProfile | Duyệt/Từ chối/Thu hồi | `PATCH` | `/api/v1/admin/face/**` | `FaceAdminController` |
| SmartAccess - Emergency | Bật/Tắt khẩn cấp | `POST` | `/api/v1/access/emergency/**` | `EmergencyOverrideController` |
| SmartAccess - Remote Unlock | Mở cửa từ xa | `POST` | `/api/v1/access/gates/{gateId}/unlock` | `RemoteUnlockController` |
| SmartAccess - CurfewPolicy | CRUD | `POST/PUT/DELETE` | `/api/v1/access/curfew/**` | `CurfewPolicyController` |
| SmartAccess - TimeWindowPolicy | CRUD | `POST/PUT/DELETE` | `/api/v1/access/timewindow/**` | `TimeWindowPolicyController` |
| AccessHistory | Xem lịch sử | `GET` | `/api/v1/access/history/**` | `AccessHistoryController` |
| Dashboard | Xem tổng quan | `GET` | `/api/v1/admin/dashboard/**` | `RoomDashboardController` |
| Notification | Gửi thông báo chung | `POST` | `/api/v1/admin/notifications/**` | `AdminNotificationController` |
| Bill | Xem/Hủy | `GET/PATCH` | `/api/v1/admin/bills/**` | `BillController` (admin endpoint) |
| User | Quản lý tài khoản | `GET/POST/PATCH` | `/api/v1/admin/users/**` | `UserController` |

### Student APIs

| Resource | Action | Ownership Constraint | Evidence |
|---|---|---|---|
| Application | Nộp đơn, xem đơn của mình | Tự động lấy từ JWT | `ApplicationController` |
| Room | Xem thông tin phòng của mình | Từ JWT | `StudentRoomController` |
| Bill | Xem hóa đơn, xem QR thanh toán | Chỉ Bill của mình | `BillController`, `PaymentInstructionController` |
| FaceProfile | Upload/Xem ảnh của mình | Từ JWT | `FaceStudentController` |
| CheckoutRequest | Nộp đơn xin trả phòng | Từ JWT | `CheckoutRequestController` |
| StayExtension | Nộp đơn xin gia hạn | Từ JWT | `StayExtensionController` |
| Notification | Xem, đánh dấu đã đọc | Chỉ thông báo của mình | `NotificationController` |
| Issue Report | Gửi báo cáo hỏng hóc | Từ JWT (không truyền studentId) | `NotificationController.POST /issues` |
| Assignment Countdown | Xem thời hạn Assignment | Từ JWT | `StudentAssignmentCountdownController` |

### Public APIs (Không yêu cầu xác thực)

| Resource | Action | Evidence |
|---|---|---|
| Room | Xem danh sách phòng | `PublicRoomController` |
| PaymentInstruction | Xem hướng dẫn thanh toán | `PaymentInstructionController` |
| Auth | Đăng nhập, Refresh Token, Quên mật khẩu | `AuthController` |
| Registration | Xem đợt đăng ký đang mở | `RegistrationController` (public endpoint) |

### System/Webhook APIs

| Actor | Resource | Auth Mechanism | Evidence |
|---|---|---|---|
| SePay (Bank Gateway) | Cập nhật trạng thái Bill | API Key (Header) | `SepayWebhookController` |

### IoT APIs (ESP32)

| Resource | Action | Auth Mechanism | Evidence |
|---|---|---|---|
| SmartAccess | Xác thực RFID | Không yêu cầu JWT (Thin Client) | `IotVerificationController.POST /verify/card` |
| SmartAccess | Xác thực Face AI | Không yêu cầu JWT | `IotVerificationController.POST /verify/face` |
| FaceVerification | Gửi kết quả xác thực từ AI Server | Internal | `FaceInternalController.POST /internal/face-verifications` |

## Security Invariants
- Sinh viên không thể truyền `studentId` qua Payload/Path để thao tác dữ liệu của người khác. [Rule: BR-S01]
- IoT ESP32 được bảo vệ bằng cơ chế riêng biệt, không dùng JWT của User.
- Webhook SePay yêu cầu API Key riêng biệt, không phải JWT.
- Đối với hầu hết Admin APIs, `STAFF` và `ADMIN` dùng chung quyền truy cập (kiểm tra `SecurityConfig`).
- **ĐẶC BIỆT ĐỐI VỚI SMART ACCESS**: Sử dụng Granular Capabilities tĩnh ánh xạ từ Role trong `UserAccount.java`. 
  - `ADMIN` có toàn quyền bao gồm sửa Policy và Lockdown khẩn cấp. 
  - `STAFF` bị giới hạn chỉ xem lịch sử (`VIEW_ACCESS_HISTORY`) và mở cổng từ xa (`REMOTE_UNLOCK`).

## Related Documents
- [BUSINESS_RULES](./BUSINESS_RULES.md)
- [BUSINESS_GLOSSARY](./BUSINESS_GLOSSARY.md)
