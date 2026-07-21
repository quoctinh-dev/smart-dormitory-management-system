INSERT INTO system_configs (config_key, config_value, description)
VALUES ('PAYMENT_CHUNK_MONTHS', '3', 'Số tháng mỗi đợt thanh toán (vd: 3 tháng)')
ON CONFLICT (config_key) DO NOTHING;

INSERT INTO system_configs (config_key, config_value, description)
VALUES ('MONTHLY_ROOM_FEE', '350000', 'Đơn giá lưu trú KTX mỗi tháng (VNĐ)')
ON CONFLICT (config_key) DO NOTHING;
