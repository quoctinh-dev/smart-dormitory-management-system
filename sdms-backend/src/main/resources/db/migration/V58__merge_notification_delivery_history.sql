-- Add new columns to notifications table
ALTER TABLE notifications
ADD COLUMN recipient VARCHAR(255),
ADD COLUMN channel VARCHAR(50),
ADD COLUMN status VARCHAR(50),
ADD COLUMN error_message TEXT,
ADD COLUMN event_id VARCHAR(255);

-- Make user_id optional since some notifications (like external emails) might not have a user account
ALTER TABLE notifications
ALTER COLUMN user_id DROP NOT NULL;

-- Migrate data from notification_delivery_histories to notifications (if needed)
-- Note: Assuming the data is not critical to migrate, but we can do a simple INSERT to preserve history for Admin.
INSERT INTO notifications (title, message, notification_type, is_read, recipient, channel, status, error_message, event_id, created_at, created_by, updated_at, updated_by, is_deleted)
SELECT 
    'System Email' as title,
    COALESCE(payload_snapshot, 'No message content') as message,
    notification_type,
    false as is_read,
    recipient,
    channel,
    status,
    error_message,
    event_id,
    COALESCE(sent_at, CURRENT_TIMESTAMP) as created_at,
    'system' as created_by,
    COALESCE(sent_at, CURRENT_TIMESTAMP) as updated_at,
    'system' as updated_by,
    false as is_deleted
FROM notification_delivery_histories;

-- Drop the old table
DROP TABLE notification_delivery_histories;
