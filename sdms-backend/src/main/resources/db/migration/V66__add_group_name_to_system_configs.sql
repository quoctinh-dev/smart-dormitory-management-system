-- ==============================================================================
-- Migration: V66__add_group_name_to_system_configs.sql
-- Description: Add group_name column to group configs for UI filtering
-- Module: System
-- ==============================================================================

ALTER TABLE system_configs ADD COLUMN group_name VARCHAR(100);

-- Update existing configs to have a group_name
UPDATE system_configs SET group_name = 'SMART_ACCESS' WHERE config_key = 'FACE_GRACE_PERIOD_DAYS';
UPDATE system_configs SET group_name = 'PAYMENT' WHERE config_key LIKE '%PAYMENT%' OR config_key LIKE '%BILL%';
UPDATE system_configs SET group_name = 'GENERAL' WHERE group_name IS NULL;
