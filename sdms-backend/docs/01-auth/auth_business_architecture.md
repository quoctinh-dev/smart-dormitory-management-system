# Auth Module Business & Architecture Documentation

## 1. Module Purpose
The Auth Module in the Smart Dormitory Management System (SDMS) provides secure authentication, authorization, and account management services. It ensures that dormitory residents (students), ban quản lý (staff), and administrators (admin) are correctly authenticated and authorised to interact with the system's endpoints.

## 2. Bounded Context
The Auth Module operates within the security and account management bounded context. It owns the lifecycle of user credentials and access states.
* **Aggregates Owned**:
  - `UserAccount`: Represents the credentials, role, status, refresh token, and reset password token of a user.

---

## 3. Module Responsibilities
* **Identity Authentication**: Validating credentials (username/email and password) and issuing JSON Web Tokens (Access and Refresh Tokens).
* **Account Activation**: Activation is a public endpoint; no prior payment required. Users provide email, temporary password (CCCD), and new password to obtain JWT tokens.
* **Role-Based Access Control (RBAC)**: Enforcing role constraints (`STUDENT`, `STAFF`, `ADMIN`) across all API controllers using Spring Security.
* **Credential Recovery**: Providing a secure, time-sensitive password reset workflow via email tokens.

---

## 4. Module Boundaries & Decoupling
To preserve DDD aggregate boundaries and modularity:
* **Zero Cross-Module Writes**: The Auth Module never directly writes to or modifies entities of external modules (`DormitoryApplication`, `Room`, `Bed`, `StudentHousingAssignment`, `Bill`, `Payment`).
* **Zero Cross-Module Repository Injections**: The Auth Module services (`AuthService`, `UserService`, `CustomUserDetailsService`) do not inject repositories owned by other modules.
* **Database Separation**: Direct SQL reads/writes are restricted to the `user_accounts` table.

---

## 5. Integration Points
* **Security Filters**: `JwtAuthenticationFilter` intercepts incoming HTTP requests to validate the JWT signature, extracts user claims, and loads the authentication profile into the Security Context.
