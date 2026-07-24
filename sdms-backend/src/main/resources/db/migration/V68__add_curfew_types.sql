-- V21_03__add_curfew_types.sql
ALTER TYPE curfew_type_enum ADD VALUE 'STANDARD';
ALTER TYPE curfew_type_enum ADD VALUE 'HARD_LOCKDOWN';
ALTER TYPE curfew_type_enum ADD VALUE 'SPECIAL_EVENT';
