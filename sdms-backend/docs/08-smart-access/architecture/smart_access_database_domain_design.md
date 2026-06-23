# SDMS Smart Access Database Domain Design (v1.0)

## 1. Aggregate Ownership
The Smart Access Module owns the following Core Aggregates:
* **Access Policy Aggregate**: Controls all rules regarding when and who can enter specific zones.
* **Access History Aggregate**: The immutable ledger (Single Source of Truth) for every access attempt, decision, and override action.

It explicitly **DOES NOT OWN**:
* Demographic Data (`Student`, `UserAccount`) - Owned by Core Modules.
* Biometric Data (`FaceProfile`, `FaceEmbedding`) - Owned by Face Module.
* Hardware Topology (`IoT Devices`, `Gates`) - Owned by IoT Module.

## 2. Data Ownership
| Aggregate | Database Table | Primary Responsibility |
| :--- | :--- | :--- |
| AccessHistory | `access_history` | Logs every Granted, Denied, and Remote Unlock event. |
| Curfew Policy | `curfew_policies` | Defines lockdown hours per building. |
| Time Window Policy | `time_window_policies` | Defines valid access hours per Access Subject Type per building. |

## 3. Business Cardinality
* **Student $\leftrightarrow$ AccessHistory**: `1:N`. A student generates multiple access logs over time.
* **Building $\leftrightarrow$ Curfew Policy**: `1:N`. A building can have multiple curfew rules (e.g., Weekday vs Weekend, Holiday overrides).
* **Building $\leftrightarrow$ Time Window Policy**: `1:N`. Distinct windows apply per Access Subject Type (Student vs Guest vs Employee) within a building.

## 4. UUID Strategy
All tables within the Smart Access domain MUST use `UUID (v4)` as their Primary Keys (`access_id`, `curfew_id`, `time_window_id`). This complies with the SDMS global UUID standard to prevent enumeration attacks and support distributed architectures.

## 5. Foreign Key Strategy
Following the SDMS Modular Monolith rules:
* **Internal Relationships**: Hard Foreign Keys (`FOREIGN KEY (...) REFERENCES ...`) are used strictly WITHIN the Smart Access schema boundaries.
* **Cross-Module Relationships**: 
  - Soft UUID References are heavily encouraged for cross-module loosely coupled entities (e.g., referencing `device_id` of IoT Module).
  - Hard FKs to `students(student_id)` and `buildings(building_id)` are PERMITTED as long as they follow strict `ON DELETE RESTRICT` constraints to prevent accidental data cascades.

## 6. AccessHistory Ownership
The `access_history` table is entirely bounded to the Smart Access Module. It records the *Policy Decision* (GRANTED, DENIED) and the *Denial Reason* (e.g., `CURFEW_VIOLATION`, `ACCOUNT_LOCKED`). This is structurally isolated from `FaceVerificationHistory` which only stores AI confidence analytics.

## 7. Curfew Policy Ownership
The `curfew_policies` table stores locking rules.
Key attributes: `building_id`, `start_time`, `end_time`, `status` (ACTIVE/INACTIVE). 
The Smart Access Module uses this to evaluate rule AC-10.

## 8. Time Window Policy Ownership
The `time_window_policies` table stores role-based access hours.
Key attributes: `building_id`, `access_subject_type` (STUDENT, GUEST, EMPLOYEE), `start_time`, `end_time`. 
The Smart Access Module uses this to evaluate rule AC-11.

## 9. Remote Unlock Ownership
Remote Unlocks (AC-13) are recorded directly into `access_history`.
Key audit columns:
* `override_type`: e.g., `REMOTE_UNLOCK`, `EMERGENCY_FIRE`.
* `operator_id`: Soft UUID reference to the Admin/Security staff who initiated the unlock.
* `override_reason`: Text justification.

## 10. Retention Strategy (AC-14 Compliance)
* **Rule:** No rows in `access_history` shall ever be hard-deleted (`DELETE` statement is prohibited).
* **Strategy:** Historical data must be retained for auditing, security disputes, and legal compliance. To prevent database bloat, `access_history` should be partitioned by range (e.g., monthly: `access_history_2026_06`) using native PostgreSQL partitioning.

## 11. Database Boundary
The Smart Access schema exclusively serves the `SmartAccessService` and policy evaluators. No other module (including IoT or Face) is allowed to `INSERT` or `UPDATE` into `access_history` directly. They must publish an event or call a controlled internal API.

## 12. Cross-Module References
* **Student Module (`student_id`)**: Used to link an access attempt to a specific student. `ON DELETE RESTRICT`.
* **Room Module (`building_id`)**: Used to apply Curfew and Time Window policies. `ON DELETE RESTRICT`.
* **IoT Module (`device_id`)**: Used to log which physical gate was accessed. Recommended: Soft UUID Reference (no hard FK) to allow IoT devices to be physically replaced without cascading SQL errors.
