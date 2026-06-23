# SDMS Document Repository Audit & Reorganization Report

**Technical Role**: Technical Governance Officer | Lead Systems Architect | Documentation Custodian  
**Status**: **PASS**  
**Audit Context**: Global Documentation Structure Reorganization and Governance Audit for the SDMS Project

---

## 1. Executive Summary

This report performs the comprehensive audit and reorganization design of the SDMS documentation repository under checkpoint **SDMS-DOC-01**. 

As the project has progressed through several modules (Auth, Student, Application, and Room), multiple intermediate plans, legacy specs, and duplicate re-audits have accumulated. This audit scans all active markdown files, classifies their status, designs a clean, modular documentation hierarchy, and maps every file to a recommended new structure.

---

## 2. Document Classification Matrix

The table below lists all markdown files in the repository, mapping them to their primary functional domain, document type, and operational status (`ACTIVE`, `LEGACY`, `DUPLICATE`, `DEPRECATED`):

| File Name | Document Type | Module / Domain | Status | Description |
| :--- | :--- | :--- | :--- | :--- |
| `analysis_results.md` | Audit Summary | Cross-Module | **ACTIVE** | Active master audit log tracking overall SDMS status. |
| `commitment_rules_master.md` | Business Rules | Application | **ACTIVE** | Rules specifying priority score matrices and constraints. |
| `priority_category_business_matrix.md` | Business Rules | Application | **ACTIVE** | Reference matrix for priority allocation rules. |
| `business/business-core-freeze-v1.md` | Business Rules | Cross-Module | **ACTIVE** | Master frozen context rules of the SDMS project. |
| `DATABASE_DESIGN.md` | Database Design | Auth (Phase 1) | **LEGACY** | Database schema design for Phase 1. |
| `FRONTEND_API_GUIDE.md` | API Specs | Auth (Phase 1) | **LEGACY** | Front-end controller guide for Phase 1. |
| `PROJECT_STATUS_REPORT.md` | Progress Report | Auth (Phase 1) | **LEGACY** | Status report for Phase 1. |
| `auth_business_architecture.md` | Architecture | Auth (Final) | **ACTIVE** | Master business & boundaries of the Auth module. |
| `auth_activation_workflow.md` | Workflow Design | Auth (Final) | **ACTIVE** | Account activation and temp password workflow. |
| `auth_role_permission_model.md` | Permission Model | Auth (Final) | **ACTIVE** | Role-based authorization and security annotations. |
| `auth_event_integration.md` | Integration Design | Auth (Final) | **ACTIVE** | Decoupled event triggers for account provisioning. |
| `auth_code_architecture_audit.md` | Audit Report | Auth (Final) | **ACTIVE** | Code-based validation of the Auth module. |
| `student_business_architecture.md` | Architecture | Student | **ACTIVE** | Master business & boundaries of the Student module. |
| `student_lifecycle_design.md` | Lifecycle Design | Student | **ACTIVE** | Demographic and status lifecycle of residents. |
| `student_face_registration_design.md` | Biometric Design | Student | **ACTIVE** | Facial registration and templates integration. |
| `student_event_integration.md` | Integration Design | Student | **ACTIVE** | Check-in event listening and transaction scope. |
| `student_code_architecture_audit.md` | Audit Report | Student | **ACTIVE** | Code-based validation of the Student module. |
| `application_business_gap_analysis.md`| Gap Analysis | Application | **LEGACY** | Early gap analysis for Application module. |
| `application_legacy_knowledge_extraction.md`| Knowledge Extract | Application | **LEGACY** | Extract of legacy systems database rules. |
| `application_form_business_design.md` | Business Design | Application | **ACTIVE** | UI forms and candidate metadata design. |
| `application_document_pdf_engine_design.md`| Service Design | Application | **ACTIVE** | PDF Generation engine architecture. |
| `application_domain_model_audit.md` | Domain Model | Application | **ACTIVE** | Domain entity relationships and attributes. |
| `application_database_freeze_audit.md` | Database Audit | Application | **ACTIVE** | SQL migration validations. |
| `application_database_audit.md` | Database Audit | Application | **DUPLICATE**| Superseded by `application_database_freeze_audit.md`. |
| `application_domain_architecture_audit.md`| Architecture | Application | **ACTIVE** | Architectural layers and boundaries. |
| `application_workflow_audit.md` | Business Flow | Application | **LEGACY** | Intermediate workflow audit. |
| `application_e2e_workflow_audit.md` | E2E Audit | Application | **ACTIVE** | Final E2E workflow audit. |
| `application_service_workflow_audit.md`| Service Audit | Application | **ACTIVE** | Service layer transactions and validations. |
| `application_service_implementation_plan.md`| Progress Plan | Application | **DEPRECATED**| Old implementation roadmap. |
| `application_entity_migration_correction_plan.md`| Progress Plan | Application | **DEPRECATED**| Intermediate correction plan. |
| `application_service_implementation_audit.md`| Service Audit | Application | **ACTIVE** | Service implementations code verification. |
| `application_code_implementation_audit.md`| Code Audit | Application | **LEGACY** | Early code implementations audit. |
| `application_code_reaudit.md` | Code Audit | Application | **ACTIVE** | Final code implementation re-audit. |
| `application_document_compliance_review.md`| Compliance Report | Application | **ACTIVE** | Legal document compliance verification. |
| `application_api_controller_audit.md` | API Audit | Application | **ACTIVE** | Spring controllers and request endpoints audit. |
| `room_business_architecture_audit.md` | Business Audit | Room | **ACTIVE** | Room business rules, capacity, gender policies. |
| `room_domain_model_entity_audit.md` | Domain Audit | Room | **ACTIVE** | Entity structures of Building, Room, Bed, Assignment. |
| `room_service_workflow_design_audit.md`| Service Design | Room | **ACTIVE** | Service workflows and validation layers. |
| `room_event_integration_audit.md` | Event Design | Room | **ACTIVE** | Event storming catalog and transaction boundaries. |
| `room_e2e_audit.md` | E2E Audit | Room | **DUPLICATE**| Conceptual E2E audit, superseded by code-based audit. |
| `room_code_implementation_audit.md` | Code Audit | Room | **LEGACY** | Code implementation audit from Phase 4. |
| `room_code_based_e2e_audit.md` | E2E Audit | Room | **ACTIVE** | Final E2E code re-audit (ROOM-05C). |
| `payment_domain_freeze_audit.md` | Domain Audit | Payment | **ACTIVE** | Conceptual payment domain context design. |
| `payment_lifecycle_design_audit.md` | Lifecycle Audit | Payment | **ACTIVE** | Bill status and transaction lifecycle. |
| `payment_architecture_audit.md` | Audit Design | Payment | **ACTIVE** | Gateway integration design. |
| `payment_gateway_webhook_design.md` | Webhook Design | Payment | **ACTIVE** | Payment webhook API specs. |
| `payment_service_refactor_design.md` | Service Design | Payment | **ACTIVE** | Payment service architecture. |
| `face_domain_business_specification.md` | Business Specs | Face AI | **ACTIVE** | Face matching business specifications. |
| `face_database_domain_design.md` | Database Specs | Face AI | **ACTIVE** | Vector storage schema specification. |
| `face_service_api_design.md` | API Specs | Face AI | **ACTIVE** | API contract and web service specification. |
| `face_ai_integration_contract.md` | API Contract | Face AI | **ACTIVE** | IoT face validation contract. |

---

## 3. Recommended SDMS Folder Hierarchy

We propose reorganizing the flat `docs/` repository into 12 structured directories. This isolates modules, splits design specs from code audits, and moves older, superseded reports into a legacy archive:

```
docs/
├── 00-overview/                   # System-level guides, master rules, status reports
├── 01-auth/                       # Authentication and authorization module design
├── 02-student/                    # Student demographic and biometric profile module design
├── 03-application/                # Dormitory application review and document upload module
├── 04-room/                       # Room, building, bed allocation, and assignments module
├── 05-payment/                    # Bills, gateway integrations, and webhooks module
├── 06-face/                       # Face AI engine contracts, APIs, and vector databases
├── 07-iot/                        # Smart door locking, gate controllers, and local cache specs
├── 08-integration/                # System-wide context maps and E2E event integration catalogs
├── 09-architecture/               # Core design documents (PDF engine, security, deployment)
├── 10-audit/                      # Technical compliance, security re-audits, controller audits
└── 11-legacy/                     # Archived Phase 1 documents, duplicates, and superseded plans
```

---

## 4. Migration Mapping Plan

The matrix below maps every existing file to its recommended target folder under the new documentation structure:

| Current File Location | Recommended New Location | Reason |
| :--- | :--- | :--- |
| `analysis_results.md` | `docs/00-overview/analysis_results.md` | Master status tracker. |
| `business/business-core-freeze-v1.md` | `docs/00-overview/business-core-freeze-v1.md` | Project-wide business freeze context. |
| `commitment_rules_master.md` | `docs/00-overview/commitment_rules_master.md` | Project-wide business rules. |
| `priority_category_business_matrix.md` | `docs/00-overview/priority_category_business_matrix.md` | Project-wide business rules. |
| `docs/auth/auth_business_architecture.md` | `docs/01-auth/auth_business_architecture.md` | Auth Business context. |
| `docs/auth/auth_activation_workflow.md` | `docs/01-auth/auth_activation_workflow.md` | Auth Workflow context. |
| `docs/auth/auth_role_permission_model.md`| `docs/01-auth/auth_role_permission_model.md` | Auth Security context. |
| `docs/auth/auth_event_integration.md` | `docs/01-auth/auth_event_integration.md` | Auth Integration context. |
| `docs/auth/auth_code_architecture_audit.md`| `docs/10-audit/auth_code_architecture_audit.md` | Technical audit report. |
| `docs/student/student_business_architecture.md`| `docs/02-student/student_business_architecture.md` | Student Business context. |
| `docs/student/student_lifecycle_design.md`| `docs/02-student/student_lifecycle_design.md` | Student Lifecycle context. |
| `docs/student/student_face_registration_design.md`| `docs/02-student/student_face_registration_design.md` | Student Biometric context. |
| `docs/student/student_event_integration.md`| `docs/02-student/student_event_integration.md` | Student Integration context. |
| `docs/student/student_code_architecture_audit.md`| `docs/10-audit/student_code_architecture_audit.md` | Technical audit report. |
| `application_form_business_design.md` | `docs/03-application/application_form_business_design.md` | Application form specs. |
| `application_domain_model_audit.md` | `docs/03-application/application_domain_model_audit.md` | Application domain model. |
| `application_domain_architecture_audit.md`| `docs/03-application/application_domain_architecture_audit.md` | Application layers. |
| `application_service_workflow_audit.md`| `docs/03-application/application_service_workflow_audit.md` | Application workflow services. |
| `application_e2e_workflow_audit.md` | `docs/03-application/application_e2e_workflow_audit.md` | Application E2E. |
| `application_service_implementation_audit.md`| `docs/10-audit/application_service_implementation_audit.md` | Code validation report. |
| `application_code_reaudit.md` | `docs/10-audit/application_code_reaudit.md` | Code validation report. |
| `application_api_controller_audit.md` | `docs/10-audit/application_api_controller_audit.md` | API controller audit. |
| `application_document_compliance_review.md`| `docs/10-audit/application_document_compliance_review.md` | Legal audit report. |
| `application_database_freeze_audit.md` | `docs/10-audit/application_database_freeze_audit.md` | DB validation report. |
| `application_document_pdf_engine_design.md`| `docs/09-architecture/application_document_pdf_engine_design.md` | PDF generator specs. |
| `application_business_gap_analysis.md`| `docs/11-legacy/application_business_gap_analysis.md` | Archived analysis. |
| `application_legacy_knowledge_extraction.md`| `docs/11-legacy/application_legacy_knowledge_extraction.md` | Archived extraction. |
| `application_database_audit.md` | `docs/11-legacy/application_database_audit.md` | Superseded database audit. |
| `application_workflow_audit.md` | `docs/11-legacy/application_workflow_audit.md` | Superseded workflow audit. |
| `application_service_implementation_plan.md`| `docs/11-legacy/application_service_implementation_plan.md` | Deprecated plan. |
| `application_entity_migration_correction_plan.md`| `docs/11-legacy/application_entity_migration_correction_plan.md` | Deprecated plan. |
| `application_code_implementation_audit.md`| `docs/11-legacy/application_code_implementation_audit.md` | Superseded code audit. |
| `docs/PHASE_1_FOUNDATION_AUTH/DATABASE_DESIGN.md`| `docs/11-legacy/DATABASE_DESIGN.md` | Archived Phase 1 design. |
| `docs/PHASE_1_FOUNDATION_AUTH/FRONTEND_API_GUIDE.md`| `docs/11-legacy/FRONTEND_API_GUIDE.md` | Archived Phase 1 guide. |
| `docs/PHASE_1_FOUNDATION_AUTH/PROJECT_STATUS_REPORT.md`| `docs/11-legacy/PROJECT_STATUS_REPORT.md` | Archived Phase 1 report. |
| `room_business_architecture_audit.md` | `docs/04-room/room_business_architecture_audit.md` | Room business context. |
| `room_domain_model_entity_audit.md` | `docs/04-room/room_domain_model_entity_audit.md` | Room domain entities. |
| `room_service_workflow_design_audit.md`| `docs/04-room/room_service_workflow_design_audit.md` | Room service workflow. |
| `room_event_integration_audit.md` | `docs/04-room/room_event_integration_audit.md` | Room event storming. |
| `room_e2e_audit.md` | `docs/11-legacy/room_e2e_audit.md` | Superseded conceptual audit. |
| `room_code_implementation_audit.md` | `docs/11-legacy/room_code_implementation_audit.md` | Superseded code audit. |
| `room_code_based_e2e_audit.md` | `docs/10-audit/room_code_based_e2e_audit.md` | E2E code audit (ROOM-05C). |
| `payment_domain_freeze_audit.md` | `docs/05-payment/payment_domain_freeze_audit.md` | Payment context. |
| `payment_lifecycle_design_audit.md` | `docs/05-payment/payment_lifecycle_design_audit.md` | Payment lifecycle. |
| `payment_architecture_audit.md` | `docs/05-payment/payment_architecture_audit.md` | Payment architecture. |
| `payment_gateway_webhook_design.md` | `docs/05-payment/payment_gateway_webhook_design.md` | Payment webhooks. |
| `payment_service_refactor_design.md` | `docs/05-payment/payment_service_refactor_design.md` | Payment refactor design. |
| `face_domain_business_specification.md` | `docs/06-face/face_domain_business_specification.md` | Face AI business specs. |
| `face_database_domain_design.md` | `docs/06-face/face_database_domain_design.md` | Face AI database. |
| `face_service_api_design.md` | `docs/06-face/face_service_api_design.md` | Face AI APIs. |
| `face_ai_integration_contract.md` | `docs/06-face/face_ai_integration_contract.md` | Face AI biometric contract. |

---

## 5. Duplicate, Superseded & Deprecated Reports detection
The audit has identified **7 files** that are duplicate, superseded, or deprecated. They should be archived under `docs/11-legacy/` during migration and excluded from active context scans:
1. `application_database_audit.md` (Superseded by `application_database_freeze_audit.md`)
2. `application_workflow_audit.md` (Superseded by `application_e2e_workflow_audit.md`)
3. `application_code_implementation_audit.md` (Superseded by `application_code_reaudit.md`)
4. `application_service_implementation_plan.md` (Deprecated by final service implementations)
5. `application_entity_migration_correction_plan.md` (Deprecated by final database validation)
6. `room_e2e_audit.md` (Superseded by `room_code_based_e2e_audit.md` containing refactored code-based evidence)
7. `room_code_implementation_audit.md` (Superseded by code-based re-audit)

---

## 6. Missing Documents
The following essential architectural blueprints are currently missing and should be generated to complete the SDMS handover package:
* `system_context_diagram.md` (High-level system block context and boundary integrations)
* `event_catalog.md` (Global Event Storming registry across all modules)
* `integration_architecture.md` (Inter-module transactional boundaries and decoupled listeners)
* `bounded_context_map.md` (DDD aggregates mapping and boundary guidelines)
* `deployment_architecture.md` (AWS/Postgres physical deployment architecture)
* `security_architecture.md` (JWT signatures, CORS, password reset token hashing security)

---

## 7. Migration Roadmap

```
[KEEP] ──────> 00-overview/, 01-auth/, 02-student/, 03-application/, 04-room/, 05-payment/, 06-face/ (Copy documents to target directories)
[MOVE] ──────> 10-audit/ (Relocate controller, service, database, and code implementation audits)
[ARCHIVE] ───> 11-legacy/ (Move Phase 1 documents and superseded/duplicate reports)
[DELETE] ────> (Zero files deleted; historical plans archived for audit trails)
```

---

## 8. Final Decision

**SDMS DOCUMENT ARCHITECTURE FROZEN**
