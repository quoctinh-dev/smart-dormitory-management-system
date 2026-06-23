> [!WARNING]
> STATUS: APPROVED DESIGN
> Backend Implementation Pending

# FACE ↔ SMART ACCESS Architecture Alignment Report

## 1. Executive Summary
This document serves as the official remediation plan (FACE-REMEDIATION-01) to resolve all architecture conflicts between the Face Module and the Smart Access Module. A comprehensive review of `docs/06-face/` identified critical violations of the ACCESS Governance, specifically regarding the ownership of Access Decisions, Student Eligibility checks, and Access History. 

**Result: FAIL** - The current Face Module architecture documents violate the Modular Monolith Bounded Contexts. They incorrectly assign Access Decision and Authorization logic to the IoT Module and Face Module, bypassing the Smart Access Module.

The following remediation steps MUST be executed to align `docs/06-face/` with `docs/07-smart-access/` before proceeding with further implementation.

---

## 2. Identified Violations & Required Replacements

### 2.1 Violation: `face_integration_design.md`
* **Conflict Type:** Access Decision & IoT Authorization Violation
* **Current Statement (Section 5):**
  > "4. **IoT Module** consumes the success event. 5. IoT Module evaluates business authorization: `Student.status == ACTIVE` AND `UserAccount.status == ACTIVE`. 6. Only if both are `ACTIVE`, IoT Module publishes the `UNLOCK` command to the physical MQTT topic."
* **Why It Violates ACCESS Governance:** The IoT Module is performing Access Decision and Student Eligibility checks. Under SDMS Governance, the Smart Access Module is the ONLY owner of Access Decision and Student Eligibility. The IoT Module owns ONLY hardware execution (MQTT/Relay).
* **Required Replacement:** 
  > "4. **Face Module** publishes `IdentityVerifiedEvent(studentId)`. 5. **Smart Access Module** consumes this event, evaluates business authorization (`Student.status`, Curfew, Time Window), and publishes `AccessGrantedEvent`. 6. **IoT Module** consumes `AccessGrantedEvent` and publishes the `UNLOCK` command."

### 2.2 Violation: `face_domain_business_specification.md`
* **Conflict Type:** Access Decision & Access History Ownership Violation
* **Current Statement (Section 6 & 7):**
  > "FACE Module notifies IOT Module -> IOT Module publishes GATE_OPEN MQTT command -> IoT Module records SUCCESS log in GateAccessLog"
  > "Every access attempt at the gate registers a record in `gate_access_logs`"
* **Why It Violates ACCESS Governance:** The flow completely bypasses the Smart Access Module. Furthermore, `gate_access_logs` implies the IoT Module owns the history ledger, which violates the rule that Smart Access is the ONLY owner of Access History.
* **Required Replacement:** 
  > Modify Section 6 to route through Smart Access: "FACE Module notifies Smart Access Module (`IdentityVerifiedEvent`) -> Smart Access evaluates policies and records `AccessHistory` -> Smart Access notifies IoT Module (`AccessGrantedEvent`) -> IoT Module publishes MQTT command."
  > Modify Section 7 to remove `gate_access_logs` and explicitly state that Access History is managed by the Smart Access Module (`access_history`), while Face Module only logs `FaceVerificationHistory`.

### 2.3 Violation: `face_database_domain_design.md`
* **Conflict Type:** Access History Ownership Violation
* **Current Statement (Section 2 & 9 & 10):**
  > "IOT | GateDevice, GateAccessLog | deviceId, logId, accessedAt, confidence"
  > "Every gate entry attempt is recorded in GateAccessLog (owned by IoT Module)"
* **Why It Violates ACCESS Governance:** The IoT Module cannot own access logs. Smart Access is the ONLY owner of `AccessHistory`.
* **Required Replacement:** 
  > Remove `GateAccessLog` from the IoT Module in the Domain Boundary Matrix. Explicitly delegate `AccessHistory` to the Smart Access Module. Update the ERD in Section 10 to point to `access_history` (Smart Access Module).

### 2.4 Violation: `face_database_domain_design.md`
* **Conflict Type:** Access Decision Violation
* **Current Statement (Section 7):**
  > "Match Result (Cosine Similarity >= 0.8) -> Gate Unlock Command (MQTT)"
* **Why It Violates ACCESS Governance:** This flow diagram skips the Smart Access Module's policy evaluation (Curfew, Time Window, Student Status).
* **Required Replacement:** 
  > Update flow: "Match Result -> `IdentityVerifiedEvent` -> Smart Access Module (Policy Evaluation) -> `AccessGrantedEvent` -> Gate Unlock Command (MQTT)".

### 2.5 Violation: `face_database_domain_design.md`
* **Conflict Type:** Student Status & IoT Authorization Violation
* **Current Statement (Section 8):**
  > "3. IoT Module consumes event, checks if the student's status is ACTIVE... 5. IoT Module records the access attempt in GateAccessLog."
* **Why It Violates ACCESS Governance:** The IoT Module is performing Student Status checks and recording history.
* **Required Replacement:** 
  > "3. Smart Access Module consumes `IdentityVerifiedEvent`, evaluates `Student.status`, Curfew, and Time Window. 4. Smart Access Module publishes `AccessGrantedEvent` and records `AccessHistory`. 5. IoT Module consumes `AccessGrantedEvent` and publishes the MQTT command."

### 2.6 Violation: `face_service_api_design.md`
* **Conflict Type:** Access Decision Violation
* **Current Statement (Section 1.3):**
  > The response body for `/api/v1/iot/gates/{deviceId}/verify` returns `"accessGranted": true`.
* **Why It Violates ACCESS Governance:** The Face module API is determining the final `accessGranted` state. The Face module only owns Face Verification, not the final Access Decision.
* **Required Replacement:** 
  > Change the response payload to only return verification state. Replace `"accessGranted": true` with `"identityVerified": true` (and include `studentId` / `confidenceScore`).

### 2.7 Violation: `face_ai_integration_contract.md`
* **Conflict Type:** Access Decision & Student Status Violation
* **Current Statement (Section 9):**
  > "The business logic of gate opening is strictly kept in the SDMS Spring Boot (IoT Module): 2. IoT Module queries Student.status... 3. IoT Module checks if UserAccount.status == ACTIVE."
* **Why It Violates ACCESS Governance:** The IoT Module is incorrectly designated as the owner of business logic and student eligibility.
* **Required Replacement:** 
  > "The business logic of gate opening is strictly kept in the SDMS Spring Boot (Smart Access Module): 2. Smart Access Module queries Student.status, UserAccount.status, Curfew, and Time Window. 3. Access is orchestrated via `AccessGrantedEvent` sent to the IoT Module."

---

## 3. Action Plan
No new architecture or databases should be created. The documents listed above MUST be updated exactly as specified in the "Required Replacement" sections to achieve compliance with ACCESS Governance.

