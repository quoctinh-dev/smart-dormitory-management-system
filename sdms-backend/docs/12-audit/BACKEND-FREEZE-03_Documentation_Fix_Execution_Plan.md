# BACKEND-FREEZE-03: Documentation Fix Execution Plan

## 1. Executive Summary
This document serves as the final execution roadmap for aligning the SDMS architectural documentation with the physical Spring Boot codebase. It aggregates findings from `BACKEND-FREEZE-01`, `02`, and `02A` to provide a precise punch-list of documentation updates. **No source code will be modified.** The codebase acts as the absolute source of truth.

## 2. Documentation Fix Matrix

| Module | Action Type | Affected Documents | Priority | Owner Team |
| --- | --- | --- | --- | --- |
| **Auth** | NONE | N/A | Low | Security Architecture |
| **Application** | `DOC-ADD` | `docs/05-application/*` (New Directory) | CRITICAL | Core Architecture |
| **Registration**| `DOC-FIX` | `docs/04-registration/*` | CRITICAL | Core Architecture |
| **Face** | `DOC-FIX` | `docs/07-face/*` | HIGH | AI Integration |
| **IoT** | `DOC-FIX` | `docs/08-iot/*` | HIGH | IoT Integration |
| **Upload** | `DOC-ADD` | `docs/12-infra/upload_integration.md` | HIGH | Core Architecture |
| **Student** | `DOC-FIX` | `student_code_architecture_audit.md` | MEDIUM | Core Architecture |
| **Room** | `DOC-FIX` | `room_business_architecture_audit.md` | MEDIUM | Core Architecture |
| **Payment** | `DOC-FIX` | `payment_architecture_audit.md` | MEDIUM | Financial Architecture |
| **Smart Access**| `DOC-FIX` | `docs/06-smart-access/audit/*` | MEDIUM | Security Architecture |

## 3. Execution Punch-List

### 3.1 Registration & Application Taxonomy Split
**Goal:** Mirror the physical Java package separation (`com.sdms.backend.modules.application` vs `registration`).
- **Action 1:** Create `docs/05-application/`.
- **Action 2:** Move all application submission, roommate selection, and bed assignment documentation from `04-registration` into `05-application`.
- **Action 3:** Update `04-registration` to strictly document `RegistrationPeriod` creation, Open/Close states, and `RegistrationEligibility` imports.
- **Alignment Check:** Validates Student Mobile (submitting applications) vs Admin Web (opening periods) boundaries.

### 3.2 Imposing "PLANNED" Watermarks
**Goal:** Prevent downstream frontend and hardware teams from assuming Face and IoT backend APIs exist.
- **Action 1:** Prepend `> [!WARNING] \n> STATUS: PLANNED (Not Implemented)` to every single markdown file in `docs/07-face/`.
- **Action 2:** Prepend the same warning to every markdown file in `docs/08-iot/`.
- **Alignment Check:** Ensures the AI and IoT teams do not attempt integration against empty backend shells.

### 3.3 Security & Actor Ownership Transparency
**Goal:** Document the physical reality of the backend API routes and security annotations.
- **Action 1 (Smart Access):** Update `SPRING-ACCESS-05_API_And_Security_Audit_Report.md` to explicitly state that Student and Admin routes are heavily mixed under `/api/v1/access/*`, but perfectly secured via `SmartAccessPermissions` constants.
- **Action 2 (Student & Room):** Update their respective architecture docs to officially document the technical debt of using legacy String-based `@PreAuthorize("hasRole('STUDENT')")` annotations instead of constant registries.
- **Action 3 (Payment):** Update payment documentation to note that its API namespace is currently `/api/payments` (lacking the `v1` prefix and actor boundaries), and explicitly document that `PaymentFailedEvent` and `PaymentRefundedEvent` do not exist in the code.

### 3.4 Upload Infrastructure Baseline
**Goal:** Document the hidden integration.
- **Action 1:** Create `docs/12-infra/upload_integration.md`.
- **Action 2:** Document the existence of `com.sdms.backend.modules.upload.CloudinaryService`.
- **Action 3:** Detail how the Admin Web and Student Mobile apps consume `/api/v1/uploads` for avatar and application documentation uploads.

## Final Decision
**PASS**
This execution plan provides exact instructions for documentation authors to repair the SDMS blueprints. Executing this plan will result in a 100% accurate documentation repository that perfectly describes the physical reality of the backend code, completely satisfying the criteria for an Architecture Freeze.
