# AUTH-ADMIN-WEB-CONTRACT

## Used Endpoints

### 1. `POST /api/v1/auth/login`
- **Purpose:** Authenticate the admin/staff member.
- **UI Usage:** `AdminLoginScreen`
- **Required Permissions:** None
- **Expected Response:** `AuthResponse` containing `accessToken`.

### 2. `POST /api/v1/auth/logout`
- **Purpose:** Safely terminate the admin session.
- **UI Usage:** `AdminSidebar / Navbar Logout Button`
- **Required Permissions:** `ROLE_ADMIN` or `ROLE_STAFF`
- **Expected Response:** `200 OK`

### 3. `GET /api/v1/users/me`
- **Purpose:** Fetch the admin's profile name, email, and exact role to render UI permissions.
- **UI Usage:** `AdminDashboard` (Top right profile corner)
- **Required Permissions:** `ROLE_ADMIN` or `ROLE_STAFF`
- **Expected Response:** `MeResponse`

### 4. `POST /api/v1/auth/change-password`
- **Purpose:** Allow admin to update their own security credentials.
- **UI Usage:** `AdminProfileScreen`
- **Required Permissions:** `ROLE_ADMIN` or `ROLE_STAFF`
- **Expected Response:** `200 OK`

## GAP ANALYSIS: Admin User Management
Currently, the `Admin Web` lacks specific User Management APIs:
- `GET /api/v1/admin/users` (List all users) -> Missing
- `POST /api/v1/admin/users` (Create staff) -> Missing
- `PATCH /api/v1/admin/users/{id}/roles` -> Missing
