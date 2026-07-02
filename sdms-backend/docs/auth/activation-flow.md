# Luồng Kích hoạt Tài khoản
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này mô tả chi tiết quy trình nghiệp vụ và các bước kỹ thuật cho việc kích hoạt tài khoản lần đầu của sinh viên.

---

## 1. Bối cảnh nghiệp vụ

Khi một sinh viên nộp đơn, được chấp thuận và hoàn tất thanh toán, hệ thống cần cung cấp một tài khoản để họ có thể đăng nhập vào ứng dụng di động và sử dụng các tiện ích của KTX (như đăng ký khuôn mặt, xem hóa đơn, v.v.).

Để đảm bảo an toàn, tài khoản này không được kích hoạt ngay lập tức. Thay vào đó, nó được tạo ra ở trạng thái "Chờ kích hoạt" và yêu cầu sinh viên phải thực hiện một bước xác minh cuối cùng.

## 2. Quy trình End-to-End

1.  **Tạo tài khoản (Account Provisioning):**
    *   **Sự kiện kích hoạt:** Sau khi thanh toán thành công, module `Payment` phát ra sự kiện `PaymentSuccessEvent`.
    *   **Xử lý sự kiện:**
        1.  Module `Student` lắng nghe sự kiện này và tạo một bản ghi `Student` mới từ thông tin trong đơn đăng ký.
        2.  Sau khi tạo `Student` thành công, module `Student` tiếp tục phát sự kiện `StudentCreatedEvent`.
        3.  Module `User` (thuộc `Auth`) lắng nghe sự kiện `StudentCreatedEvent` và tiến hành tạo một bản ghi `UserAccount` mới.
    *   **Trạng thái ban đầu của `UserAccount`:**
        *   `email`: Lấy từ đơn đăng ký.
        *   `password`: Được mã hóa từ số CCCD của sinh viên (đóng vai trò là mật khẩu tạm thời).
        *   `status`: `PENDING_ACTIVATION` (Chờ kích hoạt).
        *   `role`: `STUDENT`.

2.  **Sinh viên kích hoạt:**
    *   **Giao diện:** Sinh viên mở ứng dụng di động và truy cập vào màn hình "Kích hoạt tài khoản".
    *   **Thông tin yêu cầu:**
        *   Email đã đăng ký.
        *   Mật khẩu tạm thời (chính là số CCCD).
        *   Mật khẩu mới.
        *   Xác nhận mật khẩu mới.
    *   **API Endpoint:** `POST /api/v1/auth/activate`

3.  **Xử lý phía Backend (`AuthService.activateAccount`):**
    *   **Bước 1: Tìm tài khoản:** Tìm `UserAccount` dựa trên `email` cung cấp. Nếu không tìm thấy, trả về lỗi.
    *   **Bước 2: Kiểm tra trạng thái:** Xác minh tài khoản đang ở trạng thái `PENDING_ACTIVATION`. Nếu không, trả về lỗi (ví dụ: "Tài khoản đã được kích hoạt" hoặc "Tài khoản không hợp lệ").
    *   **Bước 3: Xác thực mật khẩu tạm thời:** So sánh `password` (CCCD) người dùng nhập với mật khẩu đã mã hóa trong cơ sở dữ liệu. Nếu sai, trả về lỗi.
    *   **Bước 4: Cập nhật tài khoản:**
        *   Mã hóa và cập nhật `password` mới cho người dùng.
        *   Chuyển `status` từ `PENDING_ACTIVATION` thành `ACTIVE`.
    *   **Bước 5: Trả về thành công:** Gửi thông báo kích hoạt thành công. Từ thời điểm này, sinh viên có thể đăng nhập bằng mật khẩu mới.

## 4. Đối chiếu với mã nguồn

*   **Tạo tài khoản:** Logic lắng nghe sự kiện `StudentCreatedEvent` được tìm thấy trong lớp `com.sdms.backend.modules.user.event.StudentCreatedEventListener`. Logic này khớp với mô tả.
*   **Xử lý kích hoạt:** Logic xử lý được tìm thấy trong `com.sdms.backend.modules.auth.service.AuthService.activateWithToken`.
    *   **Ghi chú:** Tên phương thức trong code là `activateWithToken` nhưng logic thực tế lại khớp với `activateAccount` (dùng CCCD làm mật khẩu tạm). Cần xem xét đổi tên phương thức để phản ánh đúng nghiệp vụ hơn.
*   **Trạng thái tài khoản:** Enum `AccountStatus` (`PENDING_ACTIVATION`, `ACTIVE`, `LOCKED`) được định nghĩa tại `com.sdms.backend.modules.user.enums.AccountStatus` và được sử dụng đúng trong quy trình.
