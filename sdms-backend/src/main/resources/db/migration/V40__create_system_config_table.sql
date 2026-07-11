-- V40__create_system_config_table.sql

CREATE TABLE system_configs (
    config_key VARCHAR(100) PRIMARY KEY,
    config_value VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Thêm dữ liệu mẫu ban đầu cho Điện và Nước, Hạn thanh toán
INSERT INTO system_configs (config_key, config_value, description) VALUES
('ELECTRICITY_PRICE_PER_KWH', '3500', 'Đơn giá điện năng tiêu thụ (VND/kWh)'),
('WATER_PRICE_PER_M3', '15000', 'Đơn giá nước sinh hoạt (VND/m3)'),
('PAYMENT_DEADLINE_DAYS', '3', 'Số ngày tối đa để thanh toán kể từ khi xuất hóa đơn');
