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
