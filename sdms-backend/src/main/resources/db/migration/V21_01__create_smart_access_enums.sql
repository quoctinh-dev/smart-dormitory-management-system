-- V21_01__create_smart_access_enums.sql
-- Smart Access Module Enums (PostgreSQL 17 Native)

CREATE TYPE access_decision_enum AS ENUM (
    'GRANTED',
    'DENIED'
);

CREATE TYPE override_type_enum AS ENUM (
    'REMOTE_UNLOCK',
    'FIRE_EMERGENCY',
    'SECURITY_LOCKDOWN'
);

CREATE TYPE verification_method_enum AS ENUM (
    'FACE_AI',
    'RFID',
    'MANUAL_OVERRIDE',
    'REMOTE_UNLOCK'
);

CREATE TYPE resident_type_enum AS ENUM (
    'BOARDING',
    'NON_BOARDING'
);

CREATE TYPE curfew_type_enum AS ENUM (
    'STRICT',
    'SOFT_WARNING'
);
