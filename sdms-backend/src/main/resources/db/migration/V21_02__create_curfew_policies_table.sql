-- V21_02__create_curfew_policies_table.sql
-- Curfew Policies for Smart Access

CREATE TABLE curfew_policies (
    id UUID PRIMARY KEY,
    building_id UUID NOT NULL,
    resident_type resident_type_enum NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    type curfew_type_enum NOT NULL,
    priority INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);

-- Optimize Rule Engine evaluation queries
CREATE INDEX idx_curfew_building_active ON curfew_policies(building_id, is_active);
