-- ==============================================================================
-- Migration: V65__drop_application_generated_documents.sql
-- Description: Drop redundant table since PDF URLs are saved directly in dormitory_applications
-- Module: Application
-- ==============================================================================

DROP TABLE IF EXISTS application_generated_documents;
