# AUTH-STUDENT-APP-CONTRACT

## Used Endpoints

### 1. `POST /api/v1/auth/activate`
- **Purpose:** Allow new residents to activate their account using their email and default temporary password (CCCD).
- **UI Usage:** `StudentActivationScreen`
- **Required Permissions:** None
- **Expected Response:** `AuthResponse`

### 2. `POST /api/v1/auth/login`
- **Purpose:** Authenticate the student.
- **UI Usage:** `StudentLoginScreen`
- **Required Permissions:** None
- **Expected Response:** `AuthResponse`

### 3. `POST /api/v1/auth/forgot-password` & `reset-password`
- **Purpose:** Self-service password recovery flow.
- **UI Usage:** `ForgotPasswordScreen` & `ResetPasswordScreen`
- **Required Permissions:** None
- **Expected Response:** `200 OK`

### 4. `GET /api/v1/users/me`
- **Purpose:** Load the student's base user data (Email, Status, Role). Note that detailed student data comes from `/api/v1/students/me`.
- **UI Usage:** `StudentHomeScreen`
- **Required Permissions:** `ROLE_STUDENT`
- **Expected Response:** `MeResponse`

### 5. `POST /api/v1/auth/logout`
- **Purpose:** Terminate session on mobile device.
- **UI Usage:** `StudentSettingsScreen`
- **Required Permissions:** `ROLE_STUDENT`
- **Expected Response:** `200 OK`
