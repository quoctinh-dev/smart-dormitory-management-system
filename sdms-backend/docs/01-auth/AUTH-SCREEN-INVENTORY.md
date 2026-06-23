# AUTH-SCREEN-INVENTORY

Based entirely on existing backend API capabilities in `AuthController` and `UserController`, the Frontend and Mobile teams must implement the following physical UI screens.

## 1. Admin Web Screens
- `AdminLoginScreen`: Username and password inputs.
- `AdminProfileModal`: Display basic info (email, role).
- `AdminChangePasswordScreen`: Inputs for old password, new password, confirm password.
- *(Note: User Management List/Create screens cannot be built yet due to missing APIs).*

## 2. Student Public Web / Mobile Screens
- `StudentActivationScreen`: Inputs for Email, Default Password (CCCD), and New Password.
- `StudentLoginScreen`: Username and password inputs.
- `StudentForgotPasswordScreen`: Input for Email to receive OTP/Link.
- `StudentResetPasswordScreen`: Inputs for Token/OTP and New Password.
- `StudentProfileSettingsScreen`: Display basic info (`/me`) and provide a Change Password button.
