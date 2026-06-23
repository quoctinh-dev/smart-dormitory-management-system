# AUTH-API-CATALOG

## 1. Authentication Endpoints

### 1.1 Activate Account
- **Method:** POST
- **Path:** `/api/v1/auth/activate`
- **Description:** Kích hoạt tài khoản sinh viên bằng email, mật khẩu tạm thời (thường là CCCD) và mật khẩu mới.
- **Request DTO:** `ActivateAccountRequest`
- **Response DTO:** `AuthResponse` (Contains accessToken and refreshToken)
- **Auth Required:** No
- **Roles:** PUBLIC

### 1.2 User Login
- **Method:** POST
- **Path:** `/api/v1/auth/login`
- **Description:** Authenticate user and return JWT tokens.
- **Request DTO:** `LoginRequest` (email, password)
- **Response DTO:** `AuthResponse` (accessToken, refreshToken)
- **Auth Required:** No
- **Roles:** PUBLIC

### 1.3 Refresh Token
- **Method:** POST
- **Path:** `/api/v1/auth/refresh-token`
- **Description:** Get new access and refresh tokens.
- **Request DTO:** `RefreshTokenRequest` (refreshToken)
- **Response DTO:** `AuthResponse`
- **Auth Required:** No (Token is in body)
- **Roles:** PUBLIC

### 1.4 Logout
- **Method:** POST
- **Path:** `/api/v1/auth/logout`
- **Description:** Logout user and revoke refresh token.
- **Request DTO:** Empty
- **Response DTO:** Void
- **Auth Required:** Yes
- **Roles:** ANY_AUTHENTICATED

## 2. Password Management Endpoints

### 2.1 Change Password
- **Method:** POST
- **Path:** `/api/v1/auth/change-password`
- **Description:** Change password for the current authenticated user.
- **Request DTO:** `ChangePasswordRequest` (oldPassword, newPassword)
- **Response DTO:** Void
- **Auth Required:** Yes
- **Roles:** ANY_AUTHENTICATED

### 2.2 Forgot Password
- **Method:** POST
- **Path:** `/api/v1/auth/forgot-password`
- **Description:** Request password reset via email.
- **Request DTO:** `ForgotPasswordRequest` (email)
- **Response DTO:** Void
- **Auth Required:** No
- **Roles:** PUBLIC

### 2.3 Reset Password
- **Method:** POST
- **Path:** `/api/v1/auth/reset-password`
- **Description:** Reset user password using a valid reset token sent to email.
- **Request DTO:** `ResetPasswordRequest` (token, newPassword)
- **Response DTO:** Void
- **Auth Required:** No
- **Roles:** PUBLIC

## 3. User Endpoints

### 3.1 Get Current User
- **Method:** GET
- **Path:** `/api/v1/users/me`
- **Description:** Get profile information of the currently authenticated user.
- **Request DTO:** N/A
- **Response DTO:** `MeResponse` (id, email, role, name)
- **Auth Required:** Yes
- **Roles:** ANY_AUTHENTICATED
