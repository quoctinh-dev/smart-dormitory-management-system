# SDMS BUSINESS FLOW GUIDE
**Version:** 1.0 · **Date:** 2026-06-22

This document traces the exact end-to-end business flows within the SDMS platform.

---

## 1. STUDENT JOURNEY (END-TO-END)
1. **Eligibility Check:** Student checks if their CCCD is eligible (if period is restricted).
2. **Draft Application:** Student creates a draft application without needing an account.
3. **Document Upload:** Student uploads proof documents for priority scoring (e.g., Poor Household certificate).
4. **Submit Application:** Student submits the application for Admin review.
5. **Review Period:** Student checks status via the Public Web Portal (`/status` page).
6. **Payment:** Once Approved, application enters `WAITING_PAYMENT`. Student views the generated bill and makes payment.
7. **Activation:** After payment, the student's assignment becomes `OCCUPIED`. The student activates their account using their email and CCCD as a temporary password.
8. **Face Registration:** Student logs in and uploads their face photo for smart gate access.
9. **Dormitory Life:** Student accesses the dormitory via Smart Gates (Face/RFID) evaluated against curfew rules.

## 2. ADMIN JOURNEY (END-TO-END)
1. **Setup:** Admin logs in to Web Portal. Creates a Registration Period and imports the eligible student list via Excel.
2. **Application Review:** Admin views the `Application Review Queue`. Reviews documents, checks priority scores. Admin can:
   - **Approve:** Creates assignment and bill.
   - **Reject:** Closes application.
   - **Request Revision:** Sends back to student for document fix.
3. **Face Approval:** Admin views `Face Approval Queue`. Approves clear face photos, triggering the AI embedding pipeline.
4. **Operations:** Admin monitors Room Dashboard for occupancy. Records manual payments. Handles physical Check-in/Check-out.

## 3. APPLICATION LIFECYCLE
```
[DRAFT] ← Student creating application, uploading documents
   │
   v (Submit)
[PENDING] ← Waiting for Admin Review
   │
   ├──> (Approve) ────────────> [WAITING_PAYMENT] 
   │                                  │
   │                                  v (Payment Confirmed)
   │                              [PAID] (Assignment becomes OCCUPIED)
   │
   ├──> (Reject) ─────────────> [REJECTED]
   │
   ├──> (Request Revision) ───> [REQUEST_REVISION] → (Student Resubmits) → [PENDING]
   │
   └──> (No Beds Available) ──> [WAITING_LIST]
                                      │
                                      v (Beds free up / Job runs)
                                [WAITING_PAYMENT]
```

## 4. ROOM ASSIGNMENT LIFECYCLE
Assignments link a Student/Application to a Bed.
```
[RESERVED] ← Application Approved. Waiting for payment.
   │
   ├──> (Payment Confirmed + Check In)
   │    [OCCUPIED]
   │       │
   │       v (Student leaves / Check Out)
   │    [TERMINATED]
   │
   └──> (Bill Expires / 3 days unpaid)
        [CANCELLED] → Bed becomes AVAILABLE again.
```

## 5. PAYMENT LIFECYCLE
```
[UNPAID] ← Generated automatically when assignment is RESERVED.
   │
   ├──> (Payment Processed)
   │    [PAID]
   │
   └──> (Due Date Passed)
        [OVERDUE] → Triggers Assignment Cancellation
```

## 6. SMART ACCESS LIFECYCLE (GATE ENTRY)
1. **Trigger:** Student stands at gate. ESP32 captures frame or scans RFID.
2. **Transmission:** ESP32 publishes MQTT message `sdms/gate/{gateId}/verify` to Backend.
3. **Evaluation:**
   - Idempotency check (`processed_messages`).
   - Is student an active resident (`OCCUPIED`)?
   - Is there an active `curfew_policy` blocking entry?
   - (If Face) Does the AI service return a cosine similarity score below the acceptance threshold?
4. **Decision:** Backend decides `GRANTED` or `DENIED`.
5. **Logging:** Backend writes to `access_history` (append-only ledger).
6. **Command:** Backend publishes `sdms/gate/{gateId}/decision`. ESP32 triggers relay to open door.
