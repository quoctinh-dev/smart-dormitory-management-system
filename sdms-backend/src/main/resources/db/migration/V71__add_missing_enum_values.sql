-- V71__add_missing_enum_values.sql
-- Thêm các phương thức xác thực bị thiếu vào ENUM trong Database

ALTER TYPE verification_method_enum ADD VALUE IF NOT EXISTS 'RFID_AND_FACE';
ALTER TYPE verification_method_enum ADD VALUE IF NOT EXISTS 'PIN';
