-- Add sent_at column to notifications table
ALTER TABLE notifications
ADD COLUMN sent_at TIMESTAMP;

-- Populate sent_at with created_at for existing records
UPDATE notifications
SET sent_at = created_at
WHERE sent_at IS NULL;
