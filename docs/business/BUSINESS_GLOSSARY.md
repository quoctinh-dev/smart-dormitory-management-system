# BUSINESS GLOSSARY

## Purpose
Định nghĩa tập trung các thuật ngữ nghiệp vụ (Ubiquitous Language) của SDMS. Mỗi thuật ngữ chỉ được định nghĩa tại đây. Các tài liệu khác tham chiếu, không định nghĩa lại.

## Scope
Toàn bộ thuật ngữ phản ánh trực tiếp từ Entity, Enum, DTO trong mã nguồn.

## Source of Truth
Tên Class (Entity, DTO, Enum) trong mã nguồn Java.

## Contents

### 1. Identity & Access

| Thuật ngữ | Định nghĩa | Evidence |
|---|---|---|
| **UserAccount** | Tài khoản đăng nhập hệ thống. Mỗi sinh viên có đúng 1 UserAccount. | Entity `UserAccount` |
| **Role** | Vai trò hệ thống: `STUDENT`, `STAFF`, `ADMIN`. | Enum `Role` |
| **AccountStatus** | Trạng thái tài khoản: `PENDING_ACTIVATION`, `ACTIVE`, `LOCKED`. | Enum `AccountStatus` |
| **JWT Token** | Token xác thực stateless. Mọi API bảo vệ đều yêu cầu Bearer Token hợp lệ. | `JwtAuthenticationFilter` |

### 2. Housing & Registration

| Thuật ngữ | Định nghĩa | Evidence |
|---|---|---|
| **RegistrationPeriod** | Đợt đăng ký nội trú do Admin mở/đóng. Sinh viên chỉ nộp đơn trong thời gian này. | Entity `RegistrationPeriod` |
| **DormitoryApplication** | Đơn đăng ký nội trú của sinh viên trong một RegistrationPeriod. | Entity `DormitoryApplication` |
| **ApplicationStatus** | Vòng đời đơn đăng ký: `PENDING`, `UNDER_REVIEW`, `REQUEST_REVISION`, `WAITING_PAYMENT`, `APPROVED`, `REJECTED`, `WAITING_LIST`, `EXPIRED`. | Enum `ApplicationStatus` |
| **Building** | Tòa nhà KTX. Hiện hệ thống triển khai với 1 tòa nhà. | Entity `Building` |
| **Floor** | Tầng trong tòa nhà. | Entity `Floor` |
| **Room** | Phòng trong một tầng. | Entity `Room` |
| **Bed** | Đơn vị lưu trú nhỏ nhất (1 giường = 1 sinh viên). | Entity `Bed` |
| **BedStatus** | Trạng thái giường: `AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE`, `BLOCKED`. | Enum `BedStatus` |
| **StudentHousingAssignment** | Giao dịch gán sinh viên vào giường cụ thể trong một khoảng thời gian. Đây là quyền lưu trú chính thức. | Entity `StudentHousingAssignment` |
| **AssignmentStatus** | Vòng đời Assignment: `RESERVED`, `PENDING_CHECKIN`, `OCCUPIED`, `CHECKED_OUT`, `CANCELLED`, `EXPIRED`. | Enum `AssignmentStatus` |
| **StayExtension** | Đơn xin gia hạn thời gian lưu trú. | Entity `StayExtension` |
| **ExtensionStatus** | Trạng thái gia hạn: `PENDING`, `APPROVED`, `REJECTED`. | Enum `ExtensionStatus` |
| **CheckoutRequest** | Đơn xin trả phòng trước hạn. | Entity `CheckoutRequest` |
| **CheckoutStatus** | Trạng thái trả phòng: `PENDING`, `APPROVED`, `REJECTED`. | Enum `CheckoutStatus` |

### 3. Financial

| Thuật ngữ | Định nghĩa | Evidence |
|---|---|---|
| **Bill** | Hóa đơn yêu cầu thanh toán. Một sinh viên có thể có nhiều Bill theo thời gian. | Entity `Bill` |
| **BillType** | Loại hóa đơn: `APPLICATION_FEE`, `ACCOMMODATION_FEE`, `ELECTRIC_FEE`, `WATER_FEE`, `PENALTY_FEE`, `DEPOSIT_FEE`. | Enum `BillType` |
| **BillStatus** | Trạng thái hóa đơn: `UNPAID`, `PARTIALLY_PAID`, `PAID`, `OVERDUE`, `CANCELLED`. | Enum `BillStatus` |
| **Payment** | Một lần ghi nhận giao dịch thanh toán. Quan hệ N-1 với Bill. | Entity `Payment` |
| **PaymentStatus** | Trạng thái giao dịch: `PENDING`, `SUCCESS`, `FAILED`, `EXPIRED`, `REFUNDED`. | Enum `PaymentStatus` |
| **PaymentMethod** | Phương thức thanh toán (Bank Transfer, QR Code...). | Enum `PaymentMethod` |
| **ElectricityUsage** | Bản ghi chỉ số điện (đầu kỳ, cuối kỳ, tổng kWh) cho một phòng trong một tháng. | Entity `ElectricityUsage` (thuộc `payment` module) |
| **SePay Webhook** | Cơ chế đối soát thanh toán tự động từ cổng ngân hàng. | `SepayWebhookController` |

### 4. Smart Access & IoT

| Thuật ngữ | Định nghĩa | Evidence |
|---|---|---|
| **FaceProfile** | Hồ sơ lưu ảnh khuôn mặt gốc của sinh viên. Chỉ 1 profile active/sinh viên. | Entity `FaceProfile` |
| **FaceProfileStatus** | Vòng đời: `PENDING`, `APPROVED`, `REJECTED`, `REVOKED`. | Enum `FaceProfileStatus` |
| **FaceEmbedding** | Vector 512 chiều trích xuất từ ảnh gốc (InceptionResnetV1), lưu dạng `pgvector`. Dùng để AI đối chiếu. | Entity `FaceEmbedding`, Migration `V22_01` |
| **FaceVerificationAttempt** | Lịch sử một lần thử xác thực khuôn mặt tại cổng. | Entity `FaceVerificationAttempt` |
| **CurfewPolicy** | Chính sách giới nghiêm: quy định giờ cấm ra/vào. Loại: `STRICT` (chặn cứng), `SOFT_WARNING` (cảnh báo). | Entity `CurfewPolicy`, Enum `CurfewType` |
| **TimeWindowPolicy** | Chính sách khung giờ cổng hoạt động (mở/đóng theo lịch). | Entity `TimeWindowPolicy` |
| **AccessHistory** | Lịch sử ra vào cổng: ai, cổng nào, thời điểm nào, kết quả gì. | Entity `AccessHistory` |
| **AccessDecision** | Kết quả trả về cho ESP32: `GRANTED` (mở cửa), `DENIED` (từ chối). | Enum `AccessDecision` |
| **VerificationMethod** | Phương thức xác minh danh tính: `FACE_AI`, `RFID`, `MANUAL_OVERRIDE`, `REMOTE_UNLOCK`. | Enum `VerificationMethod` |
| **OverrideType** | Loại ghi đè khẩn cấp: `REMOTE_UNLOCK`, `FIRE_EMERGENCY`, `SECURITY_LOCKDOWN`. | Enum `OverrideType` |
| **Emergency Override** | Chế độ khẩn cấp, ghi đè mọi chính sách, luôn trả về `GRANTED`. | `EmergencyOverrideController`, `EmergencyOverrideService` |

### 5. Operations & Others

| Thuật ngữ | Định nghĩa | Evidence |
|---|---|---|
| **Notification** | Thông báo nội bộ (In-App). Được lưu trong DB và đẩy tới sinh viên. | Entity `Notification`, `NotificationController` |
| **NotificationType** | Phân loại thông báo: `AUTH`, `APPLICATION`, `PAYMENT`, `FACE`, `ROOM`, `SMART_ACCESS`, `SYSTEM`, `WARNING`, `ANNOUNCEMENT`. | Enum `NotificationType` |
| **Issue Report** | Báo cáo hỏng hóc hoặc sự cố do sinh viên gửi lên Ban quản lý KTX. Được đóng gói như một Notification đặc biệt. | `IssueReportRequest`, `NotificationController.POST /issues` |

## Evidence
- Migrations: `V1` đến `V35`
- Entities: `DormitoryApplication`, `StudentHousingAssignment`, `Bill`, `Payment`, `FaceProfile`, `AccessHistory`
- Enums: Toàn bộ file `*.java` trong các thư mục `enums/` của từng module

## Related Documents
- [BUSINESS_DOMAIN_SPECIFICATION](./BUSINESS_DOMAIN_SPECIFICATION.md)
- [STATE_MACHINES](./STATE_MACHINES.md)
