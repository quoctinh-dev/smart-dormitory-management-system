-- Migration V55: Add separate PDF URL columns to stay_extensions table
-- Context: StayExtension entity was updated to store 2 separate PDF documents:
--   1. contract_pdf_url   -> Phiếu đăng ký gia hạn (Extension Contract)
--   2. commitment_pdf_url -> Bản cam kết gia hạn  (Extension Commitment)
-- The old 'pdf_url' column is kept for backward compatibility (old data, if any).
-- These 2 new columns replace the old single 'pdf_url' column in new records.

ALTER TABLE stay_extensions
    ADD COLUMN IF NOT EXISTS contract_pdf_url TEXT;

ALTER TABLE stay_extensions
    ADD COLUMN IF NOT EXISTS commitment_pdf_url TEXT;
