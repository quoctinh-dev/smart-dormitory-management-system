# SDMS Smart Access Runtime Architecture

## 1. Introduction
This document outlines the runtime flows of the Smart Access module. It serves as evidence for ACCESS-06.

## 2. Identity Verification Runtime Flow
* **IoT Edge Device (ESP32)** continuously streams frames or reads RFID cards.
* **Face Module/RFID Edge** processes the input asynchronously.
* **Result**: Face Module computes the vector and publishes an `IdentityVerifiedEvent` (or `IdentityFailedEvent`) to the Message Broker.

## 3. Smart Access Evaluation Runtime Flow
* **SmartAccessService** consumes the `IdentityVerifiedEvent` asynchronously.
* **Policy Engine** loads in-memory cached active `CurfewPolicy` and `TimeWindowPolicy` for the specific `building_id`.
* It verifies the `student_id` status (must be `ACTIVE`) via a decoupled query or cached profile.
* It evaluates the resident role against the time windows.

## 4. Access Granted Runtime Flow
* If evaluation passes, **SmartAccessService** persists a record (`GRANTED`) into `access_history`.
* Within the same transactional boundary (using `AFTER_COMMIT`), it publishes an `AccessGrantedEvent`.
* **IoT Module** consumes the event and sends an MQTT `RELAY_ON` command to the specific topic `gate/{deviceId}/command`.

## 5. Access Denied Runtime Flow
* If evaluation fails (e.g., Curfew Violation), the rejection reason is logged to `access_history` as `DENIED`.
* An `AccessDeniedEvent` is published `AFTER_COMMIT`.
* **Notification Module** consumes this event and triggers a push notification to the user's mobile app.

## 6. Remote Unlock Runtime Flow
* A Staff/Admin user invokes the REST API `/api/v1/access/remote-unlock`.
* Gateway verifies JWT and checks `hasAuthority("REMOTE_UNLOCK")`.
* **RemoteUnlockService** creates an `OVERRIDE` record in `access_history` with the `operator_id`.
* An `AFTER_COMMIT` event `RemoteUnlockEvent` is published.
* **IoT Module** consumes and triggers the gate.

## 7. Emergency Override Runtime Flow
* **Trigger Origin**: Emergency Override originates from a **Fire Alarm System** (via webhook) or an **Authorized Emergency Operator** (via Admin API).
* **Policy Bypass**: This flow immediately **bypasses all Curfew and Time Window policies** (AC-12).
* **EmergencyOverrideService** logs a mass override event to `access_history`.
* It publishes an `EmergencyOverrideEvent`.
* **IoT Module** consumes and broadcasts an MQTT `OPEN_ALL` message to all relevant gates.
