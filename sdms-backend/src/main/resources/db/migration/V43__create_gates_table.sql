-- create gates table for smart access IoT integration
CREATE TABLE gates (
    gate_id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    gate_type VARCHAR(20) NOT NULL,
    building_id UUID,
    room_id UUID,
    mac_address VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    
    -- BaseEntity fields
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(50),
    updated_at TIMESTAMP,
    updated_by VARCHAR(50),
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

    -- Constraints
    CONSTRAINT fk_gates_building FOREIGN KEY (building_id) REFERENCES buildings(building_id),
    CONSTRAINT fk_gates_room FOREIGN KEY (room_id) REFERENCES rooms(room_id)
);

-- Index for fast lookup by building or room
CREATE INDEX idx_gates_building_id ON gates(building_id);
CREATE INDEX idx_gates_room_id ON gates(room_id);
