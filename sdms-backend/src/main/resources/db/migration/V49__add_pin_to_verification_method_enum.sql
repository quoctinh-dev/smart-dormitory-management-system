-- V49__add_pin_to_verification_method_enum.sql
-- Thêm giá trị 'PIN' vào enum verification_method_enum để hỗ trợ xác thực bằng mã PIN cửa phòng

ALTER TYPE verification_method_enum ADD VALUE IF NOT EXISTS 'PIN';
