# SPRING-IMPLEMENTATION-07: Controller & Security Implementation Audit

## 1. Executive Summary
This document provides the final specification for the HTTP Controller Layer and API Security Rules of the Smart Access module. It guarantees absolute compliance with `AC-15A` Zero Trust authorization, standardizes the DTO boundaries, and translates architectural fail-closed rules into precise Spring Boot configurations.

---

## 2. API & Controller Specifications

### 1. `CurfewPolicyController` & `TimeWindowPolicyController`
*   **Base Paths:** `/api/v1/access/curfew-policies` and `/api/v1/access/time-window-policies`
*   **Responsibility:** CRUD operations are strictly separated by resource type.
*   **Security:** `@PreAuthorize("hasAuthority('MANAGE_CURFEW_POLICY')")` and `@PreAuthorize("hasAuthority('MANAGE_TIME_WINDOW_POLICY')")` respectively.
*   **Endpoints:**
    *   `POST /` (Create new policy)
    *   `PUT /{id}/status` (Soft delete via `isActive = false`)

### 2. `AccessHistoryController`
*   **Base Path:** `/api/v1/access/history`
*   **Responsibility:** Read-only access to the physical entry audit logs.
*   **Security:** `@PreAuthorize("hasAuthority('VIEW_ACCESS_HISTORY')")`
*   **Endpoints:**
    *   `GET /` (Must require Spring Data `Pageable` parameters. No "fetch all" allowed).
    *   `GET /student/{studentId}` (Filtered pagination).

### 3. `RemoteUnlockController`
*   **Base Path:** `/api/v1/access/gates/{gateId}/unlock`
*   **Responsibility:** Allow authorized personnel (e.g., Security Guards) to manually unlock a specific gate, bypassing time constraints.
*   **Security:** `@PreAuthorize("hasAuthority('REMOTE_UNLOCK')")`
*   **Endpoints:**
    *   `POST /` (Extracts `operatorId` from JWT for audit logging).

### 4. `EmergencyOverrideController`
*   **Base Path:** `/api/v1/access/emergency`
*   **Responsibility:** Trigger global building lockdown or evacuation.
*   **Security:** `@PreAuthorize("hasAuthority('EMERGENCY_OVERRIDE')")`
*   **Endpoints:**
    *   `POST /` (Requires explicit `EmergencyActionType` in payload).

---

## 3. Security & Validation Rules

### 1. Permission Catalog (AC-15A Compliance)
The system fundamentally rejects generic roles. Every endpoint must map to a specific capability.
*   `REMOTE_UNLOCK`
*   `VIEW_ACCESS_HISTORY`
*   `MANAGE_CURFEW_POLICY`
*   `MANAGE_TIME_WINDOW_POLICY`
*   `EMERGENCY_OVERRIDE`

### 2. DTO Inventory & Validation
*   **`CurfewPolicyCreateRequest`:**
    *   `@NotNull UUID buildingId`
    *   `@NotNull ResidentType residentType`
    *   `@NotNull LocalTime startTime`
    *   `@NotNull LocalTime endTime`
    *   `@Min(0) Integer priority`
*   **`EmergencyOverrideRequest`:**
    *   `@NotNull EmergencyActionType actionType` (`OPEN_ALL`, `LOCK_ALL`)
    *   `@NotBlank String reason`
    *   `UUID buildingId` (Optional: If `NULL` = Global override, if `NOT NULL` = Building-scoped override).
*   **`AccessHistoryResponse`:**
    *   Masks internal DB IDs if necessary, exposes `eventTimestamp` and `decision`. Does NOT include biometric failure details (governance dictates this belongs to the Face Module).

### 3. Validation Rules (JSR-380)
*   **Time Range Validation:** The system strictly supports **Overnight Windows** (e.g., 22:00 $\rightarrow$ 05:00). Validation logic must explicitly allow `endTime < startTime` for cross-day curfews. Basic JSR-380 (`@NotNull`) is used for presence checks, but a custom class-level validator (`@ValidTimeRange`) must be implemented to ensure `startTime != endTime` while correctly handling overnight scenarios.

### 4. Error Response Strategy (Global Exception Handler)
*   **`401 Unauthorized`:** Missing or invalid JWT token.
*   **`403 Forbidden`:** Valid JWT, but lacks the specific capability (e.g., has `VIEW_ACCESS_HISTORY` but tried to `POST /api/v1/access/emergency`).
*   **`404 Not Found`:** Target gate or policy UUID does not exist.
*   **`409 Conflict`:** Business rule clash (e.g., attempting to create a curfew policy that perfectly overlaps an existing one, or unlocking a gate already in `LOCK_ALL` emergency state).
*   **`422 Unprocessable Entity`:** Payload validation failure (e.g., `priority` is negative).
*   **`500 Internal Server Error`:** Fallback for unhandled exceptions (Fail Closed).

---

## 4. Verification & Audit

*   **AC-15A Compliance:** Verified. Declarative `@PreAuthorize` annotations are mapped perfectly to granular capabilities.
*   **No Role Dependency:** Verified. Terms like `ADMIN` or `GUARD` do not exist in the Spring Boot security expressions.
*   **Input Validation:** DTOs are strongly typed and protected by standard validation bounds.
*   **Audit Logging:** Controllers dynamically extract the Subject (`sub`) from the JWT context to accurately log the `operatorId` during `RemoteUnlock` and `EmergencyOverride` operations.
*   **Controller Ownership:** The API is highly cohesive. Controllers act purely as HTTP Adapters, delegating all complex logic to the Service Layer.
*   **Security Boundary:** The API endpoints do not expose direct MQTT calls or AI biometric endpoints, strictly maintaining the Modular Monolith encapsulation.

---

## FINAL DECISION
**Status: PASS** ✅

The Controller and Security layer blueprint is impenetrable. It seamlessly integrates Identity/JWT claims with the Smart Access business rules, exposing a secure, predictable, and fully audited REST API. The backend team is cleared to generate the Spring Boot Controller and DTO classes.
