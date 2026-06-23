> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# SDMS Security Requirement Analysis (v1.0)

## 1. Security Objectives
* **Identity Integrity:** Ensure that biometric data registered in the system unequivocally belongs to the verified student.
* **Data Confidentiality:** Protect sensitive biometric vectors and raw image data from unauthorized extraction or public exposure.
* **Availability Assurance:** Guarantee that dormitory access control fails securely (Fail-Closed) during system outages, preventing physical security breaches.

## 2. Security Assumptions
* The overarching SDMS infrastructure (e.g., Spring Security context, PostgreSQL database, MQTT Broker) is appropriately secured, firewalled, and patched against standard vulnerabilities.
* Communication channels between the Student App, IoT Gates, and SDMS Backend are secured via TLS/SSL.
* Staff and Administrator devices are trusted and protected by institutional endpoint security policies.

## 3. Security Constraints
* The Face Module MUST NOT own or evaluate authorization logic (`UserAccount.status` or `Student.status`); it is strictly constrained to identity matching.
* Biometric processing MUST occur asynchronously to prevent blocking critical database threads or degrading core SDMS performance.
* Re-registration and Revocation workflows MUST NOT perform hard deletions or overwriting of historical data, preserving auditability.

## 4. Security Boundaries
* **AI Processing Boundary:** The AI Engine is strictly a stateless processor. It processes frames and returns vectors but is bounded from persisting any student data or making access decisions.
* **Administrative Boundary:** Administrative overrides, approvals, and revocations are heavily bounded by `ADMIN` and `STAFF` roles, requiring explicit audit logging (`approvedBy`, `approvedAt`).
* **Hardware Boundary:** The IoT gate controllers cannot directly query the `pgvector` database; they are bounded to relying on the secure backend verification endpoints.

