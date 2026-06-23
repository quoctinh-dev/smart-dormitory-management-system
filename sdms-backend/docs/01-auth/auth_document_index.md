# Auth Module Document Index

**Module Status**: **COMPLETE & VERIFIED**  
**Last Updated**: 2026-06-21  

This index catalogs all active documents representing the business rules, architecture, design specifications, and auditing trails of the Authentication & Authorization Module.

---

## 1. Active Design & Specifications

The following documents define the design, security configurations, and event integrations of the Auth module:

* **[auth_business_architecture.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/01-auth/auth_business_architecture.md)**
  * *Purpose*: Defines the bounded context, domain responsibilities, module boundaries, and external dependencies of the Auth module.
* **[auth_activation_workflow.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/01-auth/auth_activation_workflow.md)**
  * *Purpose*: Details the account activation sequence, moving from `PENDING_ACTIVATION` state via credential creation to `ACTIVE` state.
* **[auth_role_permission_model.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/01-auth/auth_role_permission_model.md)**
  * *Purpose*: Maps the security model, roles (`ADMIN`, `STAFF`, `STUDENT`), and specific Spring Security method level annotations.
* **[auth_event_integration.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/01-auth/auth_event_integration.md)**
  * *Purpose*: Details integration points using Spring Application Events (specifically listening to `PaymentSuccessEvent`).

---

## 2. Centralized Audits & Reviews

Per documentation governance rules, technical audits are centralized in the audit directory:

* **[auth_code_architecture_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/auth_code_architecture_audit.md)**
  * *Purpose*: Source-code verification validating boundaries, token activation rules, and JWT generation logic.

---

## 3. Cross-Module Dependencies

* **Upstream**: 
  * Student Module: Emits registration metadata.
  * Payment Module: Emits `PaymentSuccessEvent` which triggers account provisioning.
* **Downstream**:
  * Spring Security context checks utilized across Room and Application modules.
