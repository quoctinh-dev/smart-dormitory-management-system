# Auth Role & Permission Model

## 1. Frozen Roles
The system enforces three distinct, immutable roles defined in the [Role](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/user/enums/Role.java) enum:

* **`STUDENT`**:
  - Represented by KTX residents.
  - Authorized to view their active room assignments, upload portraits/CCCD for AI face integration, check profile information, and pay room accommodation bills.
* **`STAFF`**:
  - Represented by Ban quản lý (Dormitory Management Staff).
  - Authorized to manage dormitory buildings, floors, rooms, and beds, review submitted student applications and verification documents, approve check-ins/check-outs, and run manual room capacity reconciliation audits.
* **`ADMIN`**:
  - Represented by system administrators.
  - Holds superuser rights including system configuration, manual cash bill approvals, and full access to system metrics and scheduler logs.

---

## 2. API Authorization Rules
API endpoint security is enforced at the method level using Spring Security annotations:
* `@PreAuthorize("hasRole('STUDENT')")`: Restricted to active students. (e.g., fetching current room details in `StudentRoomService`).
* `@PreAuthorize("hasRole('STAFF')")`: Restricted to staff members. (e.g., verifying application documents).
* `@PreAuthorize("hasRole('ADMIN')")`: Restricted to admin accounts. (e.g., approving offline cash payments in `PaymentService`).

---

## 3. Future Permission Strategy
While the current version utilizes coarse role-based access control, the system architecture supports mapping roles to granular permission privileges. In subsequent phases, a mapping table or configuration class can dynamically bind fine-grained permissions (e.g., `READ_ASSIGNMENT`, `WRITE_PAYMENT`) to roles, allowing roles to inherit permissions and decoupling controller authorization checks from hardcoded role names.
