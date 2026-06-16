-- =====================================================
-- SDMS V1 TEST DATA - FULL VERSION
-- Cập nhật khớp với RegistrationType mới
-- =====================================================

-- 1. STAFF ACCOUNT
INSERT INTO user_accounts (
    account_id, username, email, password, role, status, created_at, updated_at
)
VALUES (
           gen_random_uuid(),
           'staff01',
           'staff01@sdms.com',
           '$2a$10$8l1fqN6ICT9UGiHR2elTR.qwVpPMHdNG8zne5aN2yZebXHXbwoAhW',
           'STAFF',
           'ACTIVE',
           NOW(),
           NOW()
       );

-- 2. REGISTRATION PERIODS
-- Đảm bảo thứ tự cột: id, name, start, end, active, type, created, updated
INSERT INTO registration_periods (
    period_id, period_name, start_date, end_date, is_active, registration_type, created_at, updated_at
)
VALUES
    (
        '11111111-1111-1111-1111-111111111111',
        'Current Resident Registration',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '30 day',
        TRUE,
        'CURRENT_RESIDENT',
        NOW(),
        NOW()
    ),
    (
        '22222222-2222-2222-2222-222222222222',
        'New Student Registration',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '30 day',
        FALSE,
        'NEW_STUDENT',
        NOW(),
        NOW()
    ),
    (
        '33333333-3333-3333-3333-333333333333',
        'Open Registration',
        NOW() - INTERVAL '1 day',
        NOW() + INTERVAL '30 day',
        FALSE,
        'OPEN_REGISTRATION',
        NOW(),
        NOW()
    );

-- 3. ELIGIBILITY LIST
INSERT INTO registration_eligibilities (
    eligibility_id, period_id, cccd, full_name, created_at, updated_at
)
VALUES
    (
        gen_random_uuid(),
        '11111111-1111-1111-1111-111111111111',
        '079000000001',
        'Nguyen Van Test',
        NOW(),
        NOW()
    ),
    (
        gen_random_uuid(),
        '22222222-2222-2222-2222-222222222222',
        '079000000002',
        'Tran Thi NewStudent',
        NOW(),
        NOW()
    );

-- 4. APPLICATION & STUDENT (Dữ liệu mẫu để test tính năng sau này)
INSERT INTO dormitory_applications (
    application_id, version, period_id, full_name, dob, gender, cccd, email, phone,
    permanent_address, father_name, father_phone, mother_name, mother_phone,
    emergency_contact, status, priority_score, application_code, created_at, updated_at
)
VALUES (
           'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 0, '11111111-1111-1111-1111-111111111111',
           'Nguyen Van Test', '2005-01-01', 'MALE', '079000000001', 'student@test.com', '0901234567',
           'Da Nang', 'Nguyen Van Father', '0901111111', 'Tran Thi Mother', '0902222222',
           '0903333333', 'APPROVED', 0, 'APP-2025-001', NOW(), NOW()
       );

INSERT INTO students (
    student_id, source_application_id, student_code, full_name, cccd, email, phone,
    status, created_at, updated_at
)
VALUES (
           'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
           'SV2025001', 'Nguyen Van Test', '079000000001', 'student@test.com', '0901234567',
           'ACTIVE', NOW(), NOW()
       );


