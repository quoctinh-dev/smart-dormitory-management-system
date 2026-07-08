-- SDMS (Smart Dormitory Management System) - Master Database Schema
-- Version: 1.0
-- tree /F /A > structure.txt
-- =================================================================================

-- =================================================================================
-- V1: FOUNDATION SCHEMA
-- =================================================================================
-- Kích hoạt extension UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Đợt đăng ký
CREATE TABLE registration_periods (
    period_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_name VARCHAR(100) NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Đơn đăng ký
CREATE TABLE dormitory_applications (
    application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    version BIGINT NOT NULL DEFAULT 0,
    period_id UUID REFERENCES registration_periods(period_id),
    full_name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    cccd VARCHAR(20) NOT NULL,
    issue_date DATE,
    issue_place VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    permanent_address TEXT,
    father_name VARCHAR(100),
    father_phone VARCHAR(20),
    mother_name VARCHAR(100),
    mother_phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    status VARCHAR(20) NOT NULL,
    priority_category VARCHAR(50),
    priority_score INTEGER DEFAULT 0,
    application_code VARCHAR(50) UNIQUE NOT NULL,
    application_pdf_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tài liệu xác thực
CREATE TABLE verification_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID REFERENCES dormitory_applications(application_id),
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Students
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
    emergency_contact VARCHAR(20),
    permanent_address TEXT,
    faculty VARCHAR(100),
    academic_year VARCHAR(20),
    status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bảng User Accounts
CREATE TABLE user_accounts (
    account_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING_ACTIVATION' NOT NULL,
    last_login TIMESTAMP,
    student_id UUID UNIQUE REFERENCES students(student_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =================================================================================
-- V2: ADD REFRESH TOKEN
-- =================================================================================
ALTER TABLE user_accounts ADD COLUMN refresh_token VARCHAR(500) NULL;
ALTER TABLE user_accounts ADD COLUMN refresh_token_expiry TIMESTAMP NULL;
CREATE UNIQUE INDEX idx_user_accounts_refresh_token ON user_accounts(refresh_token);

-- =================================================================================
-- V3: ADD PASSWORD RESET
-- =================================================================================
ALTER TABLE user_accounts ADD COLUMN reset_password_token VARCHAR(255) NULL;
ALTER TABLE user_accounts ADD COLUMN reset_password_expiry TIMESTAMP NULL;
CREATE INDEX idx_user_accounts_reset_token ON user_accounts (reset_password_token);

-- =================================================================================
-- V4: ADD AVATAR URL
-- =================================================================================
ALTER TABLE students ADD COLUMN avatar_url VARCHAR(500);

-- =================================================================================
-- V5: REGISTRATION MODULE
-- =================================================================================
ALTER TABLE registration_periods ADD COLUMN registration_type VARCHAR(50) NOT NULL DEFAULT 'OPEN_REGISTRATION';

CREATE TABLE registration_eligibilities (
    eligibility_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    period_id UUID NOT NULL,
    cccd VARCHAR(20) NOT NULL,
    full_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_eligibility_period FOREIGN KEY (period_id) REFERENCES registration_periods(period_id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX uk_eligibility_period_cccd ON registration_eligibilities(period_id, cccd);
CREATE INDEX idx_eligibility_cccd ON registration_eligibilities(cccd);
COMMENT ON TABLE registration_eligibilities IS 'Danh sách sinh viên đủ điều kiện đăng ký ký túc xá theo từng đợt';

-- =================================================================================
-- V6: ADD UNIQUE ACTIVE REGISTRATION
-- =================================================================================
CREATE UNIQUE INDEX idx_unique_active_registration_period ON registration_periods (is_active) WHERE is_active = TRUE;

-- =================================================================================
-- V7: ROOM MODULE
-- =================================================================================
CREATE TABLE buildings (
    building_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE floors (
    floor_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    building_id UUID NOT NULL,
    floor_number INTEGER NOT NULL,
    occupancy_policy VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_floor_building FOREIGN KEY (building_id) REFERENCES buildings(building_id),
    CONSTRAINT uk_building_floor UNIQUE (building_id, floor_number)
);

CREATE TABLE rooms (
    room_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    floor_id UUID NOT NULL,
    room_code VARCHAR(30) NOT NULL,
    capacity INTEGER NOT NULL,
    occupied_beds INTEGER NOT NULL DEFAULT 0,
    monthly_fee NUMERIC(12,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_room_floor FOREIGN KEY (floor_id) REFERENCES floors(floor_id),
    CONSTRAINT uk_floor_room_code UNIQUE (floor_id, room_code)
);

CREATE TABLE beds (
    bed_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL,
    bed_code VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL,
    note VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bed_room FOREIGN KEY (room_id) REFERENCES rooms(room_id),
    CONSTRAINT uk_room_bed_code UNIQUE (room_id, bed_code)
);

CREATE TABLE student_housing_assignments (
    assignment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    student_id UUID,
    bed_id UUID NOT NULL,
    status VARCHAR(30) NOT NULL,
    reserved_at TIMESTAMP,
    check_in_at TIMESTAMP,
    check_out_at TIMESTAMP,
    expected_check_out_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assignment_student FOREIGN KEY (student_id) REFERENCES students(student_id),
    CONSTRAINT fk_assignment_bed FOREIGN KEY (bed_id) REFERENCES beds(bed_id),
    CONSTRAINT fk_assignment_application FOREIGN KEY (application_id) REFERENCES dormitory_applications(application_id)
);

CREATE INDEX idx_building_status ON buildings(status);
CREATE INDEX idx_room_status ON rooms(status);
CREATE INDEX idx_bed_status ON beds(status);
CREATE INDEX idx_assignment_status ON student_housing_assignments(status);
CREATE INDEX idx_assignment_student ON student_housing_assignments(student_id);
CREATE INDEX idx_assignment_bed ON student_housing_assignments(bed_id);
CREATE INDEX idx_assignment_application_id ON student_housing_assignments(application_id);
CREATE UNIQUE INDEX uk_active_assignment_application ON student_housing_assignments(application_id) WHERE status IN ('RESERVED', 'OCCUPIED');
CREATE UNIQUE INDEX uk_active_assignment_student ON student_housing_assignments(student_id) WHERE status IN ('RESERVED', 'OCCUPIED') AND student_id IS NOT NULL;

-- =================================================================================
-- V9: REMOVE FEE FROM ROOM
-- =================================================================================
ALTER TABLE rooms DROP COLUMN monthly_fee;

-- =================================================================================
-- V10: WAITING LIST & DEADLINES
-- =================================================================================
ALTER TABLE dormitory_applications
    ADD COLUMN waiting_list_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN payment_deadline TIMESTAMP WITHOUT TIME ZONE,
    ADD COLUMN approved_at TIMESTAMP WITHOUT TIME ZONE;

CREATE INDEX idx_dorm_app_status_waiting ON dormitory_applications(status, gender) WHERE status = 'WAITING_LIST';
CREATE INDEX idx_dorm_app_payment_deadline ON dormitory_applications(payment_deadline) WHERE status = 'WAITING_PAYMENT';

-- =================================================================================
-- V11: SCHEDULER INFRASTRUCTURE (SHEDLOCK)
-- =================================================================================
CREATE TABLE shedlock (
    name VARCHAR(64) NOT NULL,
    lock_until TIMESTAMP NOT NULL,
    locked_at TIMESTAMP NOT NULL,
    locked_by VARCHAR(255) NOT NULL,
    CONSTRAINT pk_shedlock PRIMARY KEY (name)
);

-- =================================================================================
-- V12: ADD UNIQUE BED ASSIGNMENT
-- =================================================================================
CREATE UNIQUE INDEX uk_active_assignment_bed ON student_housing_assignments(bed_id) WHERE status IN ('RESERVED', 'OCCUPIED');

-- =================================================================================
-- V13: PAYMENT MODULE
-- =================================================================================
CREATE TABLE bills (
    bill_id UUID PRIMARY KEY,
    bill_type VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    paid_amount NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    due_date DATE,
    description TEXT,
    version BIGINT NOT NULL DEFAULT 0,
    assignment_id UUID,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_bills_assignment FOREIGN KEY (assignment_id) REFERENCES student_housing_assignments(assignment_id)
);

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY,
    bill_id UUID NOT NULL,
    amount NUMERIC(15, 2) NOT NULL,
    method VARCHAR(30) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    transaction_code VARCHAR(100) NOT NULL,
    description TEXT,
    gateway_metadata TEXT,
    paid_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE CASCADE,
    CONSTRAINT uk_payments_transaction_code UNIQUE (transaction_code)
);

CREATE INDEX idx_bills_assignment_id ON bills(assignment_id);
CREATE INDEX idx_bills_status ON bills(status);
CREATE INDEX idx_payments_bill_id ON payments(bill_id);

-- =================================================================================
-- V15: FACE REGISTRATION SUPPORT
-- =================================================================================
ALTER TABLE students ADD COLUMN IF NOT EXISTS face_image_url VARCHAR(500);
ALTER TABLE students ADD COLUMN IF NOT EXISTS is_face_registered BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE students ALTER COLUMN status SET DEFAULT 'PENDING_CHECKIN';

-- =================================================================================
-- V16: APPLICATION MODULE REFACTOR
-- =================================================================================
ALTER TABLE registration_eligibilities
    ADD COLUMN email VARCHAR(100),
    ADD COLUMN student_code VARCHAR(50),
    ADD COLUMN target VARCHAR(50) DEFAULT 'FRESHMAN';

ALTER TABLE dormitory_applications
    ADD COLUMN reviewed_by_user_id UUID,
    ADD COLUMN review_note TEXT,
    ADD COLUMN student_code VARCHAR(50),
    ADD COLUMN pob VARCHAR(100),
    ADD COLUMN ethnic VARCHAR(50),
    ADD COLUMN religion VARCHAR(50),
    ADD COLUMN faculty VARCHAR(100),
    ADD COLUMN contact_address TEXT,
    ADD COLUMN father_yob INTEGER,
    ADD COLUMN father_job VARCHAR(100),
    ADD COLUMN mother_yob INTEGER,
    ADD COLUMN mother_job VARCHAR(100),
    ADD COLUMN family_contact TEXT,
    ALTER COLUMN emergency_contact TYPE VARCHAR(100),
    ADD COLUMN commitment_accepted BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN commitment_accepted_at TIMESTAMP,
    ADD COLUMN commitment_version VARCHAR(10),
    ADD COLUMN client_ip_address VARCHAR(45);

ALTER TABLE verification_documents
    ADD COLUMN note TEXT,
    ADD COLUMN verified_at TIMESTAMP;

CREATE TABLE application_priorities (
    application_priority_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    priority_category VARCHAR(50) NOT NULL,
    priority_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_priority_application FOREIGN KEY (application_id) REFERENCES dormitory_applications(application_id) ON DELETE CASCADE,
    CONSTRAINT uk_app_priority_category UNIQUE (application_id, priority_category)
);
CREATE INDEX idx_app_priority_application_id ON application_priorities(application_id);

CREATE TABLE dormitory_application_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by_user_id UUID,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    CONSTRAINT fk_status_history_application FOREIGN KEY (application_id) REFERENCES dormitory_applications(application_id) ON DELETE CASCADE
);
CREATE INDEX idx_status_history_application_id ON dormitory_application_status_history(application_id);

CREATE TABLE application_generated_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    template_version VARCHAR(10) NOT NULL DEFAULT 'V1.0',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_gen_doc_application FOREIGN KEY (application_id) REFERENCES dormitory_applications(application_id) ON DELETE CASCADE
);
CREATE INDEX idx_gen_doc_application_id ON application_generated_documents(application_id);

CREATE UNIQUE INDEX uk_period_cccd ON dormitory_applications(period_id, cccd);
CREATE INDEX idx_dorm_app_cccd ON dormitory_applications(cccd);
CREATE INDEX idx_dorm_app_student_code ON dormitory_applications(student_code);
CREATE INDEX idx_dorm_app_waiting_list_promotion ON dormitory_applications(gender, priority_score DESC, created_at ASC) WHERE status = 'WAITING_LIST';

-- =================================================================================
-- V17: ROOM MODULE REFACTOR
-- =================================================================================
DROP INDEX IF EXISTS uk_active_assignment_application;
DROP INDEX IF EXISTS uk_active_assignment_student;
DROP INDEX IF EXISTS uk_active_assignment_bed;

CREATE UNIQUE INDEX uk_active_assignment_application_v2 ON student_housing_assignments(application_id) WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED');
CREATE UNIQUE INDEX uk_active_assignment_student_v2 ON student_housing_assignments(student_id) WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED') AND student_id IS NOT NULL;
CREATE UNIQUE INDEX uk_active_assignment_bed_v2 ON student_housing_assignments(bed_id) WHERE status IN ('RESERVED', 'PENDING_CHECKIN', 'OCCUPIED');

ALTER TABLE rooms ADD CONSTRAINT chk_room_occupied_beds CHECK (occupied_beds >= 0 AND occupied_beds <= capacity);
ALTER TABLE rooms ADD CONSTRAINT chk_room_capacity_positive CHECK (capacity > 0);

-- =================================================================================
-- V18: PAYMENT MODULE REFACTOR
-- =================================================================================
ALTER TABLE payments ADD COLUMN gateway_transaction_id VARCHAR(100) NULL;
ALTER TABLE payments ADD CONSTRAINT uk_payments_gateway_transaction_id UNIQUE (gateway_transaction_id);

ALTER TABLE payments DROP CONSTRAINT fk_payments_bill;
ALTER TABLE payments ADD CONSTRAINT fk_payments_bill FOREIGN KEY (bill_id) REFERENCES bills(bill_id) ON DELETE RESTRICT;

ALTER TABLE bills ADD CONSTRAINT chk_bills_amount CHECK (amount > 0);
ALTER TABLE bills ADD CONSTRAINT chk_bills_paid_amount CHECK (paid_amount >= 0);
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount > 0);

ALTER TABLE bills ADD COLUMN room_id UUID NULL;
ALTER TABLE bills ADD COLUMN student_id UUID NULL;
ALTER TABLE bills ADD COLUMN application_id UUID NULL;
ALTER TABLE bills ADD CONSTRAINT fk_bills_room FOREIGN KEY (room_id) REFERENCES rooms(room_id) ON DELETE RESTRICT;
ALTER TABLE bills ADD CONSTRAINT fk_bills_student FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE RESTRICT;

CREATE INDEX idx_bills_room_id ON bills(room_id);
CREATE INDEX idx_bills_student_id ON bills(student_id);
CREATE INDEX idx_bills_application_id ON bills(application_id);
CREATE INDEX idx_bills_due_date ON bills(due_date);

-- =================================================================================
-- V19: ADD SUBMITTED AT
-- =================================================================================
ALTER TABLE dormitory_applications ADD COLUMN submitted_at TIMESTAMP;

-- =================================================================================
-- V21: SMART ACCESS MODULE
-- =================================================================================
CREATE TYPE access_decision_enum AS ENUM ('GRANTED', 'DENIED');
CREATE TYPE override_type_enum AS ENUM ('REMOTE_UNLOCK', 'FIRE_EMERGENCY', 'SECURITY_LOCKDOWN');
CREATE TYPE verification_method_enum AS ENUM ('FACE_AI', 'RFID', 'MANUAL_OVERRIDE', 'REMOTE_UNLOCK');
CREATE TYPE resident_type_enum AS ENUM ('BOARDING', 'NON_BOARDING');
CREATE TYPE curfew_type_enum AS ENUM ('STRICT', 'SOFT_WARNING');

CREATE TABLE curfew_policies (
    id UUID PRIMARY KEY,
    building_id UUID NOT NULL,
    resident_type resident_type_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type curfew_type_enum NOT NULL,
    priority INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_curfew_building_active ON curfew_policies(building_id, is_active);

CREATE TABLE time_window_policies (
    id UUID PRIMARY KEY,
    building_id UUID NOT NULL,
    resident_type resident_type_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_time_window_building_active ON time_window_policies(building_id, is_active);

CREATE TABLE access_history (
    id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    gate_id UUID NOT NULL,
    building_id UUID NOT NULL,
    operator_id UUID,
    event_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    decision access_decision_enum NOT NULL,
    denial_reason VARCHAR(255),
    method verification_method_enum NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_access_history_student ON access_history(student_id);
CREATE INDEX idx_access_history_building ON access_history(building_id);
CREATE INDEX idx_access_history_decision ON access_history(decision);
CREATE INDEX idx_access_history_timestamp ON access_history USING BRIN (event_timestamp);
REVOKE DELETE, UPDATE ON access_history FROM PUBLIC;

CREATE TABLE processed_messages (
    message_id VARCHAR(128) PRIMARY KEY,
    processed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    source VARCHAR(100) NOT NULL
);
CREATE INDEX idx_processed_messages_id_hash ON processed_messages USING HASH (message_id);

-- =================================================================================
-- V22: FACE MODULE
-- =================================================================================
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE face_profiles (
    profile_id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    face_image_url VARCHAR(500),
    pending_face_image_url VARCHAR(500),
    replacement_requested_at TIMESTAMP WITHOUT TIME ZONE,
    status VARCHAR(50) NOT NULL,
    rejection_reason TEXT,
    approved_by UUID,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uk_face_profiles_student_id UNIQUE (student_id)
);
CREATE INDEX idx_face_profiles_status_created ON face_profiles (status, created_at);

CREATE TABLE face_embeddings (
    embedding_id UUID PRIMARY KEY,
    profile_id UUID NOT NULL,
    vector vector(512) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT uk_face_embeddings_profile_id UNIQUE (profile_id),
    CONSTRAINT fk_face_embeddings_profile_id FOREIGN KEY (profile_id) REFERENCES face_profiles(profile_id) ON DELETE CASCADE
);
CREATE INDEX idx_face_embeddings_hnsw ON face_embeddings USING hnsw (vector vector_cosine_ops);

CREATE TABLE face_verification_attempts (
    attempt_id UUID PRIMARY KEY,
    gate_device_id VARCHAR(100) NOT NULL,
    profile_id UUID,
    confidence_score NUMERIC(10,8),
    status VARCHAR(50) NOT NULL,
    attempted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_face_verification_attempts_profile_id FOREIGN KEY (profile_id) REFERENCES face_profiles(profile_id) ON DELETE SET NULL
);
CREATE INDEX idx_face_verif_profile_id ON face_verification_attempts (profile_id);
CREATE INDEX idx_face_verif_gate_time ON face_verification_attempts (gate_device_id, attempted_at);

-- =================================================================================
-- V23: ADD REVISION DEADLINE
-- =================================================================================
ALTER TABLE dormitory_applications ADD COLUMN revision_deadline TIMESTAMP;

-- =================================================================================
-- V24: ADD PDF URLS
-- =================================================================================
ALTER TABLE dormitory_applications
    ADD COLUMN registration_form_pdf_url TEXT,
    ADD COLUMN commitment_form_pdf_url TEXT;

-- =================================================================================
-- V25: NOTIFICATION HISTORY
-- =================================================================================
CREATE TABLE notification_histories (
    id BIGSERIAL PRIMARY KEY,
    recipient VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    notification_type VARCHAR(50) NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_noti_recipient ON notification_histories(recipient);
CREATE INDEX idx_noti_status ON notification_histories(status);

-- =================================================================================
-- END OF SCHEMA
-- =================================================================================


TRUNCATE TABLE face_verification_attempts CASCADE;
TRUNCATE TABLE face_embeddings CASCADE;
TRUNCATE TABLE face_profiles CASCADE;
TRUNCATE TABLE access_history CASCADE;
TRUNCATE TABLE processed_messages CASCADE;
TRUNCATE TABLE payments CASCADE;
TRUNCATE TABLE bills CASCADE;
TRUNCATE TABLE student_housing_assignments CASCADE;
TRUNCATE TABLE students CASCADE;
TRUNCATE TABLE application_generated_documents CASCADE;
TRUNCATE TABLE dormitory_application_status_history CASCADE;
TRUNCATE TABLE application_priorities CASCADE;
TRUNCATE TABLE verification_documents CASCADE;
TRUNCATE TABLE dormitory_applications CASCADE;
TRUNCATE TABLE registration_eligibilities CASCADE;
TRUNCATE TABLE registration_periods CASCADE;
TRUNCATE TABLE shedlock CASCADE;


SELECT * FROM user_accounts;






