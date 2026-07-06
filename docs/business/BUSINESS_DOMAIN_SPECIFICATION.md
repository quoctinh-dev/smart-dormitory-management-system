# BUSINESS DOMAIN SPECIFICATION

## Purpose
Định nghĩa bức tranh toàn cảnh về nghiệp vụ, phân chia các Bounded Context và Core Business Capabilities của dự án SDMS.

## Scope
Ranh giới nghiệp vụ ở cấp độ module. Không đi sâu vào quy tắc hay trạng thái chi tiết.

## Source of Truth
Package structure `com.sdms.backend.modules`, Database Migration (Flyway), Entities.

## Contents

### 1. Bounded Contexts
Hệ thống SDMS chia thành 6 Bounded Contexts chính:

| # | Context | Module(s) | Trách nhiệm |
|---|---|---|---|
| 1 | **Identity & Access** | `user`, `auth` | Quản lý tài khoản, vai trò, xác thực JWT |
| 2 | **Housing & Registration** | `registration`, `application`, `room`, `student` | Đăng ký lưu trú, xét duyệt, xếp phòng, gia hạn, trả phòng |
| 3 | **Financial** | `payment` | Hóa đơn, thanh toán, ghi nhận số điện, đối soát webhook |
| 4 | **Smart Access** | `smartaccess`, `face` | Kiểm soát ra vào, nhận diện AI, tích hợp ESP32 |
| 5 | **Operation** | `notification` | Thông báo hệ thống, tiếp nhận báo cáo sự cố |
| 6 | **Infrastructure** | `upload` | Upload file ảnh lên Cloudinary |

### 2. Business Domains & Aggregate Roots

| Domain | Aggregate Roots & Entities |
|---|---|
| **User** | `UserAccount`, `Student` |
| **Registration** | `RegistrationPeriod`, `DormitoryApplication`, `ApplicationPriority` |
| **Housing** | `Building`, `Floor`, `Room`, `Bed`, `StudentHousingAssignment` |
| **Lifecycle** | `StayExtension`, `CheckoutRequest` |
| **Financial** | `Bill`, `Payment`, `ElectricityUsage` |
| **Smart Access** | `CurfewPolicy`, `TimeWindowPolicy`, `AccessHistory` |
| **Face Recognition** | `FaceProfile`, `FaceEmbedding`, `FaceVerificationAttempt` |

### 3. Business Capabilities

| Capability | Mô tả |
|---|---|
| **Registration** | Mở/đóng đợt đăng ký, kiểm tra điều kiện, nộp và duyệt hồ sơ |
| **Housing** | Xếp giường tự động, Check-in thủ công tại quầy |
| **Financial** | Sinh hóa đơn (nhiều loại), tính tiền điện tự động, đối soát Webhook SePay |
| **Smart Access** | Xác thực RFID/Face AI, đánh giá chính sách, mở cửa từ xa, khẩn cấp |
| **Face AI** | Upload ảnh, trích xuất Vector, duyệt/từ chối/thu hồi |
| **Lifecycle** | Gia hạn lưu trú, trả phòng sớm |
| **Operation** | Gửi thông báo, tiếp nhận Issue Report từ sinh viên |

### 4. Roles trong hệ thống
- **STUDENT:** Sinh viên cư trú tại KTX.
- **STAFF:** Nhân viên ban quản lý (xử lý đơn, quản lý phòng).
- **ADMIN:** Quản trị viên hệ thống (cấu hình, quản lý nhân sự).
- **SYSTEM:** Tiến trình tự động (Scheduler, Job, Webhook).
- **IOT:** Thiết bị ESP32 (Thin Client, không có Role JWT).

Evidence: Enum `Role` (`STUDENT`, `STAFF`, `ADMIN`).

### 5. Business Constraints
- Mỗi sinh viên chỉ có tối đa 1 `Assignment` trạng thái `OCCUPIED` tại một thời điểm.
- Không được cấp quyền mở cửa nếu `FaceProfile` chưa `APPROVED`.
- `Assignment` bị `EXPIRED` nếu sinh viên không thanh toán trong 3 ngày.
- Giường phải ở trạng thái `AVAILABLE` trước khi được gán cho sinh viên.

## Evidence
- `src/main/java/com/sdms/backend/modules/`
- Entities: `DormitoryApplication`, `StudentHousingAssignment`, `Bill`, `Payment`, `FaceProfile`, `AccessHistory`
- Enums: `Role`, `AssignmentStatus`, `BillStatus`, `FaceProfileStatus`
- Migrations: `V1` đến `V35`

## Related Documents
- [BUSINESS_GLOSSARY](./BUSINESS_GLOSSARY.md)
- [BUSINESS_WORKFLOWS](./BUSINESS_WORKFLOWS.md)
- [PERMISSION_MATRIX](./PERMISSION_MATRIX.md)
