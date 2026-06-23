-- ==========================================
-- PHẦN 1: TÀI KHOẢN QUẢN TRỊ (ADMIN ACCOUNT)
-- ==========================================
-- Chạy đoạn script này trước để có tài khoản đăng nhập vào Web Admin.
-- Tài khoản: admin / Mật khẩu: 123456 (Đã được băm bằng BCrypt)
-- Mật khẩu BCrypt: $2a$10$CjMM7XNYNW2nHmzFUnUV9.oIM4fCWmlmE8Kq3HFjn5TrtJRLg0iIS

INSERT INTO user_accounts (
    account_id, 
    username, 
    email, 
    password, 
    role, 
    status, 
    created_at, 
    updated_at
) VALUES (
    '11111111-1111-1111-1111-111111111111', 
    'admin', 
    'admin@sdms.edu.vn', 
    '$2a$10$CjMM7XNYNW2nHmzFUnUV9.oIM4fCWmlmE8Kq3HFjn5TrtJRLg0iIS',
    'ADMIN', 
    'ACTIVE', 
    CURRENT_TIMESTAMP, 
    CURRENT_TIMESTAMP
);

-- ==========================================
-- PHẦN 2: DỮ LIỆU TÒA NHÀ & PHÒNG (ROOM MODULE)
-- ==========================================
-- Cung cấp 2 tòa nhà (1 Nam, 1 Nữ), mỗi tòa 1 tầng, mỗi tầng 1 phòng mẫu.

-- 1. Thêm Tòa Nhà (Buildings)
INSERT INTO buildings (building_id, code, name, description, status, created_at, updated_at) VALUES 
('a1111111-1111-1111-1111-111111111111', 'A', 'Tòa A (Nam)', 'Khu KTX dành cho Nam sinh viên', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
INSERT INTO buildings (building_id, code, name, description, status, created_at, updated_at) VALUES
    ('b2222222-2222-2222-2222-222222222222', 'B', 'Tòa B (Nữ)', 'Khu KTX dành cho Nữ sinh viên', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Thêm Tầng (Floors)
INSERT INTO floors (floor_id, building_id, floor_number, occupancy_policy, created_at, updated_at) VALUES 
('f1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 1, 'MALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('f2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 1, 'FEMALE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 3. Thêm Phòng (Rooms)
INSERT INTO rooms (room_id, floor_id, room_code, capacity, occupied_beds, status, created_at, updated_at) VALUES
                                                                                                              ('c1111111-1111-1111-1111-111111111111', 'f1111111-1111-1111-1111-111111111111', 'A101', 4, 0, 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                                              ('c2222222-2222-2222-2222-222222222222', 'f2222222-2222-2222-2222-222222222222', 'B101', 2, 0, 'AVAILABLE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 4. Thêm Giường (Beds)
INSERT INTO beds (bed_id, room_id, bed_code, status, note, created_at, updated_at) VALUES
                                                                                       ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'A101-01', 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                       ('d2111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'A101-02', 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                       ('d3111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'A101-03', 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                       ('d4111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'A101-04', 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                       ('d5222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'B101-01', 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
                                                                                       ('d6222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'B101-02', 'AVAILABLE', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- 2. Thêm Đợt Đăng Ký (Registration Period)
-- Trạng thái: OPEN_REGISTRATION (Tất cả sinh viên đều được phép đăng ký)
-- Thời gian: Từ quá khứ đến tương lai (để luôn Active)
INSERT INTO registration_periods (period_id, period_name, start_date, end_date, is_active, registration_type, created_at, updated_at)
VALUES (
           'e1111111-1111-1111-1111-111111111111',
           'Đợt đăng ký KTX Học kỳ 1 Năm học 2026-2027 (Mở Tự Do)',
           CURRENT_TIMESTAMP - INTERVAL '1 day',
           CURRENT_TIMESTAMP + INTERVAL '30 days',
           TRUE,
           'OPEN_REGISTRATION',
           CURRENT_TIMESTAMP,
           CURRENT_TIMESTAMP
       );

DROP SCHEMA public CASCADE;
CREATE SCHEMA public;

DELETE FROM buildings where status ilike 'ACTIVE';
SELECT * FROM floors;
SELECT * FROM rooms;


