# SDMS Database Future Roadmap

**Technical Role**: Lead Database Architect  
**Status**: **PLANNING**  
**Last Updated**: 2026-06-21  

---

## Face Recognition Integration

**Expected Tables**: `face_templates`  
**Ownership**: Face Module  
**FK Strategy**: `student_id` linked directly to `students` table.  
**Event Strategy**: `FaceRegisteredEvent` triggers the Face AI Module to sync embeddings to hardware edge nodes.  
**Migration Strategy**: V19 will introduce `face_templates` alongside modifications to `students.is_face_registered`.

---

## IoT Access Control

**Expected Tables**: `iot_devices`, `door_access_logs`  
**Ownership**: IoT Module  
**FK Strategy**: Devices link to `rooms(room_id)`. Access logs link to both `iot_devices` and `students(student_id)`.  
**Event Strategy**: `DoorUnlockedEvent` triggers background syncing and anomaly detection.  
**Migration Strategy**: V20 will add the core IoT tracking schema.

---

## Utility Billing (Electricity & Water)

**Expected Tables**: `utility_readings`, `utility_meters`  
**Ownership**: Payment & Room Modules (Shared Boundary)  
**FK Strategy**: Meters map to `rooms(room_id)`. Readings generate new `bills` rows (using the generalized Bill structure).  
**Event Strategy**: `UtilityReadingSubmittedEvent` triggers the Payment module to generate `BillType.ELECTRICITY` or `BillType.WATER`.  
**Migration Strategy**: V21 will introduce the metering tables; the `bills` table is already prepared to accept these new types.

---

## Maintenance Requests

**Expected Tables**: `maintenance_requests`, `maintenance_logs`  
**Ownership**: Infrastructure / Maintenance Module  
**FK Strategy**: Links to `rooms(room_id)` and `students(student_id)` (as reporter).  
**Event Strategy**: `MaintenanceCompletedEvent` notifies the Room module to update bed/room operational status if it was previously blocked.  
**Migration Strategy**: V22 will introduce the ticketing schema.

---

## Access Logs & Audit Trail

**Expected Tables**: `system_audit_logs`, `security_events`  
**Ownership**: Infrastructure / Security Module  
**FK Strategy**: Soft UUID references to avoid tightly coupling audit tables to business tables.  
**Event Strategy**: Centralized consumer listens to all domain events (e.g., `PaymentSuccessEvent`, `StudentCreatedEvent`) and sinks them to the log tables.  
**Migration Strategy**: V23 will introduce append-only audit tables.
