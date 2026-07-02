package com.sdms.backend.modules.room.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.room.enums.BuildingGender;
import com.sdms.backend.modules.room.enums.BuildingStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

/**
 * DOMAIN ROLE:
 * Đại diện cho một tòa nhà trong KTX.
 *
 * BUSINESS PURPOSE:
 * Tổ chức các tầng, phòng và giường.
 *
 * RELATIONSHIP:
 * Building
 * ↓
 * Floor
 * ↓
 * Room
 * ↓
 * Bed
 */
@Getter
@Setter
@Entity
@Table(name = "buildings")
public class Building extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID buildingId;

    /**
     * Mã tòa nhà (VD: A, B, C...)
     */
    @Column(
            nullable = false,
            unique = true,
            length = 20
    )
    private String code;

    /**
     * Tên tòa nhà (VD: KTX A)
     */
    @Column(
            nullable = false,
            length = 100
    )
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BuildingStatus status = BuildingStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(
            nullable = false,
            length = 20
    )
    private BuildingGender gender = BuildingGender.MIXED;
}