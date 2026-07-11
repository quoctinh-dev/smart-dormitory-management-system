# Authentication API Specification

Tài liệu đặc tả các API thuộc Module Auth. Mọi API đều trả về dạng chuẩn `ApiResponse`.

---

## 1. Login (Đăng nhập)

- **Endpoint**: `/api/v1/auth/login`
- **Method**: `POST`
- **Authorization**: No
- **Business Rule**: Đăng nhập bằng email hoặc username. Tài khoản phải ở trạng thái `ACTIVE`.

### Request Body
```json
{
  "usernameOrEmail": "string",
  "password": "password123"
}
```
**Request Validation:** Không được bỏ trống.

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhb...",
    "refreshToken": "d71a8..."
  }
}
```

### Response Error
- **400 BAD_REQUEST**: `VALIDATION_FAILED` (Missing fields)
- **401 UNAUTHORIZED**: `INVALID_CREDENTIALS` (Sai mật khẩu / không tìm thấy user)
- **403 FORBIDDEN**: `ACCOUNT_LOCKED` hoặc `ACCOUNT_PENDING_ACTIVATION`

---

## 2. Refresh Token (Lấy lại Token)

- **Endpoint**: `/api/v1/auth/refresh-token`
- **Method**: `POST`
- **Authorization**: No

### Request Body
```json
{
  "refreshToken": "d71a8..."
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Refresh token successful",
  "data": {
    "accessToken": "eyJhb... (Mới)",
    "refreshToken": "d71a8... (Mới)"
  }
}
```

### Response Error
- **401 UNAUTHORIZED**: `TOKEN_EXPIRED`, `TOKEN_INVALID`, `REFRESH_TOKEN_REVOKED`

---

## 3. Logout (Đăng xuất)

- **Endpoint**: `/api/v1/auth/logout`
- **Method**: `POST`
- **Authorization**: Bearer Token (Yêu cầu đăng nhập)

### Request
Không có body.

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## 4. Activate Account (Kích hoạt lần đầu)

- **Endpoint**: `/api/v1/auth/activate`
- **Method**: `POST`
- **Authorization**: No

### Request Body
```json
{
  "email": "student@email.com",
  "tempPassword": "CCCD_NUMBER",
  "newPassword": "new_secure_password"
}
```
**Request Validation:** `newPassword` nên đáp ứng chuẩn độ mạnh (ít nhất 8 ký tự, 1 chữ hoa, 1 số).

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Tài khoản đã được kích hoạt thành công",
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "d71..."
  }
}
```

### Response Error
- **400 BAD_REQUEST**: `ACCOUNT_ALREADY_ACTIVE`
- **401 UNAUTHORIZED**: `INVALID_CREDENTIALS` (Sai mật khẩu tạm)

---

## 5. Change Password (Đổi mật khẩu)

- **Endpoint**: `/api/v1/auth/change-password`
- **Method**: `POST`
- **Authorization**: Bearer Token

### Request Body
```json
{
  "oldPassword": "password123",
  "newPassword": "new_password456"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

### Response Error
- **400 BAD_REQUEST**: `INVALID_PASSWORD` (Sai mật khẩu cũ)

---

## 6. Forgot Password (Yêu cầu khôi phục MK)

- **Endpoint**: `/api/v1/auth/forgot-password`
- **Method**: `POST`
- **Authorization**: No

### Request Body
```json
{
  "email": "student@email.com"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Password reset request processed",
  "data": null
}
```
*(Ghi chú: API luôn trả về 200 dù email có tồn tại hay không để bảo mật)*

---

## 7. Reset Password (Xác nhận khôi phục MK)

- **Endpoint**: `/api/v1/auth/reset-password`
- **Method**: `POST`
- **Authorization**: No

### Request Body
```json
{
  "token": "token_from_email_link",
  "newPassword": "new_password456"
}
```

### Response Success (200 OK)
```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": null
}
```

### Response Error
- **400 BAD_REQUEST**: `TOKEN_INVALID_OR_EXPIRED`
# Danh sách Error Codes (Auth Module)

Dưới đây là bảng chuẩn hóa các Error Codes mà Mobile App cần handle khi làm việc với module Auth.

| ErrorCode | HTTP Status | Message (Backend trả về) | Business Meaning | Client Action (App Android) |
| :--- | :--- | :--- | :--- | :--- |
| **VALIDATION_FAILED** | `400` | "Invalid input data" | Dữ liệu truyền lên bị thiếu hoặc sai định dạng (vd: password quá ngắn) | Highlight UI màu đỏ tại field bị sai, hiện text báo lỗi nhắc người dùng. |
| **INVALID_CREDENTIALS** | `401` | "Invalid username or password" / Mật khẩu không chính xác | User gõ sai tên đăng nhập hoặc mật khẩu | Hiển thị Toast/Snackbar báo sai thông tin. Xóa field password. |
| **TOKEN_EXPIRED** | `401` | "Token expired or invalid" | Access Token hết hạn | Ngầm gọi API Refresh Token. Nếu thành công -> Call lại API bị xịt. Nếu thất bại -> Đẩy về màn Login. |
| **TOKEN_INVALID** | `401` | "Token expired or invalid" | Access Token bị sai cấu trúc hoặc chữ ký không hợp lệ | Đẩy người dùng về màn hình Login ngay lập tức (Xóa Local Data). |
| **REFRESH_TOKEN_REVOKED** | `401` | "Invalid refresh token" | Refresh Token đã bị thu hồi (Do đổi mật khẩu, đăng xuất ở thiết bị khác, hoặc bị tấn công) | Force Logout. Hiện Dialog: "Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại". |
| **ACCOUNT_PENDING_ACTIVATION**| `403` | "ACCOUNT_PENDING_ACTIVATION" | Tài khoản chưa được kích hoạt ở lần đầu | Chuyển hướng người dùng sang Màn hình Kích hoạt tài khoản (Activate Account Screen). |
| **ACCOUNT_LOCKED** | `403` | "Account is not active" / "Tài khoản đã bị khóa" | Tài khoản bị khóa do Admin thao tác hoặc nhập sai pass nhiều lần | Báo cho người dùng biết tài khoản đang bị khóa, yêu cầu liên hệ Ban quản lý. |
| **ACCOUNT_ALREADY_ACTIVE** | `400` | "Tài khoản đã được kích hoạt từ trước" | Cố tình gọi API `/activate` dù tài khoản đã active | Chuyển hướng người dùng về màn hình Login. |
| **INVALID_PASSWORD** | `400` | "Old password is incorrect" | Gõ sai mật khẩu cũ lúc gọi API Đổi mật khẩu | Báo lỗi field Mật khẩu cũ. |
| **TOKEN_INVALID_OR_EXPIRED**| `400` | "Invalid or expired password reset token" | Link Reset Password qua Email đã hết hạn (sau 15p) hoặc bị đổi | Thông báo link đã hết hạn, điều hướng user về luồng "Quên mật khẩu" lại từ đầu. |
| **UNAUTHORIZED** | `401` | "User is not authenticated" | Cố truy cập API cần Auth nhưng không có Header Authorization | Ngầm xử lý: Nếu có Refresh Token thì thử làm mới. Nếu không -> Force Logout. |

---

## Cấu trúc Error Response trả về từ Server

Khi bắt được Exception (nhờ `GlobalExceptionHandler`), backend sẽ trả về JSON như sau:

```json
{
  "success": false,
  "message": "Chi tiết lỗi (để debug hoặc show nếu không map ErrorCode)",
  "data": {
    "usernameOrEmail": "Must not be empty" // Khối data này thường có nếu là VALIDATION_FAILED
  }
}
```

*Đề xuất*: Backend hiện tại đang ném Message cứng thay vì ErrorCode enum ở một số chỗ. Backend Team cần tạo một class `ErrorCode` enum và ném `new AppException(ErrorCode.INVALID_CREDENTIALS)`. Tạm thời Mobile App có thể map logic dựa trên `HTTP Status` và logic luồng API.
