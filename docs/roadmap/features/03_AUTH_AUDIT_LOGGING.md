# Bảng thiết kế Audit Log (Authentication)

Tài liệu này định nghĩa cấu trúc Audit Logging để lưu vết toàn bộ hoạt động bảo mật liên quan đến module Auth của hệ thống theo chuẩn Enterprise.

## Cấu trúc lưu trữ Audit Data chung
Các log nên được lưu dưới dạng JSON (ví dụ, field `audit_data` kiểu `jsonb` trong bảng `audit_logs`). 
- `IP Address`, `User-Agent` (Thiết bị)
- `Action_Time`

---

## 1. Login Success
- **Event Name**: `AUTH_LOGIN_SUCCESS`
- **Trigger**: Thành công gọi API `/login` hoặc `/activate`
- **Actor**: `accountId` (người dùng vừa login)
- **Business Meaning**: Lưu vết người dùng đăng nhập thành công vào hệ thống.
- **Audit Data cần lưu**: `ip_address`, `device_info`, `login_method` (password/token).
- **Có cần Notification**: Không. Tuy nhiên nếu IP khác biệt lớn với IP thường dùng, có thể cấu hình cảnh báo "Đăng nhập thiết bị lạ".

## 2. Login Failed
- **Event Name**: `AUTH_LOGIN_FAILED`
- **Trigger**: Nhập sai username hoặc password quá giới hạn, hoặc không tồn tại.
- **Actor**: `System` (gắn với email/username bị nhập sai)
- **Business Meaning**: Phát hiện các dấu hiệu tấn công Brute-force.
- **Audit Data cần lưu**: `ip_address`, `attempted_username`, `failure_reason` (INVALID_CREDENTIAL).
- **Có cần Notification**: Không.

## 3. Locked Account
- **Event Name**: `AUTH_ACCOUNT_LOCKED`
- **Trigger**: Đăng nhập sai quá 5 lần liên tiếp (Đề xuất thêm logic này vào backend).
- **Actor**: `System`
- **Business Meaning**: Tài khoản bị khóa tự động để bảo vệ an toàn.
- **Audit Data cần lưu**: `account_id`, `lock_time`, `trigger_ip`.
- **Có cần Notification**: **CÓ** (Gửi Email cảnh báo cho chủ tài khoản biết bị khóa).

## 4. Refresh Token
- **Event Name**: `AUTH_TOKEN_REFRESHED`
- **Trigger**: Cấp phát lại token qua `/refresh-token` thành công.
- **Actor**: `accountId`
- **Business Meaning**: Xác nhận phiên đăng nhập đang được duy trì liên tục.
- **Audit Data cần lưu**: `old_refresh_token_id`, `new_refresh_token_id`, `ip_address`.
- **Có cần Notification**: Không.

## 5. Logout
- **Event Name**: `AUTH_LOGOUT`
- **Trigger**: Gọi API `/logout`.
- **Actor**: `accountId`
- **Business Meaning**: Người dùng chủ động kết thúc phiên.
- **Audit Data cần lưu**: `ip_address`, `session_duration`.
- **Có cần Notification**: Không.

## 6. Password Changed
- **Event Name**: `AUTH_PASSWORD_CHANGED`
- **Trigger**: Đổi mật khẩu thành công qua API `/change-password`.
- **Actor**: `accountId`
- **Business Meaning**: Theo dõi bảo mật, vô hiệu hóa các thiết bị khác.
- **Audit Data cần lưu**: `ip_address`. (KHÔNG LƯU MẬT KHẨU CŨ/MỚI)
- **Có cần Notification**: **CÓ** (Gửi Email: "Mật khẩu của bạn vừa được thay đổi").

## 7. Password Reset
- **Event Name**: `AUTH_PASSWORD_RESET`
- **Trigger**: Hoàn tất đổi mật khẩu qua API `/reset-password`.
- **Actor**: `accountId`
- **Business Meaning**: Mật khẩu bị quên và đã được khôi phục.
- **Audit Data cần lưu**: `ip_address`, `reset_token_id`.
- **Có cần Notification**: **CÓ** (Gửi Email: "Tài khoản của bạn đã được khôi phục").

## 8. First Login (Activation)
- **Event Name**: `AUTH_ACCOUNT_ACTIVATED`
- **Trigger**: Gọi thành công `/activate`.
- **Actor**: `accountId`
- **Business Meaning**: Lần đầu tiên tài khoản được kích hoạt trên hệ thống.
- **Audit Data cần lưu**: `ip_address`, `activation_time`.
- **Có cần Notification**: Không. (Vì đã kích hoạt thành công tức là chủ thể sở hữu thông tin).

## 9. Token Revoked (Bảo mật)
- **Event Name**: `AUTH_TOKEN_REVOKED`
- **Trigger**: Hệ thống phát hiện Refresh Token bị sử dụng lại (Replay Attack) hoặc Admin chủ động kích người dùng khỏi hệ thống.
- **Actor**: `System` hoặc `AdminId`
- **Business Meaning**: Xử lý sự cố bảo mật.
- **Audit Data cần lưu**: `revoked_refresh_token`, `reason` (ví dụ: SECURITY_VIOLATION).
- **Có cần Notification**: **CÓ** (Gửi Email: "Phiên đăng nhập bị chấm dứt do phát hiện bất thường").
