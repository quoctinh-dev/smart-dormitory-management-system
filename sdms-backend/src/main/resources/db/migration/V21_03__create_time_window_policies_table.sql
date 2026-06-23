-- V21_03__create_time_window_policies_table.sql
-- Time Window Policies for Smart Access

CREATE TABLE time_window_policies (
    id UUID PRIMARY KEY,
    building_id UUID NOT NULL,
    resident_type resident_type_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_time_window_building_active ON time_window_policies(building_id, is_active);
