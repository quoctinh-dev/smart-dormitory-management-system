> [!WARNING] 
> STATUS: PLANNED (Not Implemented)

# FACE-BACKEND-03A: Database Design Remediation

## 1. Executive Summary
This document serves as an official remediation audit for `FACE-BACKEND-03`. It executes five critical architectural fixes to eliminate duplicated states, prevent out-of-bounds data ownership, and keep the Face Module's database design strictly within the scope of SDMS V1. No SQL or application code is generated in this phase.

## 2. Remediation Execution

### FIX 1: IoT Boundary Enforcement
- **Action**: Removed `capture_image_url` from the `FaceVerificationAttempt` entity.
- **Reason**: The Face Module performs biometric math; it does **not** own camera frames or physical security data. Camera images produced during gate scans fall strictly under the jurisdiction of the **IoT Module** or a dedicated **Security Investigation** process.

### FIX 2: AI Scope Limitation (SDMS V1)
- **Action**: Removed `model_version` from the `FaceEmbedding` entity.
- **Reason**: SDMS V1 deploys exactly one AI model pipeline. Implementing a model version registry constitutes over-engineering for the current phase and introduces unnecessary complexity.

### FIX 3: Elimination of Duplicated State
- **Action**: Aborted the proposal to add `is_face_registered` to the core `students` table.
- **Reason**: Maintaining `is_face_registered` alongside `face_profiles.status` creates duplicated state. The registration status must be dynamically derived directly from `face_profiles.status` as the single source of truth. The frontend will query this state via `GET /api/v1/student/face/profile`.

### FIX 4: Explicit Business Constraint
- **Action**: Promoted the `UNIQUE` constraint on `face_profiles.student_id` to an official, database-level business constraint.
- **Reason**: Guarantees absolute structural integrity where 1 Student can have a maximum of 1 Face Profile (the `1:0..1` cardinality).

### FIX 5: Flyway Scope Containment
- **Action**: Purged all `DROP COLUMN` and `ALTER TABLE` execution directives from the Migration Strategy section.
- **Reason**: The current phase is strictly dedicated to logical/physical Database Design. The execution of DDL (Data Definition Language) and table mutations belongs entirely to a later Flyway implementation phase.

## Final Decision
**PASS**
All remediation requirements have been cleanly applied. The database design is now perfectly aligned with SDMS V1 constraints and governance boundaries.
