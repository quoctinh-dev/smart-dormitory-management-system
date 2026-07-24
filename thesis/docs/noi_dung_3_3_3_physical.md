### 3.3.3 Thiết kế dữ liệu mức vật lý

Khác với mức luận lý tập trung vào nghiệp vụ, thiết kế cơ sở dữ liệu (CSDL) mức vật lý mô tả cách thức hệ thống lưu trữ dữ liệu thực tế trên một Hệ quản trị CSDL cụ thể. CSDL của hệ thống Quản lý Ký túc xá (SDMS) được xây dựng dựa trên PostgreSQL (phiên bản 15+), tích hợp các tiện ích mở rộng (extension) như `pgcrypto` để sinh mã UUID và `vector` (pgvector) để lưu trữ sinh trắc học khuôn mặt AI.

#### 3.3.3.1 Bảng ánh xạ kiểu dữ liệu (Data Type Mapping)

Quá trình chuyển đổi từ kiểu dữ liệu ý niệm/luận lý sang kiểu dữ liệu vật lý của PostgreSQL được thực hiện theo nguyên tắc tối ưu hóa không gian lưu trữ và hiệu năng truy vấn:

| Kiểu dữ liệu Luận lý | Kiểu dữ liệu Vật lý (PostgreSQL) | Diễn giải & Áp dụng thực tế trong dự án |
| :--- | :--- | :--- |
| `UUID` | `UUID` | Dùng cho 100% Khóa chính (PK) và Khóa ngoại (FK) |
| `String (ngắn)` / `Enum` | `VARCHAR(n)` | Dùng cho `student_code`, `status`, mã CCCD (VD: VARCHAR(20)) |
| `String (dài)` | `TEXT` | Dùng cho các đường dẫn URL PDF, địa chỉ, lý do từ chối |
| `Integer` / `Long` | `INTEGER` / `BIGINT` | Dùng cho version (Khóa lạc quan), chỉ số điện nước |
| `BigDecimal` | `NUMERIC(15, 2)` | Dùng cho số tiền hóa đơn (`amount`, `paid_amount`) |
| `LocalDateTime` | `TIMESTAMP WITHOUT TIME ZONE` | Dùng cho `created_at`, `updated_at`, `event_timestamp` |
| `LocalDate` | `DATE` | Dùng cho ngày sinh (`dob`), ngày cấp CCCD (`issue_date`) |
| `Boolean` | `BOOLEAN` | Dùng cho các cờ logic (`is_active`, `is_settled`) |
| `float[]` (AI Model) | `VECTOR(512)` | Dùng để lưu trữ ma trận đặc trưng khuôn mặt 512 chiều |

#### 3.3.3.2 Script DDL Vật lý của 29 Bảng Dữ Liệu
Dưới đây là Script SQL (Data Definition Language) mô tả cấu trúc vật lý thực tế của toàn bộ 29 bảng trong hệ thống. Lược đồ này đã được tối ưu hóa bằng các Index, Unique Constraint và Optimistic Locking (`version`).

```sql
-- Kích hoạt tiện ích mở rộng
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- ==========================================
-- PHÂN HỆ 1: HỆ THỐNG VÀ NGƯỜI DÙNG
-- ==========================================

-- 1. system_configs
CREATE TABLE system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value TEXT NOT NULL,
    description TEXT,
    group_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. user_accounts
CREATE TABLE user_accounts (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING_ACTIVATION' NOT NULL,
    last_login TIMESTAMP WITHOUT TIME ZONE,
    refresh_token VARCHAR(255),
    refresh_token_expiry TIMESTAMP WITHOUT TIME ZONE,
    reset_password_token VARCHAR(255),
    reset_password_expiry TIMESTAMP WITHOUT TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0 NOT NULL,
    lock_time TIMESTAMP WITHOUT TIME ZONE,
    student_id UUID UNIQUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 2: SINH VIÊN VÀ ĐĂNG KÝ
-- ==========================================

-- 3. registration_periods
CREATE TABLE registration_periods (
    period_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    stay_start_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    stay_end_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    registration_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. registration_eligibilities
CREATE TABLE registration_eligibilities (
    eligibility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID NOT NULL REFERENCES registration_periods(period_id),
    cccd VARCHAR(20) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    student_code VARCHAR(20),
    target VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_eligibility_cccd UNIQUE (period_id, cccd),
    CONSTRAINT uk_eligibility_student_code UNIQUE (period_id, student_code),
    CONSTRAINT uk_eligibility_email UNIQUE (period_id, email)
);

-- 5. dormitory_applications
CREATE TABLE dormitory_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version BIGINT NOT NULL DEFAULT 0,
    period_id UUID NOT NULL REFERENCES registration_periods(period_id),
    full_name VARCHAR(100) NOT NULL,
    student_code VARCHAR(20),
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    cccd VARCHAR(20) NOT NULL,
    issue_date DATE,
    issue_place VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    permanent_address TEXT,
    pob VARCHAR(100),
    ethnic VARCHAR(50),
    religion VARCHAR(50),
    faculty VARCHAR(100),
    cohort VARCHAR(20),
    contact_address TEXT,
    father_name VARCHAR(100),
    father_yob INTEGER,
    father_job VARCHAR(100),
    father_phone VARCHAR(20),
    mother_name VARCHAR(100),
    mother_yob INTEGER,
    mother_job VARCHAR(100),
    mother_phone VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    priority_score INTEGER DEFAULT 0,
    application_code VARCHAR(50) UNIQUE NOT NULL,
    registration_form_pdf_url TEXT,
    commitment_form_pdf_url TEXT,
    reviewed_by_user_id UUID,
    review_note TEXT,
    commitment_accepted BOOLEAN DEFAULT FALSE,
    commitment_accepted_at TIMESTAMP WITHOUT TIME ZONE,
    commitment_version VARCHAR(10),
    client_ip_address VARCHAR(45),
    waiting_list_used BOOLEAN DEFAULT FALSE NOT NULL,
    payment_deadline TIMESTAMP WITHOUT TIME ZONE,
    revision_deadline TIMESTAMP WITHOUT TIME ZONE,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_period_cccd UNIQUE (period_id, cccd)
);

-- 6. application_priorities
CREATE TABLE application_priorities (
    priority_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES dormitory_applications(application_id) ON DELETE CASCADE,
    priority_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. verification_documents
CREATE TABLE verification_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES dormitory_applications(application_id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. dormitory_application_status_history
CREATE TABLE dormitory_application_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES dormitory_applications(application_id) ON DELETE CASCADE,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by_user_id UUID NOT NULL,
    changed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT
);

-- 9. students
CREATE TABLE students (
    student_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_application_id UUID UNIQUE NOT NULL REFERENCES dormitory_applications(application_id),
    student_code VARCHAR(50) UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    cccd VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    father_name VARCHAR(100),
    father_phone VARCHAR(20),
    mother_name VARCHAR(100),
    mother_phone VARCHAR(20),
    contact_address TEXT,
    permanent_address TEXT,
    faculty VARCHAR(100),
    academic_year VARCHAR(20),
    avatar_url VARCHAR(500),
    face_image_url VARCHAR(500),
    is_face_registered BOOLEAN DEFAULT FALSE NOT NULL,
    rfid_code VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'PENDING_CHECKIN' NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 3: CƠ SỞ VẬT CHẤT
-- ==========================================

-- 10. buildings
CREATE TABLE buildings (
    building_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    gender VARCHAR(10) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. floors
CREATE TABLE floors (
    floor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_number INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    building_id UUID NOT NULL REFERENCES buildings(building_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_building_floor UNIQUE (building_id, floor_number)
);

-- 12. rooms
CREATE TABLE rooms (
    room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_code VARCHAR(30) NOT NULL,
    capacity INTEGER NOT NULL,
    occupied_beds INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL,
    room_pin_code VARCHAR(10),
    version INTEGER NOT NULL DEFAULT 0,
    floor_id UUID NOT NULL REFERENCES floors(floor_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_floor_room_code UNIQUE (floor_id, room_code)
);

-- 13. beds
CREATE TABLE beds (
    bed_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bed_code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(500),
    version INTEGER NOT NULL DEFAULT 0,
    room_id UUID NOT NULL REFERENCES rooms(room_id),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_room_bed_code UNIQUE (room_id, bed_code)
);

-- ==========================================
-- PHÂN HỆ 4: LƯU TRÚ VÀ ĐƠN TỪ
-- ==========================================

-- 14. student_housing_assignments
CREATE TABLE student_housing_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES dormitory_applications(application_id),
    student_id UUID REFERENCES students(student_id),
    bed_id UUID NOT NULL REFERENCES beds(bed_id),
    status VARCHAR(30) NOT NULL,
    room_role VARCHAR(30) DEFAULT 'MEMBER',
    reserved_at TIMESTAMP WITHOUT TIME ZONE,
    check_in_at TIMESTAMP WITHOUT TIME ZONE,
    check_out_at TIMESTAMP WITHOUT TIME ZONE,
    expected_check_out_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. stay_extensions
CREATE TABLE stay_extensions (
    extension_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    registration_period_id UUID NOT NULL REFERENCES registration_periods(period_id),
    current_bed_id UUID NOT NULL REFERENCES beds(bed_id),
    contract_pdf_url TEXT,
    commitment_pdf_url TEXT,
    description TEXT,
    reject_reason TEXT,
    old_expected_check_out_at TIMESTAMP WITHOUT TIME ZONE,
    new_expected_check_out_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. checkout_requests
CREATE TABLE checkout_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    assignment_id UUID NOT NULL REFERENCES student_housing_assignments(assignment_id),
    intended_checkout_date TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    reason TEXT,
    bank_account_number VARCHAR(50),
    bank_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    reject_reason TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 17. change_room_requests
CREATE TABLE change_room_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    current_assignment_id UUID NOT NULL REFERENCES student_housing_assignments(assignment_id),
    target_room_id UUID NOT NULL REFERENCES rooms(room_id),
    reason TEXT NOT NULL,
    admin_note TEXT,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    reviewed_by_user_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. curfew_requests
CREATE TABLE curfew_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    reason TEXT NOT NULL,
    expected_arrival_time TIMESTAMP WITHOUT TIME ZONE,
    request_type VARCHAR(20) NOT NULL,
    start_date TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    resolved_by UUID,
    admin_note TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 5: THANH TOÁN
-- ==========================================

-- 19. utility_usages
CREATE TABLE utility_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(room_id),
    utility_type VARCHAR(20) NOT NULL,
    month INTEGER,
    year INTEGER,
    old_reading INTEGER,
    new_reading INTEGER,
    total_usage INTEGER,
    is_settled BOOLEAN DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 20. bills
CREATE TABLE bills (
    bill_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_type VARCHAR(20) NOT NULL,
    amount NUMERIC(15,2) NOT NULL,
    paid_amount NUMERIC(15,2) DEFAULT 0.00 NOT NULL,
    status VARCHAR(20) DEFAULT 'UNPAID' NOT NULL,
    due_date DATE,
    description TEXT,
    assignment_id UUID,
    application_id UUID,
    room_id UUID,
    student_id UUID,
    version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 21. payments
CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(bill_id),
    amount NUMERIC(15,2) NOT NULL,
    method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    transaction_code VARCHAR(100) UNIQUE NOT NULL,
    gateway_transaction_id VARCHAR(100),
    description TEXT,
    gateway_metadata TEXT,
    paid_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- PHÂN HỆ 6: SMART ACCESS IOT & FACE AI
-- ==========================================

-- 22. gates
CREATE TABLE gates (
    gate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    gate_type VARCHAR(20) NOT NULL,
    building_id UUID REFERENCES buildings(building_id),
    room_id UUID REFERENCES rooms(room_id),
    mac_address VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 23. curfew_policies
CREATE TABLE curfew_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(building_id),
    resident_type VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type VARCHAR(20) NOT NULL,
    priority INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 24. time_window_policies
CREATE TABLE time_window_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL REFERENCES buildings(building_id),
    resident_type VARCHAR(20) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 25. access_history
CREATE TABLE access_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES students(student_id),
    gate_id UUID NOT NULL REFERENCES gates(gate_id),
    building_id UUID NOT NULL REFERENCES buildings(building_id),
    operator_id UUID,
    event_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    decision VARCHAR(20) NOT NULL,
    denial_reason TEXT,
    method VARCHAR(20) NOT NULL,
    direction VARCHAR(20) DEFAULT 'UNKNOWN',
    snapshot_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    -- Bảng sổ cái bất biến: Không có cột updated_at
);

-- 26. face_profiles
CREATE TABLE face_profiles (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID UNIQUE NOT NULL REFERENCES students(student_id),
    face_image_url VARCHAR(500),
    pending_face_image_url VARCHAR(500),
    replacement_requested_at TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(50) NOT NULL,
    rejection_reason TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 27. face_embeddings
CREATE TABLE face_embeddings (
    embedding_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES face_profiles(profile_id) ON DELETE CASCADE,
    vector vector(512) NOT NULL, 
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
-- HNSW Vector Index for fast cosine similarity search
CREATE INDEX idx_face_embeddings_hnsw ON face_embeddings USING hnsw (vector vector_cosine_ops);

-- 28. face_verification_attempts
CREATE TABLE face_verification_attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gate_device_id VARCHAR(50) NOT NULL,
    profile_id UUID REFERENCES face_profiles(profile_id),
    confidence_score DOUBLE PRECISION NOT NULL,
    status VARCHAR(50) NOT NULL,
    attempted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
    -- Dữ liệu lịch sử quét: Không có cột updated_at
);

-- ==========================================
-- PHÂN HỆ 7: THÔNG BÁO (NOTIFICATION)
-- ==========================================

-- 29. notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES user_accounts(account_id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url VARCHAR(500),
    notification_type VARCHAR(50) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    recipient VARCHAR(50) NOT NULL,
    channel VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    event_id VARCHAR(100),
    sent_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
