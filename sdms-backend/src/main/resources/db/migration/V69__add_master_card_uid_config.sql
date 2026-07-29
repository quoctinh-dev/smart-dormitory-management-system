-- V69__add_master_card_uid_config.sql
-- Thêm cấu hình thẻ Master Card dùng để mở cửa khi rớt mạng.
-- Giá trị mặc định là FF FF FF FF, admin có thể chỉnh sửa trên web để đồng bộ xuống ESP32.

INSERT INTO system_configs (config_key, config_value, description, group_name)
VALUES (
    'MASTER_CARD_UID',
    'FF FF FF FF',
    'Mã UID Thẻ Từ đặc quyền của Bảo vệ. Dùng để mở cổng chính khi thiết bị IoT mất kết nối mạng (Offline). Định dạng HEX (vd: 1A 2B 3C 4D).',
    'SMART_ACCESS'
)
ON CONFLICT (config_key) DO NOTHING;
