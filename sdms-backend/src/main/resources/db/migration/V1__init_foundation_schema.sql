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

-- 2. Đơn đăng ký (Full field STU + Versioning + PDF)
CREATE TABLE dormitory_applications (
                                        application_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                                        version BIGINT NOT NULL DEFAULT 0,
                                        period_id UUID REFERENCES registration_periods(period_id),

    -- Thông tin cá nhân
                                        full_name VARCHAR(100) NOT NULL,
                                        dob DATE NOT NULL,
                                        gender VARCHAR(10) NOT NULL,
                                        cccd VARCHAR(20) NOT NULL,
                                        issue_date DATE,
                                        issue_place VARCHAR(100),
                                        email VARCHAR(100),
                                        phone VARCHAR(20),
                                        permanent_address TEXT,

    -- Thông tin gia đình
                                        father_name VARCHAR(100),
                                        father_phone VARCHAR(20),
                                        mother_name VARCHAR(100),
                                        mother_phone VARCHAR(20),
                                        emergency_contact VARCHAR(20),

    -- Trạng thái, Ưu tiên & File
                                        status VARCHAR(20) NOT NULL,
                                        priority_category VARCHAR(50),
                                        priority_score INTEGER DEFAULT 0,
                                        application_code VARCHAR(50) UNIQUE NOT NULL,
                                        application_pdf_url TEXT,

                                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tài liệu xác thực (Với trạng thái duyệt)
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

    -- THÔNG TIN GIA ĐÌNH
                          father_name VARCHAR(100),
                          father_phone VARCHAR(20),
                          mother_name VARCHAR(100),
                          mother_phone VARCHAR(20),
                          emergency_contact VARCHAR(20),

    -- THÔNG TIN HỌC VỤ & ĐỊA CHỈ
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