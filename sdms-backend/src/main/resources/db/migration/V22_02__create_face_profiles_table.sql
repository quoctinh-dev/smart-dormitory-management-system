-- ==============================================================================
-- Migration: V22_02__create_face_profiles_table.sql
-- Description: Creates the FaceProfile aggregate root table
-- Module: Face
-- ==============================================================================

CREATE TABLE face_profiles (
    profile_id UUID PRIMARY KEY,
    student_id UUID NOT NULL,
    
    face_image_url VARCHAR(500),
    pending_face_image_url VARCHAR(500),
    replacement_requested_at TIMESTAMP WITHOUT TIME ZONE,
    
    status VARCHAR(50) NOT NULL,
    rejection_reason TEXT,
    
    approved_by UUID,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    
    CONSTRAINT uk_face_profiles_student_id UNIQUE (student_id)
);

-- Index for searching and sorting pending requests efficiently
CREATE INDEX idx_face_profiles_status_created 
    ON face_profiles (status, created_at);


