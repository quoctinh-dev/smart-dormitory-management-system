# Auth Code Architecture Audit Report

## 1. Repository Ownership
* **Aggregate Owned**: `UserAccount` (mapped to `user_accounts` table).
* **Repository**: `UserAccountRepository` is the sole database data access class of the Auth Module. It exposes:
  - `findByUsername(String username)`
  - `findByEmail(String email)`
  - `findByEmailForUpdate(String email)` (acquires a pessimistic write lock for account activation)
  - `findByResetPasswordToken(String token)`
* **Boundary Validation**: The repository does not extend or define references to any non-auth entities.

---

## 2. Service Ownership
The Auth Module has four dedicated services:
1. **`AuthService`**: Coordinates logins, tokens generation, account activation, password changes, and password reset recovery.
2. **`JwtService`**: Manages token signatures, claims extraction, token verification, and refresh lifecycle.
3. **`CustomUserDetailsService`**: Integrates Spring Security User Details API with `UserAccountRepository`.
4. **`UserService`**: Exposes profile detail queries.

---

## 3. JWT Security & Expiry Validation
* **Status Enforcement**: Inspected `AuthService.login()` and `AuthService.refreshToken()`. If `account.getStatus()` is `PENDING_ACTIVATION` or any status other than `ACTIVE`, the token generation is aborted with a `FORBIDDEN` status.
* **Token Rotation (Detection and Revocation)**: Refresh tokens are validated on reuse. If a refresh request fails validation or is used with an invalid token, `AuthService.revokeTokens()` is called to revoke the user's sessions immediately.
* **Password Reset Hashing**: Password recovery tokens are hashed using SHA-256 before being stored in the database, preventing token leakage in case of database exposure.

---

## 4. Cross Module Validation
* Verified that the Auth Module contains **zero** injections of `DormitoryApplicationRepository`, `RoomRepository`, `BedRepository`, `StudentHousingAssignmentRepository`, `BillRepository`, or `PaymentRepository`.
* Verified that no direct data writes are executed from the Auth Module to any external domain tables.

---

## 5. Build Validation
* **Action**: Run `.\mvnw.cmd clean compile`
* **Result**: `BUILD SUCCESS` (176 source files successfully compiled with zero errors).

---

## 6. Final Audit Result

**AUTH MODULE COMPLETE**
