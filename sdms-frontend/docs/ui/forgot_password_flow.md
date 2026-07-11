# Luồng giao diện Quên mật khẩu (Forgot Password Flow)

**Thư mục chứa mã nguồn:** `src/pages/admin/` (Sẽ được tái sử dụng cho ứng dụng chung nếu cần thiết)

## 1. Mục đích
Cung cấp giao diện cho người dùng yêu cầu cấp lại mật khẩu mới khi quên mật khẩu đăng nhập. Thỏa mãn mô hình CRD (Create, Read, Disable) không để Admin can thiệp vào credential của người dùng.

## 2. Các màn hình liên quan
### 2.1. Nút "Quên mật khẩu?" trên trang Đăng nhập
- **Vị trí:** Dưới trường nhập mật khẩu ở `LoginPage.tsx`.
- **Chức năng:** Chuyển hướng người dùng sang trang Nhập Email (`/admin/forgot-password`).

### 2.2. Trang Yêu cầu Khôi phục (Forgot Password Page)
- **URL:** `/admin/forgot-password`
- **Giao diện:**
  - Tiêu đề: "Quên mật khẩu?"
  - Hướng dẫn: "Vui lòng nhập địa chỉ email đã đăng ký. Hệ thống sẽ gửi một liên kết an toàn để bạn đặt lại mật khẩu."
  - Form:
    - Input `email`: Có validate định dạng email.
    - Button "Gửi yêu cầu" (Hiển thị loading state khi gọi API).
    - Nút "Quay lại đăng nhập" (Back to Login).
- **Tương tác API:** Gọi `authApi.forgotPassword({ email })`.
- **Trạng thái thành công:** Hiển thị thông báo (Alert/Snackbar) xác nhận email đã được gửi.

### 2.3. Trang Đặt lại mật khẩu (Reset Password Page)
- **URL:** `/admin/reset-password?token=xxxxxxx` (Do link từ email trỏ tới)
- **Giao diện:**
  - Tiêu đề: "Đặt lại mật khẩu mới"
  - Form:
    - Input `newPassword`: Yêu cầu mật khẩu mới.
    - Input `confirmPassword`: Xác nhận mật khẩu mới. Có validate trùng khớp.
    - Button "Lưu thay đổi" (Hiển thị loading state).
- **Logic:**
  - Lấy `token` từ URL query parameters (`useSearchParams`).
  - Gọi `authApi.resetPassword({ token, newPassword })`.
- **Trạng thái thành công:** Hiển thị thông báo thành công và cung cấp nút bấm chuyển hướng về `/admin/login`.

## 3. Quản lý trạng thái và Lỗi
- Bắt và hiển thị lỗi từ API (VD: "Email không tồn tại", "Token không hợp lệ hoặc hết hạn").
- Hiển thị Alert/Thông báo trực tiếp trên UI.
