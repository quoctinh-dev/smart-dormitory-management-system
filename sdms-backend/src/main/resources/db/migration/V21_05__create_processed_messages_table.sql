-- V21_05__create_processed_messages_table.sql
-- Application Event Idempotency Store (NOT MQTT Retry Store)

CREATE TABLE processed_messages (
    message_id VARCHAR(128) PRIMARY KEY,
    processed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW(),
    source VARCHAR(100) NOT NULL
);

-- Fast lookup for exact match idempotency guard
CREATE INDEX idx_processed_messages_id_hash ON processed_messages USING HASH (message_id);
