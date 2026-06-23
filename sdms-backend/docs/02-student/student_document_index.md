# Student Module Document Index

**Module Status**: **COMPLETE & VERIFIED**  
**Last Updated**: 2026-06-21  

This index catalogs all active documents representing the business rules, architecture, design specifications, and auditing trails of the Student Module.

---

## 1. Active Design & Specifications

The following documents define the design, life cycle, face biometrics, and event integrations of the Student module:

* **[student_business_architecture.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/02-student/student_business_architecture.md)**
  * *Purpose*: Outlines the Student Bounded Context, core entity responsibilities, boundaries, and dependencies.
* **[student_lifecycle_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/02-student/student_lifecycle_design.md)**
  * *Purpose*: Traces the resident lifecycle transitions from `PENDING_CHECKIN` to `ACTIVE`, `GRADUATED`, and `INACTIVE`.
* **[student_face_registration_design.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/02-student/student_face_registration_design.md)**
  * *Purpose*: Specifies demographic and biometric fields, including facial recognition registration (`faceImageUrl` and `isFaceRegistered` flags).
* **[student_event_integration.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/02-student/student_event_integration.md)**
  * *Purpose*: Details listening to `CheckInCompletedEvent` to trigger account activation workflows and student status synchronization.

---

## 2. Centralized Audits & Reviews

Per documentation governance rules, technical audits are centralized in the audit directory:

* **[student_code_architecture_audit.md](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/docs/10-audit/student_code_architecture_audit.md)**
  * *Purpose*: Code-based architecture audit validating boundary constraints, lifecycle changes, events, and image registration properties.

---

## 3. Cross-Module Dependencies

* **Upstream**:
  * Room Module: Emits `CheckInCompletedEvent` to activate the student record.
* **Downstream**:
  * Face Module: Consumes registered image templates for biometric validation.
  * IoT Module: Syncs active student face templates to gateway devices.
