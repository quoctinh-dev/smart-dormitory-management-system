-- ==============================================================================
-- Migration: V22_01__enable_vector_extension.sql
-- Description: Enables the pgvector extension required for biometric embeddings
-- Module: Face
-- ==============================================================================

-- Safely enable the pgvector extension. 
-- Required for the vector(512) data type and hnsw index.
CREATE EXTENSION IF NOT EXISTS vector;
