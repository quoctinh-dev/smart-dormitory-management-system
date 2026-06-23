# SDMS Smart Access Integration Specification (v1.0)

## 1. Governance Freeze Declaration
This blueprint establishes the strict Domain-Driven Design boundaries for the access control workflow. It is governed by rules **AC-01** through **AC-09**.

## 2. Smart Access Ownership Matrix
| Domain / Module | Owned Capabilities | Prohibited Actions |
| :--- | :--- | :--- |
| **Face Module** | Biometric Matching, `FaceVerificationHistory` | Access Decision, Hardware Control |
| **RFID Integration** | Raw Card Scanning | Access Policies, Access Decisions |
| **Smart Access Module** | Access Policies (Curfew/Time Window), `AccessHistory` | Identity Matching, Hardware Control |
| **IoT Module** | MQTT Orchestration, ESP32 Control, Relay Trigger | Access Policies, Identity Verification |
| **Payment Module** | Billing, Overdue Tracking | Access Revocation based on debts |
| **Room Module** | Bed Assignments | Door Unlocking |

## 3. Event Choreography Pipeline (The "Happy Path")
The flow strictly separates Identity, Policy, and Execution:
1. **Identity Capture:** IoT Edge publishes `VerificationRequested`.
2. **Identity Verification:** Face Module calculates vector distance $\rightarrow$ publishes `FaceVerifiedEvent(studentId)`.
3. **Access Policy Evaluation:** **Smart Access Module** consumes `FaceVerifiedEvent` and executes rules:
   * **Rule 1:** Must have `Student.status == ACTIVE`.
   * **Rule 2:** Must have Active Room Assignment.
   * **Rule 3:** Must comply with Curfew / Time Window.
   * *Payment check is explicitly skipped (AC-09).*
4. **Decision Publishing:** Smart Access Module publishes `AccessGrantedEvent(deviceId)`.
5. **Hardware Execution:** **IoT Module** consumes `AccessGrantedEvent` $\rightarrow$ translates to MQTT payload $\rightarrow$ Gate Unlocks.

## 4. Failure & Denied Choreography
1. **Identity Rejection:** Face Module publishes `FaceVerificationFailedEvent`. Smart Access Module records `AccessDenied(UNRECOGNIZED_IDENTITY)`.
2. **Policy Rejection:** Face is verified, but Smart Access Module rejects due to Curfew or Suspended Status $\rightarrow$ publishes `AccessDeniedEvent(studentId, reason)`.
3. **Notification Routing:** **Notification Module** consumes `AccessDeniedEvent` $\rightarrow$ sends Push Notification "Access Denied: Curfew Violation".

## 5. History Segregation (AC-05)
* **FaceVerificationHistory:** Bounded to Face Module. (Records: `studentId`, `confidenceScore`, `aiTimeout`).
* **AccessHistory:** Bounded to Smart Access Module. (Records: `studentId`, `deviceId`, `decision`, `denialReason`).

## 6. Critical Business Rules
* **AC-07 / AC-08:** Identity $\neq$ Eligibility. Being recognized by the AI does not grant access if the student is locked or unassigned.
* **AC-09 Humanitarian Rule:** Access to the dormitory and personal belongings CANNOT be denied due to overdue payments. Debt collection is handled via Notifications and Administrative escalation, not physical lockouts.

## 7. Student Status vs Access Decision Mapping
Smart Access Module evaluates `Student.status` as follows:

| Student Status | Access Decision | Denial Reason (nếu có) | Xử lý kèm theo |
| :--- | :--- | :--- | :--- |
| `ACTIVE` | **GRANTED** | N/A | Chào mừng. |
| `LOCKED` | **DENIED** | `ACCOUNT_LOCKED` | Gửi Notification yêu cầu liên hệ Ban Quản lý. |
| `SUSPENDED` | **DENIED** | `STUDENT_SUSPENDED` | Kỷ luật / Đình chỉ tạm thời. Báo bảo vệ nếu cố ý truy cập nhiều lần. |
| `EXPELLED` | **DENIED** | `STUDENT_EXPELLED` | Bị đuổi học/Trục xuất. Hồ sơ Face Profile sẽ bị thu hồi (REVOKED). |
| `GRADUATED` | **DENIED** | `ALUMNI_ACCESS_DENIED` | Đã tốt nghiệp. Thẻ/Face không còn hiệu lực. |
| `CHECKED_OUT` | **DENIED** | `CHECKED_OUT` | Đã trả phòng. Hợp đồng chấm dứt. |

## 8. Authorization Governance
SDMS sử dụng Hybrid Authorization Architecture: RBAC tại Auth Layer, Permission-Based Authorization tại Business Layer.

* **Smart Access không được kiểm tra Role**: Nghiêm cấm việc dùng `hasRole("ADMIN")` hoặc tương tự.
* **Smart Access chỉ kiểm tra Permission**: Quyết định truy cập dựa trên "Năng lực" (Ví dụ: `hasAuthority("REMOTE_UNLOCK")`).
* **Smart Access sở hữu Permission Definition**: Định nghĩa các quyền nội bộ độc lập.
* **Auth Module sở hữu Role Assignment**: Việc gán Role cho User và Map Role sang Permission thuộc về Auth Module.

**Ví dụ các Permission do Smart Access sở hữu:**
* `REMOTE_UNLOCK`
* `VIEW_ACCESS_HISTORY`
* `EMERGENCY_OVERRIDE`
