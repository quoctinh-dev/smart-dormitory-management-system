# SDMS Business Core Lifecycle Freeze (v1.0)

This document establishes the official business logic, state machines, and module responsibility matrix for the Smart Dormitory Management System (SDMS), focusing on Student onboarding, Account lifecycles, and Renewal flows.

---

## 1. Student Categories

SDMS handles three distinct categories of dormitory applicants:
* **Group A (Freshmen):** First-year students who have never resided in KTX and do not have an existing Student profile or UserAccount.
* **Group B (Older Students - New):** Sophomores, juniors, or seniors who have never resided in KTX and do not have an existing Student profile or UserAccount.
* **Group C (Returning Students):** Students who previously resided in KTX, already possess a Student profile and UserAccount, and have a historical stay record.

---

## 2. Core Business Rules

* **Rule 1 (Unified New Onboarding):** Group A and Group B follow the exact same onboarding flow (Registration $\rightarrow$ Approval $\rightarrow$ Payment $\rightarrow$ Profile Creation $\rightarrow$ Activation).
* **Rule 2 (Profile Reuse):** Group C must reuse their existing `Student` profile and `UserAccount`. Duplicate profiles or accounts are strictly forbidden.
* **Rule 3 (Public Entry):** Group A and Group B register through the **Public Web Portal**.
* **Rule 4 (Private Entry):** Group C applies for renewal through the authenticated **Student Mobile App**.
* **Rule 5 (Renewal Auto-fill):** For Group C applications, personal data is auto-filled from their existing `Student` profile, and PDF documents (Residency Agreement and Commitment Form) are auto-generated.
* **Rule 6 (Idempotent Creation):** Upon `PaymentSuccessEvent`:
  * If no `Student` profile exists for the CCCD $\rightarrow$ Create new `Student` (status = `PENDING_CHECKIN`).
  * If no `UserAccount` exists for the email $\rightarrow$ Create new `UserAccount` (status = `PENDING_ACTIVATION`).
  * If both already exist (Group C) $\rightarrow$ Reuse existing records, updating `Student` status to `PENDING_CHECKIN`.

---

## 3. Lifecycle State Machines

### 3.1 Dormitory Application Lifecycle
```
[SUBMITTED] ──(Admin Review)──> [UNDER_REVIEW]
                                    │
       ┌────────────────────────────┴───────────────────────────┐
       ▼                                                        ▼
[REVISION_REQUIRED] (Missing docs)                      [APPROVED] (Room Assigned)
       │                                                        │
       │ (Re-submit)                                            ▼
       └───────────────────────────────────────────────> [WAITING_PAYMENT] (3-Day Window)
                                                                │
                            ┌───────────────────────────────────┴──────────────────┐
                            ▼                                                      ▼
                   [EXPIRED] (No Payment)                               [APPROVED] (Paid & Completed)
```

### 3.2 Student Profile Status Lifecycle
* **Group A & B:** *None* $\rightarrow$ `PENDING_CHECKIN` (Paid) $\rightarrow$ `ACTIVE` (Checked-in) $\rightarrow$ `INACTIVE` (Checked-out)
* **Group C:** `INACTIVE`/`GRADUATED` $\rightarrow$ `PENDING_CHECKIN` (Paid) $\rightarrow$ `ACTIVE` (Checked-in) $\rightarrow$ `INACTIVE` (Checked-out)

### 3.3 UserAccount Status Lifecycle
* **Group A & B:** *None* $\rightarrow$ `PENDING_ACTIVATION` (Temporary Pass) $\rightarrow$ `ACTIVE` (Activated) $\rightarrow$ `LOCKED` (Suspended)
* **Group C:** `ACTIVE` (Stays active throughout the process, no activation required)

### 3.4 Student Housing Assignment Lifecycle
```
[RESERVED] (Approved & Assigned) ──(Success Payment)──> [RESERVED] (Student Linked)
                                                             │
                              ┌──────────────────────────────┴──────────────────────┐
                              ▼                                                     ▼
                     [CANCELLED] (Expired)                                 [OCCUPIED] (Checked-In)
                                                                                    │
                                                                                    ▼
                                                                           [CHECKED_OUT] (Checked-Out)
```

---

## 4. Module Responsibility Matrix

| Module | Primary Domain Responsibilities |
| :--- | :--- |
| **AUTH** | Manages credentials, tokens, and `UserAccount` lifecycle. Exposes login, refresh, logout, and `/activate` endpoints. |
| **STUDENT** | Manages `Student` profile personal data, avatar, and face registration (`faceImageUrl`, `isFaceRegistered`). |
| **APPLICATION** | Manages `DormitoryApplication` workflows, priority criteria, and auto-generates PDFs. |
| **ROOM** | Owns KTX hierarchy (Building, Floor, Room, Bed) and `StudentHousingAssignment` lifecycle (transitions to `OCCUPIED` and `CHECKED_OUT`). |
| **PAYMENT** | Manages `Bill` and `Payment` entities, handles webhook callbacks, locks bills, and publishes `PaymentSuccessEvent`. |
| **FACE** | (Future Phase) Extracts, validates, and manages AI face templates/embeddings. |
| **IOT** | (Future Phase) Synchronizes active resident faces to physical gate controllers and handles gate-opening logs. |
