CREATE TABLE electricity_usages (
    id UUID PRIMARY KEY,
    room_id UUID NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL,
    old_reading INTEGER NOT NULL,
    new_reading INTEGER NOT NULL,
    total_kwh INTEGER NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    version INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_electricity_room FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);
