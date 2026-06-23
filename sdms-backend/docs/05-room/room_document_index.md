# Room Module Document Index

**Module Status**: **COMPLETE & VERIFIED**  
**Last Updated**: 2026-06-21  

This index catalogs all active documents representing the business rules, room capacity rules, allocation workflows, and auditing trails of the Room Module.

---

## 1. Active Design & Specifications

The following documents define the design, allocation policies, and event storms of the Room module:

* **[room_business_architecture_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/04-room/room_business_architecture_audit.md)**
  * *Purpose*: Defines boundaries, building-room hierarchies, and gender allocation constraints.
* **[room_domain_model_entity_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/04-room/room_domain_model_entity_audit.md)**
  * *Purpose*: Traces the relationship mapping for Buildings, Rooms, Beds, and Housing Assignments.
* **[room_service_workflow_design_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/04-room/room_service_workflow_design_audit.md)**
  * *Purpose*: Traces assignment transitions (`RESERVED`, `OCCUPIED`, `CHECKED_OUT`, `EXPIRED`).
* **[room_event_integration_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/04-room/room_event_integration_audit.md)**
  * *Purpose*: Catalogs event triggers including `BedReleasedEvent` and `CheckInCompletedEvent`.

---

## 2. Centralized Audits & Reviews

Per documentation governance rules, technical audits are centralized in the audit directory:

* **[room_code_based_e2e_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/room_code_based_e2e_audit.md)**
  * *Purpose*: Final architecture compliance audit verifying waiting list promotion separation, JPA transaction bounds, and event consumers.

---

## 3. Cross-Module Dependencies

* **Upstream**:
  * Application Module: Publishes approval status which initiates bed reservations.
  * Payment Module: Generates status changes (`PaymentSuccessEvent`) that authorize actual check-ins.
* **Downstream**:
  * Student Module: Triggers student profile updates upon check-in completion.
