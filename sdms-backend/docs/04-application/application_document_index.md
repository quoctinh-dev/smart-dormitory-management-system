# Application Module Document Index

**Module Status**: **COMPLETE & VERIFIED**  
**Last Updated**: 2026-06-21  

This index catalogs all active documents representing the business rules, domain architecture, specifications, and auditing trails of the Dormitory Application Module.

---

## 1. Active Design & Specifications

The following documents define the design, forms, rules, and domains of the Application module:

* **[application_form_business_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/application_form_business_design.md)**
  * *Purpose*: Specifies forms, student verification criteria, and metadata for applications.
* **[application_domain_model_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/application_domain_model_audit.md)**
  * *Purpose*: Maps the primary aggregate, state machine, and domain invariants of the application lifecycle.
* **[application_domain_architecture_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/application_domain_architecture_audit.md)**
  * *Purpose*: Defines modular layers, boundaries, and separation of concerns.
* **[application_service_workflow_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/application_service_workflow_audit.md)**
  * *Purpose*: Documents transactional workflows and validators.
* **[application_e2e_workflow_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/03-application/application_e2e_workflow_audit.md)**
  * *Purpose*: Charts the comprehensive end-to-end processing of applications.

---

## 2. System-wide Architecture Blueprints

* **[application_document_pdf_engine_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/09-architecture/application_document_pdf_engine_design.md)**
  * *Purpose*: Technical design of the centralized PDF rendering component for student verification documents.

---

## 3. Centralized Audits & Reviews

Per documentation governance rules, technical audits are centralized in the audit directory:

* **[application_service_implementation_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/application_service_implementation_audit.md)**
  * *Purpose*: Validates implementation details of the application submission and review services.
* **[application_code_reaudit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/application_code_reaudit.md)**
  * *Purpose*: Final architecture compliance audit verifying zero database/service leakage.
* **[application_api_controller_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/application_api_controller_audit.md)**
  * *Purpose*: Maps exposed REST controllers, request payloads, and security assertions.
* **[application_document_compliance_review.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/application_document_compliance_review.md)**
  * *Purpose*: Assesses legal document requirements and processing safety constraints.
* **[application_database_freeze_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/application_database_freeze_audit.md)**
  * *Purpose*: Verifies Flyway migrations and structural database schemas for applications.

---

## 4. Cross-Module Dependencies

* **Upstream**:
  * None (Application starts the resident registration funnel).
* **Downstream**:
  * Room Module: Consumes application details to check bed reservations.
  * Payment Module: Generates accommodation bills based on approved applications.
