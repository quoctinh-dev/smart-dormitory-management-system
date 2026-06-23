-- ==============================================================================
-- Migration: V22_04__create_face_verification_attempts_table.sql
-- Description: Creates the FaceVerificationAttempt append-only ledger table
-- Module: Face
-- ==============================================================================

CREATE TABLE face_verification_attempts (
    attempt_id UUID PRIMARY KEY,
    
    gate_device_id VARCHAR(100) NOT NULL,
    profile_id UUID,
    
    confidence_score NUMERIC(10,8),
    status VARCHAR(50) NOT NULL,
    
    attempted_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_face_verification_attempts_profile_id 
        FOREIGN KEY (profile_id) 
        REFERENCES face_profiles(profile_id) 
        ON DELETE SET NULL
);

-- Index for retrieving a specific student's verification history
CREATE INDEX idx_face_verif_profile_id 
    ON face_verification_attempts (profile_id);

-- Composite index for analyzing access patterns at a specific gate over time
CREATE INDEX idx_face_verif_gate_time 
    ON face_verification_attempts (gate_device_id, attempted_at);
