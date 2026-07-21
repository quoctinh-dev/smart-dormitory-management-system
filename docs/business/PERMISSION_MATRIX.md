# SDMS - MA TRẬN PHÂN QUYỀN (RBAC) VÀ BẢO MẬT IOT

## 1. Mục đích
Tài liệu này xác định rõ ràng Ma trận phân quyền (Role-Based Access Control - RBAC) cuối cùng của Hệ thống Quản lý Ký túc xá Thông minh (SDMS). Tài liệu này được cập nhật sau đợt rà soát toàn diện giữa Backend (Spring Security) và Frontend (React UI), đảm bảo tính nhất quán 100% giữa giao diện hiển thị và quyền truy cập API thực tế.
Đồng thời, tài liệu quy định rõ cơ chế bảo mật dành cho các thiết bị IoT (ESP32, Camera AI).

## 2. Các Vai trò (Roles) trong Hệ thống

1. **ADMIN (Quản trị viên cấp cao):** Toàn quyền kiểm soát hệ thống, bao gồm các chức năng cốt lõi như thiết lập đợt đăng ký, quản lý cấu hình hệ thống, xem báo cáo tổng quan và gửi thông báo toàn trường.
2. **STAFF (Nhân viên / Lễ tân):** Quyền vận hành hàng ngày. Được phép thao tác với Sinh viên, duyệt hồ sơ lưu trú, duyệt khuôn mặt, thu tiền mặt, chốt điện nước, và điều khiển mở cửa từ xa. Bị cấm truy cập các tính năng mang tính thay đổi hệ thống.
3. **STUDENT (Sinh viên):** Quyền tự phục vụ (Self-service). Chỉ được phép xem và thao tác trên dữ liệu của chính mình (Hóa đơn, Hồ sơ đăng ký, Khai báo khuôn mặt). Không được phép giả mạo `studentId` của người khác.
4. **IOT_DEVICE (Thiết bị Cổng / Camera):** Quyền của các thiết bị phần cứng để giao tiếp với Backend mà không cần tương tác của con người.

---

## 3. Ma Trận Phân Quyền Các Module Core (Web App)

Dưới đây là chi tiết quyền hạn giữa `ADMIN` và `STAFF` sau khi đã được rà soát đồng bộ:

| Module / Tính năng | ADMIN | STAFF | Ghi chú (Security Mechanism) |
| :--- | :---: | :---: | :--- |
| **Dashboard (Thống kê)** | ✅ | ❌ | API `@PreAuthorize("hasRole('ADMIN')")`, Menu UI khóa với `['ADMIN']` |
| **Quản lý Đợt đăng ký & Danh sách đủ điều kiện** | ✅ | ❌ | Bị khóa hoàn toàn với STAFF để tránh sửa đổi thời gian đăng ký. |
| **Quản lý Tài khoản (User)** | ✅ | ❌ | Chỉ Admin được cấp/xóa tài khoản, phân quyền. |
| **Thông báo hệ thống (Broadcast Notification)** | ✅ | ❌ | STAFF không được phép spam thông báo đẩy toàn trường/KTX. |
| **Kiểm duyệt Hồ sơ đăng ký (Applications)** | ✅ | ✅ | Cả hai role đều được xử lý duyệt/từ chối đơn đăng ký lưu trú. |
| **Sinh viên, Giường, Phòng (Rooms & Students)** | ✅ | ✅ | Quyền vận hành hàng ngày của Lễ tân KTX. |
| **Gia hạn & Trả phòng (Check-out & Extension)** | ✅ | ✅ | Lễ tân được quyền tiếp nhận và duyệt đơn trả phòng/gia hạn. |
| **Xác nhận Thu tiền mặt (Cash Payment)** | ✅ | ✅ | Lễ tân được quyền click "Thu tiền mặt" trên hệ thống (Đã đồng bộ API). |
| **Chốt chỉ số Điện/Nước (Utility Readings)** | ✅ | ✅ | Lễ tân được quyền chốt số định kỳ hàng tháng. |
| **Kiểm duyệt Khuôn mặt (Face Verification)** | ✅ | ✅ | Lễ tân trực tiếp đối chiếu ảnh chụp và CCCD của sinh viên. |
| **Check-in Nhận phòng** | ✅ | ✅ | Thao tác cấp giường thực tế tại quầy lễ tân. |

*(Sinh viên (STUDENT) có bộ API tách biệt hoàn toàn và chỉ bị giới hạn truy cập thông qua JWT Token của chính họ, không thể chạm vào các API trên)*.

---

## 4. Cơ chế Bảo mật IOT & Smart Access

Các thiết bị phần cứng (ESP32, Camera, Khóa từ) không thể đăng nhập qua giao diện để lấy thẻ `JWT Token`. Do đó, hệ thống sử dụng cơ chế bảo mật kết hợp giữa **Whitelist API** và **Hardware API Key**.

### 4.1. Khai báo Public Endpoints
Trong `SecurityConfig.java`, các luồng giao tiếp IoT được cấu hình đưa vào `PUBLIC_ENDPOINTS` để vượt qua bộ lọc JWT:
- `/api/v1/internal/**`: Các API giao tiếp nội bộ cho Cổng AI xác thực khuôn mặt (`FaceInternalController`).
- `/api/v1/smartaccess/**`: Các API liên quan đến khóa và nhận diện cửa thông minh.

### 4.2. API Key (Header Authentication)
Dù vượt qua JWT, nhưng ở cấp độ Controller, hệ thống vẫn kiểm tra danh tính thiết bị thông qua các Custom Headers.

| Endpoint (IoT) | Giao thức | Header yêu cầu | Chức năng |
| :--- | :--- | :--- | :--- |
| `/api/v1/internal/face-verifications` | HTTP POST | `X-Gate-Device-Id` | Camera AI nhận diện khuôn mặt gửi ảnh lên Backend để đối chiếu. |
| `/api/v1/smartaccess/verify/card` | HTTP POST | `X-Device-Id` / API Key | Máy quẹt thẻ RFID (ESP32) gửi mã thẻ (UID) lên xác thực. |
| `/api/v1/smartaccess/verify/face` | HTTP POST | `X-Device-Id` / API Key | Máy quét khuôn mặt offline gửi tín hiệu mở cửa (nếu xử lý tại edge). |

**Quy trình xử lý an toàn của IoT:**
1. Thiết bị gửi Request kèm `X-Gate-Device-Id` (Ví dụ: `GATE-A-01`).
2. Spring Security bỏ qua check JWT nhờ cấu hình `PUBLIC_ENDPOINTS`.
3. Controller tiếp nhận, truy vấn Database xem thiết bị có mã `GATE-A-01` có tồn tại và đang "Active" hay không.
4. Nếu thiết bị hợp lệ, xử lý logic mở cửa (hoặc ghi log).
5. Nếu thiết bị giả mạo / mã sai, trả về HTTP 403 Forbidden hoặc 401 Unauthorized.

### 4.3. Quyền điều khiển Cửa của Nhân sự (Admin / Staff)
Với tính năng Cửa thông minh trên Web Admin (`Smart Access Management`), quyền được chia nhỏ theo **Granular Capabilities** (trong `SmartAccessPermissions`):
- **ADMIN:** Có toàn quyền, bao gồm `EMERGENCY_LOCKDOWN` (Mở cửa/Khóa cửa toàn bộ KTX khi hỏa hoạn/bạo loạn) và sửa đổi `Curfew Policy` (Giờ giới nghiêm).
- **STAFF:** Bị giới hạn ở quyền `VIEW_ACCESS_HISTORY` (Xem nhật ký ra vào) và `REMOTE_UNLOCK` (Nhấn nút trên web để mở một cửa cụ thể cho khách/sinh viên quên thẻ).

---

## 5. Webhooks & API Công khai

| Endpoint | Chức năng | Cơ chế bảo mật |
| :--- | :--- | :--- |
| `/api/webhooks/sepay` | SePay báo có biến động số dư ngân hàng | Không dùng JWT, được khai báo Public, sử dụng mã hóa HMAC/Chữ ký số theo chuẩn ngân hàng. |
| `/api/v1/public/payment-instructions` | Lấy QR thanh toán | Không dùng JWT (Public), để sinh viên chưa có tài khoản vẫn chuyển khoản được. |
| `/api/v1/auth/**` | Đăng nhập / Quên mật khẩu | Không dùng JWT (Public). |

## 6. Lời kết
Thiết kế kiến trúc bảo mật của SDMS áp dụng triệt để nguyên lý **Least Privilege (Quyền hạn tối thiểu)** ở mọi cấp độ (UI, Controller, Service) và mọi đối tượng (Con người, Thiết bị IoT). Mọi lỗ hổng phân quyền giữa Frontend và Backend đã được khắc phục hoàn toàn.
