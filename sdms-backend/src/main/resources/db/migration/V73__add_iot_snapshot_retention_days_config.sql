INSERT INTO system_configs (config_key, config_value, description, group_name, created_at, updated_at) 
VALUES ('IOT_SNAPSHOT_RETENTION_DAYS', '30', 'Số ngày lưu trữ ảnh chụp lén từ hệ thống IoT. Sau số ngày này, ảnh sẽ bị xóa để tiết kiệm dung lượng.', 'SMART_ACCESS', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (config_key) DO NOTHING;
