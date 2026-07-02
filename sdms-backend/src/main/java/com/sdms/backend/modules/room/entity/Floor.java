package com.sdms.backend.modules.room.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.common.enums.Gender;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * DOMAIN ROLE:
 * Đại diện cho một tầng trong tòa nhà.
 *
 * BUSINESS PURPOSE:
 * Quản lý chính sách cư trú theo giới tính.
 *
 * RELATIONSHIP:
 * Building
 * ↓
 * Floor
 * ↓
 * Room
 */
@Getter
@Setter
@Entity
@Table(
        name = "floors",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_building_floor",
                        columnNames = {"building_id", "floor_number"}
                )
        }
)
public class Floor extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID floorId;

    @Column(name = "floor_number", nullable = false)
    private Integer floorNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;
}