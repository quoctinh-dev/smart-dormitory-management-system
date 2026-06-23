-- ==============================================================================
-- Migration: V22_03__create_face_embeddings_table.sql
-- Description: Creates the FaceEmbedding table with HNSW vector index
-- Module: Face
-- ==============================================================================

CREATE TABLE face_embeddings (
    embedding_id UUID PRIMARY KEY,
    profile_id UUID NOT NULL,
    
    -- Mapped to @Column(name = "vector") in FaceEmbedding.java
    vector vector(512) NOT NULL,
    
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version INTEGER NOT NULL DEFAULT 0,
    
    CONSTRAINT uk_face_embeddings_profile_id UNIQUE (profile_id),
    CONSTRAINT fk_face_embeddings_profile_id 
        FOREIGN KEY (profile_id) 
        REFERENCES face_profiles(profile_id) 
        ON DELETE CASCADE
);

-- HNSW Vector Index for fast cosine similarity search
CREATE INDEX idx_face_embeddings_hnsw 
    ON face_embeddings 
    USING hnsw (vector vector_cosine_ops);
