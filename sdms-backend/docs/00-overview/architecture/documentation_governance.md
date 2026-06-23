# SDMS Documentation Governance Policy

**Technical Role**: Technical Governance Officer | Documentation Custodian  
**Status**: **FROZEN**  
**Effective Date**: 2026-06-21  

---

## 1. Objective

This document establishes the permanent, frozen documentation governance model for the Smart Dormitory Management System (SDMS) project. It defines ownership of directories, mandatory rules for document creation, and the process for auditing documentation upon module completion.

---

## 2. Directory Ownership and Taxonomy

The SDMS documentation repository is structured to isolate modules, split specifications from technical audits, and preserve historical documents. The directory mapping is defined below:

| Directory | Ownership & Contents | Allowed Document Types |
| :--- | :--- | :--- |
| [00-overview](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/00-overview/) | Project-wide documents, master rules, status reports | Governance policies, high-level summaries, master rule maps |
| [01-auth](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/01-auth/) | Auth Module business rules, design specifications, and workflows | Business architecture, lifecycle specs, workflows, module indices |
| [02-student](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/02-student/) | Student Module profile, life cycle, and biometric registration design | Business architecture, demographic rules, integration models, module indices |
| [03-application](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/) | Dormitory Application processing, form designs, and reviews | Domain audits, form requirements, service layer flow specs, module indices |
| [04-room](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/04-room/) | Room capacity, building, bed allocation, and assignments | Room policies, allocation algorithms, capacity constraints, module indices |
| [05-payment](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/) | Bills, invoices, payment gateway integration, and webhooks | Gateway spec, payment lifecycle, webhook designs, module indices |
| [06-face](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/06-face/) | Face recognition vector databases, verification contracts, and APIs | Image contracts, vector schemas, matching APIs, module indices |
| [07-iot](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/07-iot/) | Smart lock controllers, local database caching, gate webhook specs | Hardware APIs, sync protocols, local caching designs, module indices |
| [08-integration](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/08-integration/) | Cross-module transactional mappings and E2E integration diagrams | Dependency maps, integration patterns, global event catalogs |
| [09-architecture](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/09-architecture/) | System-wide, cross-cutting architectural designs and engines | PDF generators, security models, deployment topologies |
| [10-audit](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/) | Technical audits, code implementation audits, database verifications | Code audits, database freeze audits, compliance reports |
| [11-legacy](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/11-legacy/) | Deprecated plans, superseded audit logs, and old status reports | Historically preserved documentation |

---

## 3. Mandatory Document Creation Rules

All contributors, agents, and systems must adhere to the following mandatory rules when modifying or adding documents to the SDMS repository:

> [!IMPORTANT]
> **Rule 01: Root Folder File Ban**  
> No markdown (`.md`) file may be created or stored in the root `docs/` folder. All documentation must reside within one of the subdirectories listed in Section 2.
>
> **Rule 02: Single Module Ownership**  
> Every new document must belong to exactly one module or directory. Multi-module documents are prohibited unless placed in `docs/08-integration/` or `docs/09-architecture/`.
>
> **Rule 03: Centralized Audit Storage**  
> Every audit report (code audits, database audits, security reviews, API controller reviews) must be stored in: [docs/10-audit/](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/).
>
> **Rule 04: Archiving of Obsolete Documents**  
> Every deprecated, duplicate, or superseded document must be moved to the legacy folder: [docs/11-legacy/](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/11-legacy/). No active markdown file should be permanently deleted; they are archived to maintain audit trails.
>
> **Rule 05: Business Document Boundaries**  
> All business requirements, domain logic, and functional rules belong strictly inside their respective module folders (e.g., `01-auth/`, `02-student/`, etc.).
>
> **Rule 06: Architecture Document Placement**  
> Core system-wide architectural design documents belong to [docs/09-architecture/](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/09-architecture/), unless they are entirely module-specific, in which case they reside in that module's directory.

---

## 4. Module Completion Auditing & Indexing

When any functional module reaches the status of **MODULE COMPLETE**, the agent/developer must automatically trigger a verification process:

1. **Audit Module Documents**: Scan the folder to ensure all documents follow the taxonomy.
2. **Verify Document Consistency**: Confirm that assertions in the documents match the actual codebase implementation.
3. **Detect Duplicates**: Identify overlapping content and consolidate it.
4. **Detect Obsolete Reports**: Identify intermediate design proposals or plans and move them to `docs/11-legacy/`.
5. **Update Cross-References**: Repair any broken markdown links caused by file movement.
6. **Generate Module Index**: Create a `<module_name>_document_index.md` file within the module folder.

### Index Naming and Structure Example
- [docs/01-auth/auth_document_index.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/01-auth/auth_document_index.md)
- [docs/02-student/student_document_index.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/02-student/student_document_index.md)
- [docs/03-application/application_document_index.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/application_document_index.md)
- [docs/04-room/room_document_index.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/04-room/room_document_index.md)

---

## 5. Gateway Checkpoints and Verification

For future checkpoints (e.g., `PAYMENT`, `FACE`, `IOT`, `INTEGRATION`), before granting a **PASS** decision, the agent must perform the governance checklist:
- [ ] Confirm all module documents are stored in their correct subdirectories.
- [ ] Ensure that the module's document index file exists and is fully updated.
- [ ] Ensure that the integration dependency map ([docs/08-integration/document_dependency_map.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/08-integration/document_dependency_map.md)) has been updated.
- [ ] Verify that all legacy or deprecated documents have been archived to `11-legacy/`.

> [!CAUTION]
> **No gate status can be set to PASS if documentation governance is violated.**
