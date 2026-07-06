# Smart Access API & Workflow Documentation
## 1. Domain Overview
Smart Access module controls physical gate entry via Face Recognition (AI) and RFID cards (IoT). It also supports Admin remote operations (Remote Unlock, Emergency Lockdown).

## 2. Business Workflow
### 2.1 IoT Face Verification Flow (Online)
1. **IoT Device (ESP32)** captures face image and sends `POST /api/v1/smartaccess/verify/face`
2. **Backend (Face Module)** delegates image to Python AI Engine via REST.
3. Python returns vector embedding. pgvector computes Cosine Distance.
4. If matched, **Smart Access Module** evaluates policies: Curfew, Time Windows, Eligibility.
5. Record `AccessHistory`.
6. Return `GRANTED` or `DENIED` immediately to ESP32.

### 2.2 IoT RFID Verification Flow
1. **IoT Device** scans RFID and sends `POST /api/v1/smartaccess/verify/card`
2. Backend queries `EligibilityEvaluationService` for the RFID.
3. If active, publishes `IdentityVerifiedEvent`.
4. Event Listener triggers synchronous evaluation of policies.
5. Record `AccessHistory`.
6. ESP32 processes response.

### 2.3 Offline RFID Synchronization (MQTT Push)
1. When a student checks out OR a new RFID is assigned, backend triggers an Event.
2. `SmartAccessMqttListener` queries the latest active whitelist.
3. Publishes a JSON array to MQTT Topic `sdms/gates/system/whitelist`.
4. ESP32 listens, updates local flash memory for offline fallback.

### 2.4 Remote Unlock & Emergency Override
1. Admin triggers API to unlock a gate or lock down a building.
2. Database records the audit history with operator ID.
3. Event is published to `SmartAccessMqttListener`.
4. Listener sends MQTT command to `sdms/gates/{gateId}/command` or broadcast topic.
5. ESP32 acts immediately.

## 3. API Contracts (Admin Web)

### 3.1 Face Approval Management
- **`GET /api/v1/admin/faces/pending`**
  - View students waiting for face profile approval.
  - Returns paginated `FaceProfileSummaryResponse`.
- **`POST /api/v1/admin/faces/{profileId}/approve`**
  - Approve face registration.
- **`POST /api/v1/admin/faces/{profileId}/reject`**
  - Reject face registration with reason.

### 3.2 Access History & Diagnostics
- **`GET /api/v1/access/history`**
  - View paginated `AccessHistory` logs.
- **`GET /api/v1/access/history/student/{studentId}`**
  - View access history for a specific student.

### 3.3 Gate Control (Remote Unlock)
- **`POST /api/v1/access/gates/{gateId}/unlock`**
  - Unlock gate remotely.
  - Query Params: `buildingId`

### 3.4 Emergency Override
- **`POST /api/v1/access/emergency`**
  - Query Params: `actionType` (e.g., GLOBAL_LOCKDOWN), `reason`, `buildingId` (optional).

## 4. Authorization & RBAC
To keep the system architecture clean without a dynamic database-driven RBAC, the granular capabilities are statically mapped to system Roles within `UserAccount.java`.

### 4.1 ADMIN Role
Admins have full control over the Smart Access module.
- `MANAGE_CURFEW_POLICY`: Can create/update Curfew policies.
- `MANAGE_TIME_WINDOW_POLICY`: Can create/update Time Window policies.
- `VIEW_ACCESS_HISTORY`: Can view the Audit Log.
- `REMOTE_UNLOCK`: Can remotely unlock any gate.
- `EMERGENCY_OVERRIDE`: Can trigger system-wide lockdown or evacuation.

### 4.2 STAFF Role
Staff (Dormitory Managers/Receptionists) have limited operational access.
- `VIEW_ACCESS_HISTORY`: Can view the Audit Log to monitor student entries/exits.
- `REMOTE_UNLOCK`: Can remotely unlock a gate to assist students who lost their cards.
- **RESTRICTION**: Staff CANNOT trigger `EMERGENCY_OVERRIDE` or modify `POLICY` settings.
