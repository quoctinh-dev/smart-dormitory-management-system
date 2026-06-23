# SDMS-BACKEND-DEVELOPMENT-STANDARD.md

# Smart Dormitory Management System

## Bộ Quy Tắc Phát Triển Backend

Version: 3.0

Status: GOVERNANCE FREEZE

---

# 1. Mục tiêu

Tài liệu này quy định toàn bộ tiêu chuẩn phát triển Backend của SDMS.

Mọi module đều phải tuân thủ.

Áp dụng cho:

* Auth
* Student
* User
* Registration
* Application
* Room
* Payment
* Face
* Smart Access
* Notification

---

# 2. Công nghệ bắt buộc

* Java 17
* Spring Boot 3.5.x
* Spring Data JPA
* PostgreSQL 17
* Flyway
* Maven

Không sử dụng:

* MongoDB
* Liquibase
* NodeJS Backend
* ddl-auto=create
* ddl-auto=update

---

# 3. Kiến trúc hệ thống

Kiến trúc bắt buộc:

Modular Monolith

Cấu trúc:

```text
auth
student
user
registration
application
room
payment
face
smartaccess
notification
```

Mỗi module tự sở hữu:

* Controller
* Service
* Entity
* Repository
* Event
* DTO

---

# 4. Quy tắc Ownership

Module chỉ được ghi dữ liệu của chính mình.

Ví dụ:

Payment Module:

Được phép:

* Bill
* Payment

Không được phép:

* Student
* UserAccount
* Assignment

Giao tiếp giữa các module:

* Event
* Port Interface

Không được:

* Gọi Repository của module khác
* Ghi Aggregate của module khác

---

# 5. Quy tắc Entity

Mọi Aggregate Root:

* UUID Primary Key
* BaseEntity

Khuyến nghị:

* @Version cho dữ liệu có cập nhật đồng thời

Không sử dụng:

* Long ID
* Integer ID
* Auto Increment

---

# 6. Quy tắc UUID

Bắt buộc:

```java
@GeneratedValue(strategy = GenerationType.UUID)
```

Không sử dụng:

* Sequence
* Identity
* Bigint

---

# 7. Quy tắc Repository

Repository chỉ làm nhiệm vụ:

* Query
* Exists
* Count
* Lock

Không chứa:

* Business Logic
* Validation
* Workflow
* Decision

---

# 8. Quy tắc Service

Service là nơi chứa toàn bộ nghiệp vụ.

Service chịu trách nhiệm:

* Validation
* Workflow
* State Transition
* Event Publishing

---

# 9. Quy tắc Controller

Controller chỉ:

* Nhận Request
* Validate DTO
* Gọi Service
* Trả Response

Không được:

* Inject Repository
* Query Database
* Chứa Business Logic

---

# 10. Quy tắc DTO

Bắt buộc:

* Request DTO
* Response DTO

Không trả Entity trực tiếp ra API.

---

# 11. Quy tắc Validation

Validation phải nằm trong DTO.

Ví dụ:

* @NotNull
* @NotBlank
* @Email
* @Pattern
* @Size

---

# 12. Quy tắc Event

SDMS sử dụng Spring Event.

Luồng chuẩn:

Publisher
↓
Event
↓
Listener

Không được:

Module A gọi trực tiếp Service của Module B.

---

# 13. Quy tắc liên kết giữa Module

Tầng Java:

Chỉ sử dụng:

* UUID Reference

Ví dụ:

* studentId
* roomId
* assignmentId
* billId

Không sử dụng:

* @ManyToOne xuyên Module
* @OneToOne xuyên Module

Tầng Database:

Cho phép:

* Foreign Key

---

# 14. Quy tắc Database

Mọi thay đổi Database phải đi qua Flyway.

Một thay đổi nghiệp vụ:

=

Một Migration

Ví dụ:

```text
V20__create_face_profile.sql

V21__create_access_log.sql
```

Không sử dụng:

```text
fix.sql
temp.sql
new.sql
```

---

# 15. Quy tắc Audit

Các nghiệp vụ quan trọng phải lưu vết.

Ví dụ:

* Payment
* Face Verification
* Access Decision
* Remote Unlock
* Application Approval

---

# 16. Quy tắc Security

Student:

studentId lấy từ Security Context.

Không lấy từ Request Body.

Admin:

Bắt buộc kiểm tra quyền.

Không tin dữ liệu từ Client.

---

# 17. Quy tắc Logging

Sử dụng:

```java
log.info()
log.warn()
log.error()
```

Không sử dụng:

```java
System.out.println()
```

---

# 18. Quy tắc API

Định dạng REST:

Đúng:

```text
/api/v1/students

/api/v1/applications

/api/v1/payments

/api/v1/faces
```

Sai:

```text
/getStudents

/createStudent

/deleteStudent
```

---

# 19. Quy tắc Notification

Notification là Consumer Module.

Nhận Event từ:

* Application
* Payment
* Face
* Smart Access

Không module nào được gọi trực tiếp Notification Repository.

---

# 20. Quy tắc Face Module

Face Module sở hữu:

* Face Registration
* Face Verification
* Face Template
* Verification History

Face Module không sở hữu:

* Student Lifecycle
* Access Decision
* MQTT
* Door Control
* Access Log

Quy tắc Freeze:

Face Verification

≠

Access Granted

Verification History

≠

Access History

---

# 21. Quy tắc Smart Access

Smart Access sở hữu:

* Access Decision
* Time Window Policy
* Remote Unlock
* Access Log

Smart Access nhận dữ liệu từ:

* RFID
* Face Verification
* MQTT

Smart Access là nơi duy nhất quyết định:

Access Granted

hoặc

Access Denied

---

# 22. Quy tắc Runtime

Thứ tự ưu tiên sự thật:

Runtime

>

Code

>

Documentation

>

Assumption

Nếu Runtime khác Documentation:

Tin Runtime.

Nếu Runtime khác Code:

Tin Runtime.

---

# 23. Quy tắc Audit Governance

Trạng thái Audit:

* PASS
* WARNING
* FAIL
* UNKNOWN

Không đủ bằng chứng:

→ UNKNOWN

Không được suy đoán.

Evidence phải đến từ:

* Runtime
* Code
* Database
* Event
* API

---

# 24. Vòng đời phát triển

Documentation

↓

Review

↓

Freeze

↓

Code

↓

Compile

↓

Audit

↓

Fix

↓

Release

Bắt buộc áp dụng cho mọi Module.

---

# 25. Nguyên tắc tối cao

Documentation First

Ownership First

Evidence First

Runtime First

Code Second

Audit Mandatory

No Exception
