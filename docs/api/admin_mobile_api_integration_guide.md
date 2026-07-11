# ADMIN MOBILE APP INTEGRATION GUIDE (SMART DORMITORY)

Tài liệu này cung cấp danh sách các API Endpoints hiện có ở Backend (Spring Boot) dành riêng cho ứng dụng Mobile của **Ban Quản Lý (Admin/Manager)**. Các lập trình viên Mobile có thể dựa vào đây để tích hợp chức năng "Tiện ích di động" cho Admin.

---

## 1. Xác thực (Authentication)
*   **Login Admin:**
    *   `POST /api/v1/auth/login`
    *   *Mô tả:* Đăng nhập bằng tài khoản Admin/Manager, nhận về JWT Token. Mọi API bên dưới đều yêu cầu header `Authorization: Bearer <TOKEN>`.

---

## 2. Tiện ích Điều khiển Cửa thông minh (Smart Access & IoT)
Đây là các tính năng "cầm tay" cực kỳ hữu ích cho Admin khi đi tuần tra hoặc xử lý sự cố.

*   **Mở khóa cửa từ xa (Remote Unlock):**
    *   `POST /api/v1/admin/smart-access/remote-unlock` *(hoặc endpoint tương ứng trong RemoteUnlockController)*
    *   *Mô tả:* Admin có thể mở cửa phòng bất kỳ bằng điện thoại (ví dụ khi sinh viên quên thẻ/chưa cài khuôn mặt mà cần vào phòng khẩn cấp).
    *   *Tham số:* `deviceId` hoặc `roomId`.

*   **Kích hoạt khẩn cấp (Emergency Override):**
    *   `POST /api/v1/admin/smart-access/emergency-open` *(hoặc endpoint trong EmergencyOverrideController)*
    *   *Mô tả:* Nút bấm đỏ khẩn cấp (PCCC), mở toàn bộ cửa sổ/cửa chính trong một tòa nhà hoặc toàn KTX.

---

## 3. Duyệt Đơn Từ Nhanh (Quick Approvals)
Giúp Admin duyệt đơn ngay trên điện thoại mà không cần mở máy tính.

*   **Duyệt khuôn mặt sinh viên (Face Approval):**
    *   `GET /api/v1/admin/faces/pending`: Xem danh sách khuôn mặt chờ duyệt.
    *   `POST /api/v1/admin/faces/{id}/approve`: Chấp nhận hình ảnh khuôn mặt.
    *   `POST /api/v1/admin/faces/{id}/reject`: Từ chối yêu cầu chụp lại.

*   **Duyệt đơn trả phòng (Checkout Management):**
    *   `GET /api/v1/admin/checkout-requests`: Xem danh sách đơn xin trả phòng.
    *   `POST /api/v1/admin/checkout-requests/{id}/approve`: Duyệt đơn trả phòng (kèm biên bản kiểm kê tài sản).

*   **Duyệt đơn xin ở lại/gia hạn (Stay Extension):**
    *   `GET /api/v1/admin/extensions`: Xem danh sách xin gia hạn dịp hè/lễ.
    *   `POST /api/v1/admin/extensions/{id}/review`: Phê duyệt hoặc từ chối đơn gia hạn.

---

## 4. Quản lý Phòng & Check-in (Room & Check-in Utilities)
*   **Check-in nhanh (Quét mã):**
    *   `POST /api/v1/admin/check-in` *(hoặc trong CheckInController)*
    *   *Mô tả:* Admin cầm điện thoại quét mã QR của sinh viên hoặc chọn tên sinh viên để thực hiện Check-in vào phòng, ghi nhận thời điểm sinh viên chính thức dọn vào KTX.

---

## 5. Phát loa / Thông báo (Global Broadcaster)
*   **Gửi thông báo nhanh:**
    *   `POST /api/v1/admin/notifications`
    *   *Mô tả:* Soạn một thông báo khẩn (ví dụ: "Sắp cúp điện tòa A") và bắn Push Notification ngay lập tức đến App của tất cả sinh viên tòa A.
