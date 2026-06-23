# BACKEND-CONSISTENCY-01: Full Backend Consistency Audit

## 1. Executive Summary
This architectural governance audit evaluates the SDMS backend codebase against the approved documentation blueprints. The goal is to enforce consistency across module boundaries, security annotations, event architectures, and database migrations before the commencement of the Notification Module design.

## 2. Module Boundary Matrix
This matrix evaluates architectural boundary adherence based on package structure and dependency directions.

| Module | Boundary Health | Leakage Detected | Notes | Severity |
| --- | --- | --- | --- | --- |
| `auth` | PASS | None | Tightly encapsulated security context. | LOW |
| `student` | PASS | None | Clear separation from `user` account data. | LOW |
| `room` | PASS | None | Domain isolation is preserved. | LOW |
| `registration` | WARNING | Yes (application) | The codebase contains an `application` module, but the taxonomy calls it `registration`. | HIGH |
| `payment` | PASS | None | Self-contained billing processing. | LOW |
| `face` | WARNING | Yes (Upload/Integration) | `face` boundaries are loosely defined, heavy reliance on external AI integrations without proper anti-corruption layers. | MEDIUM |
| `smartaccess` | PASS | None | Successfully refactored. Zero boundary leaks. | LOW |
| `upload` | FAIL | Yes (Global) | Acts as a global utility rather than a bounded context. Should be an infrastructure adapter, not a domain module. | HIGH |

## 3. Code vs Documentation Matrix
| Module | Blueprint Alignment | Drift Detected | Severity |
| --- | --- | --- | --- |
| `auth` | 100% | None | LOW |
| `smartaccess` | 100% | None | LOW |
| `room` | 95% | Minor | LOW |
| `student` | 90% | Missing Face relation docs | MEDIUM |
| `payment` | 85% | Webhook documentation drift | MEDIUM |
| `face` | 60% | Massive drift. Code lacks events documented in blueprints. | CRITICAL |
| `registration` | 50% | Code module is named `application`, docs say `registration`. | HIGH |

## 4. Database Consistency Matrix
Flyway migrations were cross-referenced against JPA Entities and domain blueprints.

| Module | Flyway State | Database Consistency | Severity |
| --- | --- | --- | --- |
| `auth` | `V2`, `V3` | Consistent | LOW |
| `student` | `V4` | Consistent | LOW |
| `room` | `V7`, `V9`, `V17` | Consistent | LOW |
| `registration` | `V5`, `V6`, `V16` | Missing table constraints for workflow states. | MEDIUM |
| `payment` | `V13`, `V18` | Consistent | LOW |
| `face` | `V15` | Missing deep Flyway definitions for standalone Face metadata. | HIGH |
| `smartaccess` | `V21_*` | 100% Consistent | LOW |

## 5. Event Architecture Matrix
Verification of Spring Application Event publishers and listeners.

| Module | Published Events | Event Naming Standard | Async/Commit Adherence |
| --- | --- | --- | --- |
| `smartaccess` | `RemoteUnlockEvent`, `AccessGrantedEvent`, etc. | PASS | Strictly adheres to `@TransactionalEventListener` |
| `room` | `BedReservedEvent`, `CheckInCompletedEvent`, etc. | PASS | Proper domain-driven naming |
| `student` | `StudentCreatedEvent` | PASS | Needs expansion for updates |
| `payment` | `PaymentSuccessEvent` | WARNING | Missing Failure/Refund events |
| `registration`| `ApplicationApprovedEvent` | WARNING | Missing Submission/Rejection events |
| `face` | None | FAIL | Must publish `FaceRegisteredEvent` |

## 6. Security Consistency Matrix
Evaluation of `@PreAuthorize`, JWT, and Authority models.

| Module | Annotation Pattern | Consistency Issue | Severity |
| --- | --- | --- | --- |
| `smartaccess` | `@PreAuthorize(SmartAccessPermissions.VIEW_ACCESS_HISTORY)` | PASS. Uses strict Permission Constants. | LOW |
| `student` | `@PreAuthorize("hasRole('STUDENT')")` | Hardcoded string roles. | MEDIUM |
| `room` | `@PreAuthorize("hasRole('ADMIN')")` | Hardcoded string roles. | MEDIUM |
| `payment` | `@PreAuthorize("hasRole('STUDENT')")` | Hardcoded string roles. | MEDIUM |
| `registration`| `@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")` | Hardcoded string roles. | MEDIUM |

**Security Recommendation:** The entire project outside of `smartaccess` suffers from hardcoded String role checks. The project must be refactored to use a centralized `Permissions` constant registry to match the `smartaccess` standard.

## 7. Notification Readiness Matrix
Assessment of domain events available for the upcoming Notification Module.

| Module | Notification-Worthy Events Existing | Missing Events Required Before Notification Integration |
| --- | --- | --- |
| `Registration`| `ApplicationApprovedEvent` | `ApplicationSubmittedEvent`, `ApplicationRejectedEvent` |
| `Payment` | `PaymentSuccessEvent` | `PaymentFailedEvent`, `PaymentOverdueEvent` |
| `Room` | `BedReservedEvent`, `CheckInCompletedEvent` | `EvictionNoticeEvent` |
| `Face` | None | `FaceRegistrationFailedEvent`, `FaceSyncSuccessEvent` |
| `Smart Access`| `AccessDeniedEvent`, `EmergencyOverrideEvent` | `GatewayOfflineEvent` |

## 8. Technical Debt Report
- **Dead Code / Unused Infrastructure:** `upload` module should not be a domain module. It should be refactored into `infrastructure/storage`.
- **Naming Confusion:** `application` vs `registration` module names. The codebase uses `com.sdms.backend.modules.application` while documentation uses `04-registration`.
- **Hardcoded Security:** Rampant use of `@PreAuthorize("hasRole('X')")` strings across legacy modules.
- **Missing Event Hooks:** `face` and `registration` lack the necessary Domain Events required to hook into asynchronous workflows.

## Final Decision
**PASS WITH FIXES**

The backend is structurally sound as a Modular Monolith, but multiple critical inconsistencies (Registration vs Application naming, Face module event drift, and Security String hardcoding) must be addressed before or during the Notification Module implementation.
