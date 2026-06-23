# SDMS Database Evolution History

**Technical Role**: Lead Database Engineer  
**Status**: **FROZEN**  
**Last Updated**: 2026-06-21  

---

## 1. Executive Summary
This document provides a historical and technical trace of the Smart Dormitory Management System (SDMS) database evolution from V1 to V18. It categorizes the timeline into distinct developmental epochs and analyzes the objectives and ownership of every Flyway migration executed to date.

---

## 2. Evolution Timeline

### Epoch 1: Foundation
* **Migrations**: V1, V2, V3, V4
* **Objective**: Establish the core identity, application, and basic student tables. Introduced UUID standard and basic security fields.

### Epoch 2: Application
* **Migrations**: V5, V6, V10, V16
* **Objective**: Scale the dormitory application workflow, add registration periods, waiting lists, and support for admin modifications to active registrations.

### Epoch 3: Room
* **Migrations**: V7, V8, V9, V12, V17
* **Objective**: Build out the physical infrastructure model (Buildings, Floors, Rooms, Beds, Assignments) and refine constraints for capacity management.

### Epoch 4: Payment
* **Migrations**: V13, V18
* **Objective**: Introduce financial tracking, billing decoupled from room logic, and prepare constraints for SePay/VietQR gateway integration.

### Epoch 5: Future Expansion
* **Migrations**: V19+
* **Objective**: Anticipated integrations for Face AI, IoT, Utility Billing, and Maintenance.

---

## 3. Migration Matrix

| Migration | Business Objective | Technical Objective | Module Ownership | Current Status |
|:---|:---|:---|:---|:---|
| **V1** | Initialize core business schemas | Define `user_accounts`, `students`, `dormitory_applications` | Core/App | **ACTIVE** |
| **V2** | Support long-lived sessions | Add `refresh_token` to `user_accounts` | Auth | **ACTIVE** |
| **V3** | Support account recovery | Add `reset_password_token` | Auth | **ACTIVE** |
| **V4** | Support UI profiles | Add `avatar_url` to `students` | Student | **ACTIVE** |
| **V5** | Separate registration batches | Create `registration_periods`, `eligibilities` | Application | **ACTIVE** |
| **V6** | Prevent overlapping periods | Add `is_active` unique constraint | Application | **ACTIVE** |
| **V7** | Digitize physical dormitory | Create `buildings`, `floors`, `rooms`, `beds` | Room | **ACTIVE** |
| **V8** | (Reserved for assignment) | Placeholder for future expansion | Room | **OBSOLETE** |
| **V9** | Centralize fee logic | Remove `monthly_fee` from `rooms` | Room | **ACTIVE** |
| **V10** | Manage excess demand | Add `waiting_list_used`, `payment_deadline` | Application | **ACTIVE** |
| **V11** | Distributed background jobs | Add `shedlock` table for scheduler | Infra | **ACTIVE** |
| **V12** | Prevent double booking | Add active bed unique index | Room | **SUPERSEDED** (by V17) |
| **V13** | Track financial obligations | Create `bills`, `payments` | Payment | **ACTIVE** |
| **V14** | Heal migration chain | Placeholder to close V13-V15 gap | Infra | **PLACEHOLDER** |
| **V15** | Support biometric check-in | Add `face_image_url`, `is_face_registered` | Student | **ACTIVE** |
| **V16** | Complex application data | Add support for generated/priority docs | Application | **ACTIVE** |
| **V17** | Fix capacity constraints | Recreate indexes, add capacity checks | Room | **ACTIVE** |
| **V18** | Secure webhook integrity | Add `gateway_transaction_id` unique index | Payment | **ACTIVE** |

---

## 4. Lessons Learned
1. **Migration Immutability**: Placeholders (V8, V14) proved the value of never rewriting history in Flyway, preserving environment parity.
2. **Modular Independence**: Stripping fees from the Room module (V9) significantly simplified the Room boundary, delegating complexity to Payment.
3. **Index Iteration**: Replacing V12 with V17 highlighted the importance of partial indexes for state machines (like ignoring `CANCELLED` assignments).
