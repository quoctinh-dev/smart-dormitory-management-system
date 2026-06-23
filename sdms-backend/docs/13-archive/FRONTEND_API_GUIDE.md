# SDMS V1 - Frontend API Guide

## 1. Introduction

Tài liệu này mô tả toàn bộ API Authentication của hệ thống Smart Dormitory Management System (SDMS V1).

Mục tiêu:

* Hướng dẫn Frontend Web tích hợp API
* Hướng dẫn Mobile App tích hợp API
* Chuẩn hóa Authentication Flow
* Chuẩn hóa xử lý lỗi

Module Authentication đã hoàn thành và được phê duyệt để sử dụng trong môi trường Production.

---

# 2. Base URL

Development

```http
http://localhost:8080
```

Production

```http
https://your-domain.com
```

Tất cả API Auth đều sử dụng prefix:

```http
/api/v1/auth
```

---

# 3. Authentication Strategy

SDMS sử dụng:

* JWT Access Token
* JWT Refresh Token
* Refresh Token Rotation
* Replay Attack Protection

Token type:

```text
Bearer
```

Ví dụ:

```http
Authorization: Bearer eyJhbGciOi...
```

---

# 4. Standard Response Format

Tất cả API trả về:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

## Success Example

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer"
  }
}
```

---

## Error Example

```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

---

## Validation Error Example

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "usernameOrEmail": "Username or Email is required"
  }
}
```

---

# 5. Login API

## Endpoint

```http
POST /api/v1/auth/login
```

---

## Request

```json
{
  "usernameOrEmail": "admin",
  "password": "password123"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer"
  }
}
```

---

## Error Responses

Wrong Password

```json
{
  "success": false,
  "message": "Invalid username or password",
  "data": null
}
```

Account Locked

```json
{
  "success": false,
  "message": "Account is not active",
  "data": null
}
```

Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "usernameOrEmail": "Username or Email is required"
  }
}
```

---

# 6. Refresh Token API

## Endpoint

```http
POST /api/v1/auth/refresh-token
```

---

## Request

```json
{
  "refreshToken": "..."
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Refresh token successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "tokenType": "Bearer"
  }
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": null
}
```

---

## Important

Frontend MUST replace:

```text
old access token
old refresh token
```

bằng token mới trả về.

Không được tiếp tục sử dụng refresh token cũ.

---

# 7. Logout API

## Endpoint

```http
POST /api/v1/auth/logout
```

---

## Headers

```http
Authorization: Bearer <access_token>
```

---

## Success Response

```json
{
  "success": true,
  "message": "Logout successful",
  "data": null
}
```

---

## Frontend Note

Sau khi logout:

* Xóa Access Token
* Xóa Refresh Token
* Xóa User Profile Cache
* Chuyển về Login Screen

---

# 8. Change Password API

## Endpoint

```http
POST /api/v1/auth/change-password
```

---

## Headers

```http
Authorization: Bearer <access_token>
```

---

## Request

```json
{
  "oldPassword": "password123",
  "newPassword": "newPassword456"
}
```

---

## Validation Rules

New Password:

```text
Minimum Length = 6
```

---

## Success Response

```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": null
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Old password is incorrect",
  "data": null
}
```

---

# 9. Forgot Password API

## Endpoint

```http
POST /api/v1/auth/forgot-password
```

---

## Request

```json
{
  "email": "student@sdms.com"
}
```

---

## Success Response

```json
{
  "success": true,
  "message": "Password reset request processed",
  "data": null
}
```

---

## Security Behaviour

Để chống User Enumeration:

API luôn trả về thành công.

Ngay cả khi email không tồn tại.

Frontend luôn hiển thị:

```text
Nếu email tồn tại trong hệ thống,
bạn sẽ nhận được email hướng dẫn khôi phục mật khẩu.
```

---

# 10. Reset Password API

## Endpoint

```http
POST /api/v1/auth/reset-password
```

---

## Request

```json
{
  "token": "reset-token-from-email",
  "newPassword": "NewPassword123"
}
```

---

## Validation Rules

```text
newPassword >= 6 characters
```

---

## Success Response

```json
{
  "success": true,
  "message": "Password has been reset successfully",
  "data": null
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Invalid or expired password reset token",
  "data": null
}
```

---

## Token Rules

* Single Use Token
* SHA-256 Hashed In Database
* Expires After 15 Minutes
* Automatically Invalidated After Success

---

# 11. Authentication Flow

## Login Flow

```text
Login
 ↓
Receive Access Token
 ↓
Receive Refresh Token
 ↓
Store Securely
 ↓
Call Protected APIs
```

---

## Refresh Flow

```text
Access Token Expired
 ↓
Call Refresh Token API
 ↓
Receive New Tokens
 ↓
Replace Old Tokens
```

---

## Forgot Password Flow

```text
Enter Email
 ↓
Call Forgot Password API
 ↓
Receive Reset Email
 ↓
Open Reset Link
 ↓
Submit New Password
 ↓
Login Again
```

---

# 12. Token Lifecycle

## Access Token

Purpose:

```text
Authorize API Requests
```

Short-lived.

---

## Refresh Token

Purpose:

```text
Generate New Access Token
```

Stored in database.

---

## Replay Attack Protection

Nếu refresh token không khớp với token trong database:

```text
All sessions revoked
```

---

## Password Reset Token

* Random Secure Token
* SHA-256 Hash Stored
* One-Time Use
* 15 Minute Expiry

---

# 13. HTTP Status Reference

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Success               |
| 400    | Validation Error      |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 409    | Conflict              |
| 500    | Internal Server Error |

---

# 14. Frontend Integration Checklist

## Login Screen

* Username / Email
* Password
* Remember Me (Optional)

---

## Forgot Password Screen

* Email Input
* Submit Request

---

## Reset Password Screen

* New Password
* Confirm Password

---

## Protected Routes

Require:

```http
Authorization: Bearer <access_token>
```

---

## Auto Refresh

When receiving:

```http
401 Unauthorized
```

Frontend should:

1. Call Refresh Token API
2. Replace Tokens
3. Retry Original Request

---

# 15. Authentication Module Status

Authentication Module: COMPLETED

Security Review: PASSED

HTTP Testing: PASSED

Production Readiness: APPROVED

Ready For Web Frontend: YES

Ready For Mobile App: YES