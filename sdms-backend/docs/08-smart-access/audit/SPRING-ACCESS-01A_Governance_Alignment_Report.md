# SPRING-ACCESS-01A: Smart Access Governance Alignment Report

## 1. Executive Summary
This report audits the `SPRING-ACCESS-01` Code Implementation Blueprint against the frozen SDMS Governance rules. Several minor violations regarding Domain Ownership and Entity Attributes were identified and must be remediated before coding begins.

---

## 2. Governance Audits

### 1. ResidentType Enum
*   **Current Specification:** `BOARDING`, `NON_BOARDING`, `STAFF`, `GUEST`.
*   **Audit Result:** **FAIL** ❌
*   **Violation:** `STAFF` and `GUEST` are Identity Roles, not Resident Types. Mixing identity roles with dormitory residency status creates a semantic leak from the Core Identity module.
*   **Remediation:** Remove `STAFF` and `GUEST`. The correct enum for `ResidentType` must strictly be `BOARDING` (nội trú) and `NON_BOARDING` (ngoại trú).

### 2. CurfewPolicy Ownership
*   **Current Specification:** Attributes lack spatial association (applies globally).
*   **Audit Result:** **FAIL** ❌
*   **Violation:** Dormitory curfews are never global. Different buildings (e.g., Male vs. Female dorms, or Freshman vs. Senior buildings) have different policies.
*   **Remediation:** `CurfewPolicy` MUST contain a `buildingId` (UUID) reference. While the Smart Access module does not own the "Building" entity (Facility Module owns it), it must store this reference to evaluate which rule applies to which physical gate.

### 3. AccessHistory Ownership
*   **Current Specification:** Contains `snapshotUrl`.
*   **Audit Result:** **FAIL** ❌
*   **Violation:** Smart Access is purely a logical policy engine. It does not handle, store, or process media files. The snapshot taken during verification belongs exclusively to the **Face Module** (Verification History) or **IoT Module**.
*   **Remediation:** Remove `snapshotUrl` from the `AccessHistory` entity. `AccessHistory` should only store the logical outcome (`studentId`, `decision`, `gateId`, `timestamp`).

### 4. OverrideType Enum
*   **Current Specification:** `FIRE_EMERGENCY`, `MEDICAL_EMERGENCY`, `MAINTENANCE`, `SECURITY_LOCKDOWN`.
*   **Audit Result:** **FAIL** ❌
*   **Violation:** Frozen governance only supports standard, automated macroscopic overrides. Granular overrides like `MEDICAL_EMERGENCY` and `MAINTENANCE` imply complex workflow approvals that are beyond the scope of a fast-path access control system.
*   **Remediation:** Remove `MEDICAL_EMERGENCY` and `MAINTENANCE`. Retain only `FIRE_EMERGENCY` (forces all gates open) and `SECURITY_LOCKDOWN` (forces all gates closed).

---

## 3. Final Decision
**Status: WARNING (Remediation Required)** ⚠️

The blueprint contains domain leakage and ownership violations. I will immediately update `SPRING-ACCESS-01_Code_Implementation_Blueprint.md` to patch these 4 issues. Once patched, the Spring Boot team can proceed.
