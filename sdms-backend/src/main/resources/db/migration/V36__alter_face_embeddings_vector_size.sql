-- Clean up existing 192-dimension vectors to avoid cast errors during type alteration
TRUNCATE TABLE face_embeddings CASCADE;

-- Alter the vector column to accept 512-dimension vectors
ALTER TABLE face_embeddings 
ALTER COLUMN vector TYPE vector(512);
