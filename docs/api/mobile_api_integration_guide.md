# MOBILE APP INTEGRATION GUIDE (SMART DORMITORY)

Tài liệu này cung cấp danh sách các API Endpoints hiện có ở Backend (Spring Boot) dành riêng cho ứng dụng Mobile (Student App). Các lập trình viên Mobile (Flutter/React Native) có thể dựa vào đây để tích hợp chức năng cho sinh viên.

---

## 1. Xác thực & Tài khoản (Authentication)
Tất cả các API (ngoại trừ Login) đều yêu cầu gửi kèm Header: `Authorization: Bearer <JWT_TOKEN>`

*   **Login Sinh viên:**
    *   `POST /api/v1/auth/login`
    *   *Mô tả:* Trả về JWT Token để sử dụng cho các request sau.

*   **Hồ sơ sinh viên:**
    *   `GET /api/v1/students/me`: Lấy thông tin cá nhân của sinh viên đang đăng nhập.
    *   `PATCH /api/v1/students/me`: Cập nhật thông tin hồ sơ (chỉ các trường được phép).

---

## 2. Tiện ích Smart Access (Nhận diện khuôn mặt)
Sinh viên tự chụp ảnh khuôn mặt qua App để đăng ký mở cửa tự động.

*   **Đăng ký khuôn mặt mới:**
    *   `POST /api/v1/students/me/face`
    *   *Content-Type:* `multipart/form-data`
    *   *Body:* `file` (MultipartFile)
    *   *Mô tả:* Upload ảnh khuôn mặt lên hệ thống. Trạng thái ban đầu sẽ là `PENDING` chờ Admin duyệt.
    *   *Header bắt buộc bổ sung:* `X-Student-Id: <UUID>`

*   **Yêu cầu đổi ảnh (Khi ảnh cũ bị lỗi/Không nhận diện được):**
    *   `POST /api/v1/students/me/face/replacements`
    *   *Content-Type:* `multipart/form-data`
    *   *Body:* `file` (MultipartFile)

*   **Xem trạng thái khuôn mặt:**
    *   `GET /api/v1/students/me/face`
    *   *Mô tả:* Trả về chi tiết trạng thái (Đã duyệt, Đang chờ, Bị từ chối).

*   **Lịch sử quét khuôn mặt:**
    *   `GET /api/v1/students/me/face/verifications`
    *   *Mô tả:* Xem lại lịch sử các lần ra vào cửa/quét mặt.

---

## 3. Tiện ích Gửi Yêu Cầu (Requests)
Sinh viên có thể gửi các đơn từ trực tuyến ngay trên App thay vì xuống văn phòng ban quản lý.

*   **Yêu cầu Trả phòng (Checkout):**
    *   `POST /api/v1/students/checkout-requests`: Nộp đơn xin trả phòng.
    *   `GET /api/v1/students/checkout-requests`: Xem danh sách và trạng thái các đơn đã nộp.

*   **Yêu cầu Gia hạn lưu trú (Stay Extension):**
    *   `POST /api/v1/students/extensions`: Nộp đơn xin ở thêm vào học kỳ tới/dịp hè.
    *   `GET /api/v1/students/extensions/my-application`: Xem trạng thái đơn gia hạn của bản thân.

---

## 4. Thanh toán & Hóa đơn (Payments)
*(Các API tương ứng từ Payment/Bill module)*
*   **Xem danh sách hóa đơn (Điện nước, Phí phòng):**
    *   `GET /api/v1/payments/my-bills` (Hoặc endpoint tương ứng trong `BillController`)
    *   *Mô tả:* Trả về danh sách hóa đơn chưa thanh toán. Sinh viên có thể tạo mã QR tích hợp Sepay để thanh toán chuyển khoản tự động.

---

## 5. Thông báo (Notifications)
Sinh viên nhận các thông báo đẩy từ Ban quản lý (tiền điện nước, cảnh báo vi phạm giới nghiêm...).

*   **Lấy danh sách thông báo:**
    *   `GET /api/v1/notifications` (Hoặc endpoint tương ứng trong `NotificationController`)
    *   *Mô tả:* Trả về lịch sử thông báo của sinh viên (bao gồm trạng thái chưa đọc/đã đọc).

---
> **Lưu ý cho Mobile Developer:** Hệ thống Backend trả về cấu trúc chuẩn (Standard Response) cho mọi API theo định dạng:
> ```json
> {
>   "success": true,
>   "message": "Nộp đơn xin trả phòng thành công",
>   "data": { ... }
> }
> ```
