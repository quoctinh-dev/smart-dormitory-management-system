# SDMS Remote Unlock Operational Flow

## 1. Overview
The Remote Unlock feature allows authorized personnel to override the Smart Access system manually and open a specific gate.

## 2. Staff Remote Unlock
* **Trigger**: A receptionist or security staff member receives a visitor request.
* **Action**: They select the specific gate on the Web Dashboard and click "Unlock".
* **Validation**: Gateway verifies JWT `hasAuthority("REMOTE_UNLOCK")`.
* **Execution**: API calls `RemoteUnlockService`.

## 3. Admin Remote Unlock
* **Trigger**: System administrator overriding the system for maintenance.
* **Action**: Admin uses the Management Portal.
* **Validation**: Gateway verifies JWT `hasAuthority("REMOTE_UNLOCK")` AND optionally `hasAuthority("SYSTEM_ADMIN")`.

## 4. Approval Logic
* The Remote Unlock API executes synchronously.
* It does NOT evaluate Curfew or Time Window. It is an explicit override.
* It simply verifies the JWT permissions and the existence of the target `device_id`.

## 5. Audit Trail
* The action is persisted into the `access_history` table immediately.
* **Payload**:
  - `accessId`: New UUID.
  - `operatorId`: UUID extracted from JWT.
  - `deviceId`: The gate being unlocked.
  - `decision`: `GRANTED`.
  - `overrideType`: `REMOTE_UNLOCK`.
  - `overrideReason`: Provided by the operator (e.g., "Visitor entry").

## 6. Notification Flow
* After the transaction commits, `RemoteUnlockEvent` is published.
* **IoT Module** consumes and executes.
* **Notification Module** consumes and optionally sends an alert to the Head of Security or logs the action in the Security Audit channel.
