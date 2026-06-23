# Registration Module Architecture

> [!NOTE]
> This document was isolated during `BACKEND-FREEZE-03`. The `DormitoryApplication` workflows have been correctly migrated to `05-application` to mirror the physical Java codebase.

## 1. Domain Boundary
The `Registration` module (`com.sdms.backend.modules.registration`) is strictly an administrative Bounded Context. It controls **when** students can apply for housing, and **who** is eligible.

It does **not** process the actual student applications (see `05-application`).

## 2. Core Entities
- **`RegistrationPeriod`**: Defines the Open/Close timestamps for a dormitory registration event.
- **`RegistrationEligibility`**: An imported whitelist of student CCCDs or IDs who are allowed to participate in the associated `RegistrationPeriod`.

## 3. Actor Ownership
- **Owner:** Administrator
- **Channel:** Admin Web Portal
- **Security:** `@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")` (Note: Uses legacy String-based security).

## 4. API Endpoints
- `POST /api/v1/admin/registration-periods` (Create period)
- `POST /api/v1/admin/registration-periods/{id}/eligibility` (Import CSV)
- `GET /api/v1/registrations` (Public/Student endpoint to view currently active periods. Lacks explicit actor namespace).
