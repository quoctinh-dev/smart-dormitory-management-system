-- =========================================================================
-- SDMS APPLICATION MODULE DATABASE REFACTOR - V16
-- =========================================================================

-- 1. Cập nhật bảng registration_eligibilities (Hỗ trợ danh sách import)
ALTER TABLE registration_eligibilities
    ADD COLUMN email VARCHAR(100),
    ADD COLUMN student_code VARCHAR(50),
    ADD COLUMN target VARCHAR(50) DEFAULT 'FRESHMAN';

-- 2. Cập nhật bảng dormitory_applications (Thêm đầy đủ các trường biểu mẫu và đối chiếu)
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

-- 3. Cập nhật bảng verification_documents (Bổ sung thông tin duyệt tài liệu)
ALTER TABLE verification_documents
    ADD COLUMN note TEXT,
    ADD COLUMN verified_at TIMESTAMP;

-- 4. Tạo bảng application_priorities (Hỗ trợ sinh viên có nhiều ưu tiên)
CREATE TABLE application_priorities (
    application_priority_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    priority_category VARCHAR(50) NOT NULL,
    priority_score INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_priority_application
        FOREIGN KEY (application_id)
            REFERENCES dormitory_applications(application_id)
            ON DELETE CASCADE,
            
    CONSTRAINT uk_app_priority_category
        UNIQUE (application_id, priority_category)
);

CREATE INDEX idx_app_priority_application_id ON application_priorities(application_id);

-- 5. Tạo bảng dormitory_application_status_history (Ghi nhận vết chuyển đổi trạng thái)
CREATE TABLE dormitory_application_status_history (
    history_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    from_status VARCHAR(20),
    to_status VARCHAR(20) NOT NULL,
    changed_by_user_id UUID,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    
    CONSTRAINT fk_status_history_application
        FOREIGN KEY (application_id)
            REFERENCES dormitory_applications(application_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_status_history_application_id ON dormitory_application_status_history(application_id);

-- 6. Tạo bảng application_generated_documents (Quản lý các tài liệu PDF sinh tự động)
CREATE TABLE application_generated_documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    template_version VARCHAR(10) NOT NULL DEFAULT 'V1.0',
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_gen_doc_application
        FOREIGN KEY (application_id)
            REFERENCES dormitory_applications(application_id)
            ON DELETE CASCADE
);

CREATE INDEX idx_gen_doc_application_id ON application_generated_documents(application_id);

-- 7. Ràng buộc dữ liệu & Tối ưu Index
-- Đảm bảo mỗi CCCD chỉ được nộp tối đa 1 hồ sơ trong 1 đợt
CREATE UNIQUE INDEX uk_period_cccd ON dormitory_applications(period_id, cccd);

-- Tối ưu tìm kiếm nhanh theo CCCD và mã số sinh viên trên hồ sơ
CREATE INDEX idx_dorm_app_cccd ON dormitory_applications(cccd);
CREATE INDEX idx_dorm_app_student_code ON dormitory_applications(student_code);

-- Tối ưu hóa Job quét danh sách chờ theo điểm số và thời gian nộp
CREATE INDEX idx_dorm_app_waiting_list_promotion 
    ON dormitory_applications(gender, priority_score DESC, created_at ASC) 
    WHERE status = 'WAITING_LIST';
