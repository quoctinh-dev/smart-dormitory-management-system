# SDMS Documentation Taxonomy & Governance Guide
*(Use this document as context/prompt for AI Agents and Developers working on the SDMS project)*

## 1. Executive Summary
This document defines the strict taxonomy and governance rules for the `docs/` directory within the Smart Dormitory Management System (SDMS) Backend repository. All AI agents and developers **MUST** strictly adhere to this structure. Do not create files outside of their designated boundaries.

## 2. Directory Taxonomy (The "16 Pillars")

The `docs/` directory is organized into numbered domain boundaries. **Never place `.md` files in the root of `docs/`.**

| Directory | Domain/Purpose | Rules |
| :--- | :--- | :--- |
| `00-overview/` | Cross-domain architecture, system overviews, and actor matrices. | Use `architecture/` for blueprints. Audits have been moved to `12-audit/`. |
| `01-auth/` | Authentication, JWT, Roles, and Permissions. | No external domain logic allowed. |
| `02-student/` | Student profiles, emergency contacts, and lifecycle. | Pure student data boundary. |
| `03-registration/` | Registration periods, eligibility, and configuration. | Admin-centric timeline control. |
| `04-application/` | Student dormitory applications and verification documents. | Separated from `03-registration` to maintain cohesion. |
| `05-room/` | Buildings, floors, rooms, beds, and assignments. | Core physical domain. |
| `06-payment/` | Billing, payment gateways, and webhook design. | Financial boundary. |
| `07-face/` | Face recognition, AI integration, and privacy policies. | Contains deep sub-folders (`ai`, `architecture`, `ui`, `implementation`). |
| `08-smart-access/` | Access history, curfew policies, and MQTT payload processing. | Core IoT backend logic. |
| `09-notification/` | Notification preferences, templates, and delivery routing. | Newly recognized Bounded Context. |
| `10-admin-web/` | Admin Web Frontend Architecture placeholders. | UI boundary. |
| `11-student-mobile/` | Student Mobile App Architecture placeholders. | UI boundary. |
| `12-audit/` | Global gap analyses, consistency reports, and codebase audits. | Centralized repository for all system-wide audit reports. |
| `13-archive/` | Obsolete, legacy, or replaced documentation. | Never delete old docs; move them here. |
| `14-infra/` | Global infrastructure (e.g., Cloudinary Uploads). | Third-party service boundaries. |
| `15-iot/` | Hardware operational design (ESP32) and MQTT topics. | Embedded systems boundary. |

## 3. Sub-folder Conventions
For complex domains (like `08-smart-access` or `07-face`), use standard sub-directories:
- `architecture/`: High-level blueprints, workflows, and database designs.
- `audit/`: Gap analyses, consistency reports, and code audits specific to the domain.
- `implementation/`: Physical class structures, API routes, and code blueprints.
- `ai/` / `ui/`: Specialized boundaries for external system contracts.

## 4. Documentation Governance Rules

### Rule 1: No Root Pollution
Files must **never** be placed directly in `docs/`. Every file must belong to a numbered domain folder. If it affects the whole system, place it in `00-overview` or `12-audit`.

### Rule 2: Technical Debt & Status Watermarks
If a document describes a design that is approved but not yet implemented in code, it **MUST** include the following markdown alert at the top of the file:
```markdown
> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending
```
If an architecture audit detects technical debt that should not be fixed immediately (e.g., legacy `@PreAuthorize` strings), it **MUST** be recorded using:
```markdown
> [!NOTE]
> **Architecture Audit Note:** [Description of acceptable technical debt]
```

### Rule 3: Single Source of Truth
- **Implementation Rules:** The physical Spring Boot source code (`src/main/java`) is the ultimate source of truth.
- **Remediation:** If the documentation differs from the working code, update the documentation to match reality unless explicitly instructed to refactor the code.

### Rule 4: Naming Conventions
- All Markdown files must use `snake_case.md`.
- Audit reports must use `UPPERCASE-PREFIX-01_description.md` (e.g., `BACKEND-FREEZE-01_Alignment_Audit.md`).
- File names should ideally be prefixed with their domain (e.g., `room_business_architecture.md`).

## 5. Agent Instructions
When starting a new task:
1. Identify the Domain based on the 16 pillars.
2. Read the existing `*_document_index.md` or `*_architecture.md` in that domain.
3. Write or edit documents within that domain's boundary.
4. If a file becomes obsolete, move it to `13-archive/`. Do not delete it.
