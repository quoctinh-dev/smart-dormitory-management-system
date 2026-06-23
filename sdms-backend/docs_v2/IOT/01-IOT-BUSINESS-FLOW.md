# 01-IOT-BUSINESS-FLOW.md

# Smart Dormitory Management System (SDMS)

## IoT Business Flow Design

---

# 1. Purpose

Tài liệu này mô tả luồng nghiệp vụ tổng thể của hệ thống kiểm soát ra vào Ký túc xá Thông minh SDMS.

Mục tiêu:

* Xác định quy trình xác minh danh tính.
* Xác định quy trình đánh giá quyền truy cập.
* Xác định trách nhiệm của từng Module.
* Xác định dữ liệu cần ghi nhận.
* Làm cơ sở cho thiết kế AI, Face, RFID, Smart Access, Notification và IoT.

---

# 2. Business Principles

## Principle 01

Identity Verification ≠ Access Granted

Việc nhận diện được sinh viên không đồng nghĩa sinh viên được phép vào.

Ví dụ:

* Face Match thành công
* RFID hợp lệ

Nhưng:

* Sinh viên bị khóa
* Đã trả phòng
* Vi phạm giờ giới nghiêm

=> Vẫn bị từ chối truy cập.

---

## Principle 02

Face Module không quyết định mở cửa

Face Module chỉ chịu trách nhiệm:

* Face Enrollment
* Face Recognition
* Face Matching
* Face Verification History

Face Module KHÔNG được:

* Đánh giá Curfew
* Đánh giá Room Assignment
* Mở cửa

---

## Principle 03

RFID không quyết định mở cửa

RFID chỉ chịu trách nhiệm:

* Đọc UID
* Xác định danh tính sinh viên

RFID KHÔNG được:

* Đánh giá quyền truy cập
* Mở cửa

---

## Principle 04

Smart Access là Decision Engine duy nhất

Smart Access chịu trách nhiệm:

* Student Status Validation
* Room Assignment Validation
* Curfew Validation
* Time Window Validation
* Access Decision

---

## Principle 05

IoT chỉ thực thi

IoT Layer chỉ:

* Nhận lệnh
* Điều khiển Relay
* Mở khóa điện tử

IoT không quyết định quyền truy cập.

---

# 3. Supported Verification Methods

## RFID

Thẻ từ Mifare / RFID Card

---

## FACE

Nhận diện khuôn mặt

---

# 4. RFID Access Flow

Student
↓
Tap RFID Card
↓
RFID Reader
↓
Card UID
↓
Student Resolution
↓
IdentityVerifiedEvent
↓
Smart Access
↓
Policy Evaluation
↓
Access Granted / Denied
↓
IoT Unlock

---

# 5. Face Access Flow

Student
↓
Camera Capture
↓
AI Engine
↓
Embedding Extraction
↓
Face Matching
↓
IdentityVerifiedEvent
↓
Smart Access
↓
Policy Evaluation
↓
Access Granted / Denied
↓
IoT Unlock

---

# 6. Smart Access Evaluation Flow

Identity Verified
↓
Student Exists
↓
Student Status Check
↓
Active Room Assignment Check
↓
Building Match Check
↓
Curfew Check
↓
Time Window Check
↓
Decision

---

# 7. Student Status Mapping

| Student Status | Decision |
| -------------- | -------- |
| ACTIVE         | GRANTED  |
| LOCKED         | DENIED   |
| SUSPENDED      | DENIED   |
| EXPELLED       | DENIED   |
| GRADUATED      | DENIED   |
| CHECKED_OUT    | DENIED   |

---

# 8. Denial Reasons

ACCOUNT_LOCKED

STUDENT_SUSPENDED

STUDENT_EXPELLED

CHECKED_OUT

NOT_ACTIVE_RESIDENT

CURFEW_VIOLATION

TIME_WINDOW_VIOLATION

BUILDING_RESTRICTION

FACE_NOT_MATCHED

INVALID_RFID

UNRECOGNIZED_IDENTITY

---

# 9. Access Decision

## GRANTED

Điều kiện:

* Student ACTIVE
* Có Room Assignment
* Đúng Building
* Không vi phạm Curfew
* Không vi phạm Time Window

Kết quả:

AccessGrantedEvent

---

## DENIED

Nếu bất kỳ điều kiện nào thất bại.

Kết quả:

AccessDeniedEvent

---

# 10. Event Choreography

Face / RFID
↓
IdentityVerifiedEvent
↓
Smart Access
↓
AccessGrantedEvent
or
AccessDeniedEvent

Nếu Granted:

AccessGrantedEvent
↓
IoT Module
↓
Door Unlock

Nếu Denied:

AccessDeniedEvent
↓
Notification Module
↓
Push Notification

---

# 11. Door Unlock Flow

AccessGrantedEvent
↓
IoT Module
↓
MQTT Command
↓
ESP32
↓
Relay Activated
↓
Door Open

---

# 12. Access History Flow

Mọi lần truy cập đều phải được ghi log.

Bao gồm:

* Thành công
* Thất bại
* Remote Unlock

Workflow:

Access Attempt
↓
Policy Evaluation
↓
AccessHistory
↓
Database

---

# 13. Access History Information

Các thông tin bắt buộc lưu:

* accessId
* studentId
* gateId
* buildingId
* operatorId
* verificationMethod
* decision
* denialReason
* eventTimestamp
* createdAt

---

# 14. Face Verification History

Face Module lưu riêng:

* attemptId
* profileId
* gateDeviceId
* confidenceScore
* result
* attemptedAt

FaceVerificationHistory KHÔNG thay thế AccessHistory.

---

# 15. Domain Ownership

## Face Module

Owns:

* FaceProfile
* FaceEmbedding
* FaceVerificationAttempt

Responsibilities:

* Face Enrollment
* Face Recognition
* Face Verification

---

## Smart Access Module

Owns:

* AccessHistory
* CurfewPolicy
* TimeWindowPolicy

Responsibilities:

* Access Authorization
* Policy Evaluation
* Access Decision

---

## IoT Module

Owns:

* ESP32
* RFID Reader
* Camera
* Relay
* Electronic Lock

Responsibilities:

* Capture Credentials
* Execute Unlock Command

---

## Notification Module

Owns:

* Push Notification
* Security Alerts

Responsibilities:

* Notify AccessDenied
* Notify Security Events

---

# 16. Final Architecture

RFID / FACE
↓
Identity Verification
↓
Smart Access
↓
Policy Evaluation
↓
Access Decision
↓
Access History
↓
IoT Execution
↓
Door Unlock
↓
Notification
