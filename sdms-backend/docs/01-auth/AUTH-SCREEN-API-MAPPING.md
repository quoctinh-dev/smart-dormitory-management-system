# AUTH-SCREEN-API-MAPPING

| Screen Name | API Used | Actions | Permissions | Expected Response |
| :--- | :--- | :--- | :--- | :--- |
| **AdminLoginScreen** | `POST /api/v1/auth/login` | Click Login | NONE | `AuthResponse` |
| **AdminProfileModal**| `GET /api/v1/users/me` | On Mount | `ROLE_ADMIN`, `ROLE_STAFF` | `MeResponse` |
| **AdminChangePasswordScreen**| `POST /api/v1/auth/change-password` | Click Submit | `ROLE_ADMIN`, `ROLE_STAFF` | `200 OK` |
| **StudentActivationScreen** | `POST /api/v1/auth/activate` | Click Activate | NONE | `AuthResponse` |
| **StudentLoginScreen** | `POST /api/v1/auth/login` | Click Login | NONE | `AuthResponse` |
| **StudentForgotPasswordScreen**| `POST /api/v1/auth/forgot-password` | Click Send Link | NONE | `200 OK` |
| **StudentResetPasswordScreen** | `POST /api/v1/auth/reset-password` | Click Reset | NONE | `200 OK` |
| **StudentProfileSettingsScreen**| `GET /api/v1/users/me` | On Mount | `ROLE_STUDENT` | `MeResponse` |

## GAP ANALYSIS & READINESS

**Missing APIs (GAP):**
- Missing `Admin User Management` APIs (List users, Create Staff, Disable Account).
- Missing `GET /api/v1/auth/sessions` (View active devices).

**Integration Risks:**
- Tokens must be securely stored in HttpOnly Cookies (for Web) or Secure Storage (for Mobile) to prevent XSS.

**AUTH UI READINESS:**
- **Web Team:** **WARNING** (Can build Login/Profile, but CANNOT build User Management).
- **App Team:** **PASS** (All Student Authentication APIs exist: Activate, Login, Forgot Password, Reset Password, Change Password).
