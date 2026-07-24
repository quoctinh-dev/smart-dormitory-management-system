-- ==============================================================================
-- Migration: V67__remove_water_price_config_and_update_groups.sql
-- Description: Remove water price and fix system config groups
-- ==============================================================================

-- 1. Xóa cấu hình giá nước vì nước miễn phí
DELETE FROM system_configs WHERE config_key = 'WATER_PRICE_PER_M3';

-- 2. Sắp xếp lại nhóm cho chuẩn
UPDATE system_configs SET group_name = 'SMART_ACCESS' WHERE config_key IN ('DUAL_AUTH_START', 'DUAL_AUTH_END', 'GLOBAL_CURFEW_START', 'GLOBAL_CURFEW_END', 'LATE_RETURN_DEADLINE');
UPDATE system_configs SET group_name = 'PAYMENT' WHERE config_key IN ('ELECTRICITY_PRICE_PER_KWH', 'MONTHLY_ROOM_FEE');
UPDATE system_configs SET group_name = 'GENERAL' WHERE config_key = 'MIN_CHECKOUT_NOTICE_DAYS';
