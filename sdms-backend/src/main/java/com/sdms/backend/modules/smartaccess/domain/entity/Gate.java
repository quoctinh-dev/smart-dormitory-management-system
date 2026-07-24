package com.sdms.backend.modules.smartaccess.domain.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.room.entity.Building;
import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "gates")
public class Gate extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID gateId;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "gate_type", nullable = false, length = 20)
    private GateType gateType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id")
    private Room room;

    @Column(name = "mac_address", length = 30)
    private String macAddress;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;
}
