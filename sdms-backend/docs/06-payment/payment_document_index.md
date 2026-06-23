# Payment Module Document Index

**Module Status**: **DESIGN STAGE & AUDITED**  
**Last Updated**: 2026-06-21  

This index catalogs all active documents representing the domain model, database schema, business workflows, gateway specs, and architecture audits of the Payment Module.

---

## 1. Domain Specs & Database Designs

* **[payment_domain_model_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_domain_model_design_audit.md)**
  * *Purpose*: Defines entities (`Bill`, `Payment`), enum values, constraints, and database boundary checks.
* **[payment_database_flyway_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_database_flyway_design_audit.md)**
  * *Purpose*: Outlines the SQL schema columns, nullability constraints, indexing matrices, and migration paths.
* **[payment_method_gateway_separation_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_method_gateway_separation_design.md)**
  * *Purpose*: Separates Payment Method (CASH, BANK_TRANSFER) from Payment Gateway (NONE, SEPAY, MOMO, VNPAY) for domain clarity.
* **[payment_billing_generalization_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_billing_generalization_design_audit.md)**
  * *Purpose*: Specifies generalization strategies (room-level utilities & student-level penalties/deposits) via explicit nullable FK columns.
* **[payment_boundary_preservation_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_boundary_preservation_design_audit.md)**
  * *Purpose*: Evaluates Bounded Context boundary isolation, mapping the replacement of entity associations with plain UUID reference keys.
* **[payment_domain_freeze_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_domain_freeze_audit.md)**
  * *Purpose*: Business-level description of bounded contexts and payment context boundaries.
* **[payment_lifecycle_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_lifecycle_design_audit.md)**
  * *Purpose*: Traces payment state machines and transitions.

---

## 2. Webhook & Service Refactor specs

* **[payment_gateway_webhook_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_gateway_webhook_design.md)**
  * *Purpose*: Detailed API and callback payloads for VietQR and SePay webhooks.
* **[payment_service_refactor_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_service_refactor_design.md)**
  * *Purpose*: Refactoring proposals to separate service dependencies.
* **[payment_architecture_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/05-payment/payment_architecture_audit.md)**
  * *Purpose*: Explains integration layers and third-party gateway interactions.

---

## 3. Centralized Audits & Reviews

Per documentation governance rules, technical audits are centralized in the audit directory:

* **[payment_code_architecture_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/payment_code_architecture_audit.md)**
  * *Purpose*: Code-based audit reporting boundary leaks, direct repository calls, and correction guidelines.
* **[payment_boundary_refactor_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/payment_boundary_refactor_design_audit.md)**
  * *Purpose*: Conceptual refactoring mapping to cleanly establish event-driven boundaries.
