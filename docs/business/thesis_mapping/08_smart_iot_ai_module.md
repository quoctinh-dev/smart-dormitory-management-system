# PHÂN TÍCH CỤM MODULE IOT & AI (SMART ACCESS & FACE RECOGNITION) – LUẬN VĂN SDMS
> Cập nhật: 09/07/2026 | Đã quét code thực tế | Phù hợp THESIS_DEPTH_RULE

---

## Chương 1: Giới thiệu

### 1.1. Đặt vấn đề, mục tiêu
- **Đặt vấn đề:** Việc điểm danh và quản lý giờ giới nghiêm KTX truyền thống dựa vào bảo vệ, dễ xảy ra sai sót, gian lận và không thể kiểm soát 24/7.
- **Mục tiêu:** Ứng dụng IoT (ESP32) và AI (Face Recognition) để tự động hóa việc đóng mở cổng, ghi nhận lịch sử ra vào và đối chiếu với chính sách giới nghiêm (Curfew Policy).

### 1.2. Thách thức kỹ thuật và nghiệp vụ
| Thách thức | Giải pháp áp dụng (Đã triển khai) |
|---|---|
| Lịch sử ra vào bị sửa đổi | Thực thể `AccessHistory` thiết kế theo chuẩn **Immutable (Bất biến)**. Không kế thừa `BaseEntity`, không cho phép update hay soft delete. |
| Độ trễ khi AI xác thực | Thiết kế API `verifyFace` đồng bộ (sync) nhưng tách biệt engine AI ra service riêng biệt (`FaceVerificationService`) giúp trả kết quả tức thời cho Relay ESP32 đóng/mở. |
| Mất mạng (Offline Fallback) | Cung cấp API `rfid-whitelist` để Gateway (ESP32) tải danh sách thẻ cục bộ về xử lý khi mất mạng. |

---

## Chương 2: Thiết kế hệ thống và Kiến trúc (Kiến trúc Hexagonal)

### 2.1. Module SmartAccess (Kiến trúc tổ ong)
Khác với các module khác dùng MVC truyền thống, module `SmartAccess` được thiết kế theo **Hexagonal Architecture** (Ports and Adapters).
- `api`: Giao diện REST (Adapters).
- `application`: Chứa các Use Case (AccessEvaluationService).
- `domain`: Chứa logic nghiệp vụ thuần túy (CurfewPolicy, TimeWindowPolicy).
- `infrastructure`: Giao tiếp DB (Repositories).
*-> Chứng minh khả năng áp dụng nhiều mẫu kiến trúc phức tạp trong cùng một Monorepo (Luận văn xuất sắc).*

### 2.2. Xử lý chính sách giới nghiêm (Curfew Policy)
Hệ thống không chỉ đóng/mở cửa mà còn đánh giá (Evaluate) logic:
1. Nhận dạng sinh viên (Qua Face AI hoặc RFID).
2. Lấy `buildingId` và `residentType` của sinh viên.
3. So khớp với bảng `curfew_policies` (vd: Sinh viên năm nhất phải về trước 23:00).
4. Đưa ra quyết định: `GRANTED` hoặc `DENIED` và ghi vào `AccessHistory`.

### 2.3. Sự kiện IdentityVerifiedEvent
Để không làm nghẽn luồng đóng mở cửa, thay vì ghi log trực tiếp, hệ thống sử dụng Event-Driven:
`IotVerificationController -> Bắn IdentityVerifiedEvent -> Listener bắt sự kiện -> Ghi AccessHistory`.

---

## Chương 3: API Permission Matrix (Bảo mật truy cập)

### 3.1. Truy xuất Lịch sử và Chính sách (AccessHistory / CurfewPolicy)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| GET | `/history/me` | `hasRole('STUDENT')` | SV xem lịch sử cá nhân (chống IDOR). |
| GET | `/history` | `hasAuthority('VIEW_ACCESS_HISTORY')` | Admin/Staff xem toàn bộ. |
| POST | `/curfew-policies`| `hasAuthority('MANAGE_CURFEW_POLICY')` | Chỉ Admin được sửa chính sách. |
*(Hệ thống sử dụng Granular Capabilities - Quyền hạn hạt nhỏ - chứng tỏ độ sâu bảo mật).*

### 3.2. Cổng giao tiếp phần cứng (IoT & AI Internal)
| Method | Endpoint | PreAuthorize / Security | Mô tả |
|--------|----------|-----------------------|-------|
| POST | `/verify/card` | **Public** (⚠️ Xem mục 4.1) | ESP32 gọi xác thực thẻ. |
| POST | `/verify/face` | **Public** (⚠️ Xem mục 4.1) | ESP32 gọi xác thực khuôn mặt. |
| POST | `/internal/face` | **Public** (⚠️ Xem mục 4.1) | Giao tiếp nội bộ Module Face. |

---

## Chương 4: Đánh giá chất lượng và Nợ kỹ thuật (Technical Debt)

### 4.1. Technical Debt (Bảo mật Thiết bị IoT)
Hiện tại, các endpoint kết nối trực tiếp với ESP32 (`IotVerificationController`) và Camera AI (`FaceInternalController`) đang để ở trạng thái **Public**.
- **Nguy cơ:** Kẻ gian có thể giả mạo request POST bằng Postman để mở cổng từ xa nếu biết `gateId` và `rfid`.
- **Giải pháp trong tương lai (Roadmap):** Bổ sung **HMAC Signature** hoặc `X-API-Key` (Shared Secret Key) giữa ESP32 và Spring Boot tương tự như cách bảo vệ Webhook SePay. Không sử dụng JWT vì thiết bị IoT không đăng nhập như người dùng.

### 4.2. Immutable Audit Log
Bảng `AccessHistory` được thiết kế cực chuẩn cho lưu vết an ninh: Không kế thừa `BaseEntity`, không có API cho phép `PUT`, `PATCH` hay `DELETE`. Log an ninh là bất biến (Immutable). Đây là điểm bảo vệ cực tốt trong phần biện luận phản biện luận văn.
