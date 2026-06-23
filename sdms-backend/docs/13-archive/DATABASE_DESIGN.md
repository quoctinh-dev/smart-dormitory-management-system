# Thiết Kế Cơ Sở Dữ Liệu SDMS V1

## 1. Tổng Quan

Tài liệu này mô tả chi tiết về kiến trúc, thiết kế và các quy ước của cơ sở dữ liệu cho dự án Hệ thống Quản lý Ký túc xá Thông minh (SDMS V1).

- **Mục đích:** Cơ sở dữ liệu được thiết kế để lưu trữ, quản lý và bảo vệ toàn bộ dữ liệu liên quan đến hoạt động của ký túc xá, bao gồm thông tin người dùng, hồ sơ sinh viên, đơn đăng ký, và các dữ liệu nghiệp vụ khác.
- **Miền nghiệp vụ chính (Business Domains):**
  - Quản lý Định danh & Xác thực (Identity & Access Management)
  - Quản lý Hồ sơ Sinh viên (Student Profile Management)
  - Quy trình Tuyển sinh & Đơn đăng ký (Application & Enrollment Process)
- **Công nghệ:** PostgreSQL.
- **Quy ước đặt tên:**
  - **Bảng (Table):** Dạng số nhiều, sử dụng `snake_case` (ví dụ: `user_accounts`).
  - **Cột (Column):** Dạng số ít, sử dụng `snake_case` (ví dụ: `account_id`).

## 2. Kiến Trúc Cơ Sở Dữ Liệu

- **Chiến lược Khóa chính (UUID Strategy):** Tất cả các khóa chính trong hệ thống đều sử dụng kiểu dữ liệu `UUID`. Chiến lược này mang lại nhiều lợi ích:
  - **Bảo mật:** Che giấu số lượng bản ghi thực tế, ngăn chặn các cuộc tấn công đoán ID tuần tự.
  - **Phân tán:** Cho phép các dịch vụ khác nhau có thể tự sinh ID mà không sợ xung đột, sẵn sàng cho kiến trúc microservices trong tương lai.
  - **Tích hợp:** Dễ dàng hợp nhất dữ liệu từ nhiều nguồn khác nhau.
- **Chiến lược Khóa ngoại (Foreign Key Strategy):** Hệ thống sử dụng các ràng buộc khóa ngoại (`FOREIGN KEY REFERENCES`) để đảm bảo tính toàn vẹn tham chiếu giữa các bảng. Ví dụ, không thể xóa một `registration_periods` nếu vẫn còn `dormitory_applications` liên kết với nó.
- **Chiến lược Xóa mềm (Soft Delete Strategy):** Hệ thống **không** sử dụng cơ chế xóa mềm (soft delete). Các bản ghi khi bị xóa sẽ được gỡ bỏ hoàn toàn khỏi cơ sở dữ liệu.
- **Trường kiểm toán (Audit Fields):** Tất cả các bảng đều kế thừa các trường `created_at` và `updated_at` từ `BaseEntity`. Các trường này được quản lý tự động bởi cả JPA Lifecycle Callbacks (`@PrePersist`, `@PreUpdate`) và giá trị mặc định ở tầng cơ sở dữ liệu, đảm bảo dữ liệu luôn được ghi nhận dấu vết thời gian.
- **Chiến lược Migration (Flyway Migration Strategy):** Toàn bộ các thay đổi về cấu trúc (schema) của cơ sở dữ liệu được quản lý bởi **Flyway**. Mỗi thay đổi là một file migration SQL được đánh version tuần tự (V1, V2, V3,...). Điều này đảm bảo rằng cơ sở dữ liệu ở mọi môi trường (development, staging, production) luôn đồng nhất và có thể được nâng cấp hoặc tái tạo một cách an toàn, tự động.

## 3. Tổng Quan Mối Quan Hệ Giữa Các Thực Thể

- **`RegistrationPeriod` (1) → (N) `DormitoryApplication`:**
  - **Ý nghĩa:** Một kỳ đăng ký có thể có nhiều đơn đăng ký. Mỗi đơn đăng ký phải thuộc về một kỳ đăng ký duy nhất.
- **`DormitoryApplication` (1) → (N) `VerificationDocument`:**
  - **Ý nghĩa:** Một đơn đăng ký có thể yêu cầu nhiều tài liệu minh chứng (ví dụ: CCCD, giấy chứng nhận ưu tiên).
- **`DormitoryApplication` (1) → (1) `Student`:**
  - **Ý nghĩa:** Một đơn đăng ký sau khi được phê duyệt sẽ tạo ra một hồ sơ sinh viên chính thức. Mối quan hệ này là bất biến (`updatable=false`), đảm bảo hồ sơ sinh viên luôn truy vết được về đơn đăng ký gốc.
- **`Student` (1) → (1) `UserAccount`:**
  - **Ý nghĩa:** Mỗi sinh viên có một tài khoản người dùng để đăng nhập và tương tác với hệ thống.

## 4. Thiết Kế Bảng

### `registration_periods`

Lưu trữ thông tin về các kỳ tuyển sinh/đăng ký ở ký túc xá.

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `period_id` | `UUID` | `PRIMARY KEY` | Khóa chính của bảng. |
| `period_name` | `VARCHAR(100)` | `NOT NULL` | Tên của kỳ đăng ký (ví dụ: "Đợt 1 - HK1 2024-2025"). |
| `start_date` | `TIMESTAMP` | `NOT NULL` | Thời gian bắt đầu nhận đơn. |
| `end_date` | `TIMESTAMP` | `NOT NULL` | Thời gian kết thúc nhận đơn. |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Trạng thái của kỳ đăng ký (đang mở hay đã đóng). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian tạo. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật lần cuối. |

---

### `dormitory_applications`

Lưu trữ thông tin chi tiết của một đơn đăng ký do sinh viên nộp.

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `application_id` | `UUID` | `PRIMARY KEY` | Khóa chính của bảng. |
| `version` | `BIGINT` | `NOT NULL, DEFAULT 0` | Dùng cho cơ chế khóa lạc quan (Optimistic Locking). |
| `period_id` | `UUID` | `FOREIGN KEY` | Khóa ngoại, liên kết đến `registration_periods`. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Họ và tên đầy đủ của người nộp đơn. |
| `cccd` | `VARCHAR(20)` | `NOT NULL` | Số Căn cước Công dân. |
| `status` | `VARCHAR(20)` | `NOT NULL` | Trạng thái của đơn (PENDING, APPROVED, REJECTED...). |
| `application_code` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Mã đơn duy nhất, dùng để tra cứu. |
| `...` | `...` | `...` | Các trường thông tin cá nhân, gia đình, học vụ khác. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian tạo. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật lần cuối. |

- **Foreign Keys:** `period_id` tham chiếu đến `registration_periods(period_id)`.
- **Unique Constraints:** `application_code`.

---

### `verification_documents`

Lưu trữ các file tài liệu minh chứng đính kèm theo đơn đăng ký.

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `document_id` | `UUID` | `PRIMARY KEY` | Khóa chính của bảng. |
| `application_id` | `UUID` | `FOREIGN KEY` | Khóa ngoại, liên kết đến `dormitory_applications`. |
| `document_type` | `VARCHAR(50)` | `NOT NULL` | Loại tài liệu (CCCD, Hộ nghèo...). |
| `file_url` | `TEXT` | `NOT NULL` | Đường dẫn URL đến file đã được upload lên Cloudinary. |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'PENDING'` | Trạng thái của tài liệu (PENDING, VERIFIED, REJECTED). |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian tạo. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật lần cuối. |

- **Foreign Keys:** `application_id` tham chiếu đến `dormitory_applications(application_id)`.

---

### `students`

Lưu trữ hồ sơ của các sinh viên đã được duyệt và đang cư trú.

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `student_id` | `UUID` | `PRIMARY KEY` | Khóa chính của bảng. |
| `source_application_id` | `UUID` | `UNIQUE, NOT NULL, FOREIGN KEY` | Khóa ngoại, liên kết đến đơn đăng ký gốc. |
| `student_code` | `VARCHAR(50)` | `UNIQUE` | Mã số sinh viên. |
| `full_name` | `VARCHAR(100)` | `NOT NULL` | Họ và tên đầy đủ. |
| `cccd` | `VARCHAR(20)` | `UNIQUE, NOT NULL` | Số Căn cước Công dân. |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'ACTIVE'` | Trạng thái sinh viên (ACTIVE, INACTIVE...). |
| `...` | `...` | `...` | Các trường thông tin liên lạc, học vụ khác. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian tạo. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật lần cuối. |

- **Foreign Keys:** `source_application_id` tham chiếu đến `dormitory_applications(application_id)`.
- **Indexes:** `idx_student_code`, `idx_student_cccd`.
- **Unique Constraints:** `source_application_id`, `student_code`, `cccd`.

---

### `user_accounts`

Bảng trung tâm cho việc xác thực và quản lý truy cập hệ thống.

| Column | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `account_id` | `UUID` | `PRIMARY KEY` | Khóa chính của bảng. |
| `username` | `VARCHAR(50)` | `UNIQUE, NOT NULL` | Tên đăng nhập duy nhất. |
| `email` | `VARCHAR(100)` | `UNIQUE, NOT NULL` | Email duy nhất, dùng cho đăng nhập và liên lạc. |
| `password` | `VARCHAR(255)` | `NOT NULL` | Lưu trữ mật khẩu đã được hash bằng BCrypt. |
| `role` | `VARCHAR(20)` | `NOT NULL` | Vai trò của người dùng (STUDENT, STAFF, ADMIN). |
| `status` | `VARCHAR(20)` | `NOT NULL, DEFAULT 'PENDING...'` | Trạng thái tài khoản (ACTIVE, LOCKED...). |
| `student_id` | `UUID` | `UNIQUE, FOREIGN KEY` | Khóa ngoại, liên kết đến hồ sơ sinh viên (nếu có). |
| `refresh_token` | `VARCHAR(500)` | `NULL` | Refresh Token dùng cho việc duy trì đăng nhập. |
| `refresh_token_expiry` | `TIMESTAMP` | `NULL` | Thời gian hết hạn của Refresh Token. |
| `reset_password_token` | `VARCHAR(255)` | `NULL` | Lưu **hash (SHA-256)** của token reset mật khẩu. |
| `reset_password_expiry` | `TIMESTAMP` | `NULL` | Thời gian hết hạn của token reset mật khẩu. |
| `created_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian tạo. |
| `updated_at` | `TIMESTAMP` | `DEFAULT NOW()` | Thời gian cập nhật lần cuối. |

- **Foreign Keys:** `student_id` tham chiếu đến `students(student_id)`.
- **Indexes:** `idx_user_accounts_refresh_token`, `idx_user_accounts_reset_token`.
- **Unique Constraints:** `username`, `email`, `student_id`.

## 5. Mô Hình Dữ Liệu Xác Thực

- **`refresh_token` & `refresh_token_expiry`:** Dùng cho cơ chế Token Rotation. Khi người dùng dùng Refresh Token để lấy Access Token mới, hệ thống sẽ tạo ra một cặp token mới và cập nhật lại 2 trường này, đồng thời vô hiệu hóa Refresh Token cũ.
- **`reset_password_token` & `reset_password_expiry`:** Dùng cho luồng khôi phục mật khẩu.
  - **Lý do bảo mật:** `reset_password_token` lưu trữ bản **hash SHA-256** của token thật, không bao giờ lưu token gốc. Điều này ngăn chặn kẻ tấn công có được quyền đọc database có thể sử dụng token để chiếm tài khoản.
  - `reset_password_expiry` đảm bảo token chỉ có hiệu lực trong một khoảng thời gian ngắn (15 phút), giảm thiểu rủi ro nếu email của người dùng bị lộ.

## 6. Quy Tắc Toàn Vẹn Dữ Liệu

- **Toàn vẹn tham chiếu:** Các khóa ngoại đảm bảo rằng không thể có một `students` mà không có `dormitory_applications` tương ứng, hoặc một `dormitory_applications` không thuộc về `registration_periods` nào.
- **Ràng buộc nghiệp vụ:** Các ràng buộc `UNIQUE` trên `email`, `username`, `cccd`... đảm bảo tính duy nhất của các định danh quan trọng trong hệ thống.
- **Validation:** Các ràng buộc `NOT NULL` và độ dài (`VARCHAR(50)`) là lớp phòng vệ cuối cùng, đảm bảo dữ liệu được ghi vào database tuân thủ các quy tắc cơ bản.

## 7. Chiến Lược Đánh Chỉ Mục (Indexing)

Mỗi index được tạo ra đều có mục đích rõ ràng để tăng tốc các truy vấn quan trọng:
- **`idx_student_code`, `idx_student_cccd`:** Tăng tốc độ tìm kiếm sinh viên dựa trên mã số hoặc CCCD.
- **`idx_user_accounts_refresh_token`:** Tăng tốc độ xác thực Refresh Token trong luồng làm mới phiên đăng nhập.
- **`idx_user_accounts_reset_token`:** Tăng tốc độ tìm kiếm người dùng khi họ sử dụng token để đặt lại mật khẩu. Đây là index **bắt buộc** để tránh full-table scan.

## 8. Cân Nhắc về Bảo Mật

- **UUID:** Ngăn chặn tấn công đoán ID.
- **Password Hashing:** Cột `password` lưu trữ hash BCrypt, là tiêu chuẩn an toàn nhất hiện nay.
- **Token Hashing:** Cột `reset_password_token` lưu trữ hash SHA-256, bảo vệ token ngay cả khi database bị rò rỉ.
- **Chống Enumeration Attack:** Logic nghiệp vụ được thiết kế để không tiết lộ thông tin người dùng có tồn tại trong hệ thống hay không trong các luồng nhạy cảm như "quên mật khẩu".

## 9. Cân Nhắc về Khả Năng Mở Rộng

- **Tăng trưởng dữ liệu:** Việc sử dụng index hiệu quả và khóa chính UUID đảm bảo hệ thống có thể xử lý tốt khi số lượng người dùng và đơn đăng ký tăng lên hàng trăm nghìn hoặc hàng triệu.
- **Module mới:** Cấu trúc được module hóa rõ ràng. Việc thêm các bảng mới như `dormitories`, `rooms`, `beds`... và liên kết chúng với `students` thông qua khóa ngoại là rất đơn giản và không ảnh hưởng đến các bảng hiện có.
- **Sẵn sàng cho IoT:** Việc sử dụng UUID làm khóa chính giúp hệ thống sẵn sàng tích hợp với các thiết bị IoT hoặc các dịch vụ khác, vì các hệ thống này có thể tự sinh ID mà không cần kết nối đến database trung tâm.

## 10. Mở Rộng Cơ Sở Dữ Liệu Trong Tương Lai

Cấu trúc hiện tại là nền tảng vững chắc để mở rộng các module nghiệp vụ khác:

- **Quản lý cơ sở vật chất:**
  - `dormitories` (Các tòa nhà KTX)
  - `rooms` (Các phòng, có khóa ngoại đến `dormitories`)
  - `beds` (Các giường, có khóa ngoại đến `rooms`)
- **Quản lý cư trú:**
  - `check_ins` (Liên kết `students` với `beds`)
  - `check_outs` (Ghi nhận lịch sử trả phòng)
- **An ninh & IoT:**
  - `devices` (Thông tin các thiết bị IoT như camera, khóa cửa)
  - `access_logs` (Lịch sử ra vào cửa)
  - `face_recognition_logs` (Lịch sử nhận diện khuôn mặt)
- **Thông báo:**
  - `notifications` (Lưu trữ các thông báo gửi đến người dùng)

## 11. Tình Trạng Cơ Sở Dữ Liệu

- **Phiên bản hiện tại:** V3
- **Trạng thái Migration:** Toàn bộ cấu trúc được quản lý bởi Flyway và đã được áp dụng đầy đủ.
- **Mức độ sẵn sàng cho Production:** **Sẵn sàng (Ready)**. Thiết kế hiện tại tuân thủ các tiêu chuẩn về bảo mật, hiệu năng và khả năng bảo trì cho một hệ thống production.

---

## Đánh Giá & Phê Duyệt

- **Đánh giá:** Thiết kế cơ sở dữ liệu của SDMS V1 rất mạnh mẽ, an toàn và có tầm nhìn xa cho việc mở rộng trong tương lai.
- **Phiên bản:** V3
- **Trạng thái:** **ĐÃ PHÊ DUYỆT (APPROVED)**
