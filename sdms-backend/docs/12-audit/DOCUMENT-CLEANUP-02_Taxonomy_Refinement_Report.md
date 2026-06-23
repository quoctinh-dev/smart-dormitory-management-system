# DOCUMENT-CLEANUP-02: Taxonomy Refinement Report

## 1. Executive Summary
This report refines the documentation taxonomy proposed in `DOCUMENT-CLEANUP-01` to better align with the specific context of SDMS: a Modular Monolith architecture developed as a graduation thesis project. The revised taxonomy prioritizes simplicity, practical discoverability, and module-oriented encapsulation over heavy enterprise-scale centralization.

## 2. Current Taxonomy Problems
The initial 15-category taxonomy suffered from the following issues in the context of a graduation thesis:
1. **Over-Centralization of Governance & Audits:** Separating `13-audit` and `14-governance` into top-level global folders breaks module cohesion. Developers working on the `room` module should find the room-specific audits and governance rules alongside the room documentation.
2. **Generic Frontend Category:** `11-frontend` is too generic. SDMS features two distinct user interfaces (Student Mobile App and Admin Web) which have completely different lifecycles, technologies, and audiences.
3. **Excessive Top-Level Folders:** A pure modular monolith benefits most from vertical slicing. Top-level categories should represent actual modules/domains as much as possible.
4. **Broad Integration Tracking:** `09-integration` acts as a dump for all cross-domain chatter. It requires a more granular subfolder taxonomy to separate standard REST API contracts from asynchronous events or MQTT physical protocols.

## 3. Required Refinements Evaluation
1. **Governance Placement:** 
   - *Decision:* **Embed inside module folders.** Module-specific rules belong inside the module (e.g., `05-room/governance`). Global thesis guidelines should be placed in a top-level `00-global` folder.
2. **Audit Documents Placement:**
   - *Decision:* **Embed inside module folders.** Module-specific audits (like `SPRING-ACCESS-05_API_And_Security_Audit_Report`) will be moved into an `audit` subdirectory inside their respective module folder. Global architecture audits will live in `00-global/audit`.
3. **Frontend Separation:**
   - *Decision:* **Split into two top-level categories.** `10-admin-web` and `11-student-mobile`. This acknowledges the distinct nature of the two frontend applications while keeping the taxonomy flat and simple.
   - *Structure:* Both frontend apps must standardize around specific subfolders: `architecture`, `ui`, `api-contract`, `implementation`, and `audit`.
4. **Integration Normalization:**
   - *Decision:* Define strict subfolders for `09-integration`: `event`, `mqtt`, `api-contract`, and `workflows`.

## 4. Proposed Taxonomy (SDMS Thesis Optimized)
- `00-global`: System-wide architecture, global audits, global thesis guidelines.
- `01-auth`: Authentication & authorization module.
- `02-student`: Student module.
- `03-room`: Room & accommodation module.
- `04-registration`: Registration & application module.
- `05-payment`: Financial and payment processing module.
- `06-smart-access`: Smart access module.
- `07-face`: AI face recognition module.
- `08-iot`: Physical hardware & IoT deployment specs.
- `09-integration`: Cross-module workflows and event mappings.
- `10-admin-web`: Frontend documentation for the Admin Web portal.
- `11-student-mobile`: Frontend documentation for the Student Mobile App.
- `12-devops`: CI/CD, deployment instructions, infrastructure.
- `13-archive`: Legacy, superseded, or obsolete documentation.

*(Note: Every backend module folder `01` through `08` is authorized to have standard subdirectories: `/architecture`, `/implementation`, `/audit`, and `/governance`)*

## 5. Folder Ownership Matrix
| Folder | Primary Owner | Secondary Owner |
| --- | --- | --- |
| `00-global` | Chief Documentation Architect | Lead Systems Architect |
| `01` to `08` (Backend Modules) | Module Lead Engineer | Domain Auditor |
| `09-integration` | Integration Engineer | Lead Systems Architect |
| `10-admin-web` | Frontend Web Lead | UX Designer |
| `11-student-mobile` | Mobile App Lead | UX Designer |
| `12-devops` | DevOps Engineer | Lead Systems Architect |
| `13-archive` | Chief Documentation Architect | - |

## 6. Migration Impact
- **Root Audit Files:** `BUILD-READINESS-01`, `SECURITY-TEST-REMEDIATION-01`, etc., will be moved to `00-global/audit/`.
- **Existing `docs/10-audit`:** Will be completely dismantled. Module-specific files will be distributed to their respective `docs/XX-module/audit/` folders. Global audits will go to `00-global/audit/`.
- **Existing `docs/11-legacy`:** Will simply be renamed to `docs/13-archive`.

## 7. Final Folder Tree (Preview)
```text
docs/
├── 00-global/
│   ├── architecture/
│   ├── audit/
│   └── governance/
├── 01-auth/
├── 02-student/
├── 03-room/
├── 04-registration/
├── 05-payment/
├── 06-smart-access/
│   ├── architecture/
│   ├── audit/
│   ├── implementation/
│   └── governance/
├── 07-face/
├── 08-iot/
├── 09-integration/
│   ├── api-contract/
│   ├── event/
│   ├── mqtt/
│   └── workflows/
├── 10-admin-web/
│   ├── api-contract/
│   ├── architecture/
│   ├── audit/
│   ├── implementation/
│   └── ui/
├── 11-student-mobile/
│   ├── api-contract/
│   ├── architecture/
│   ├── audit/
│   ├── implementation/
│   └── ui/
├── 12-devops/
└── 13-archive/
```

## Final Decision
**PASS WITH RECOMMENDATIONS**
The revised taxonomy correctly contextualizes the SDMS project as a Modular Monolith graduation thesis. It enhances developer ergonomics by keeping module-specific audits and governance directly next to the code architecture, while appropriately elevating the distinct frontends. The addition of strict subfolders for integrations and frontends prevents documentation sprawl.
