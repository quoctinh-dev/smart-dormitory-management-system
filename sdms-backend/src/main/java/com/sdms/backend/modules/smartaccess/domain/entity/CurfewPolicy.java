package com.sdms.backend.modules.smartaccess.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import com.sdms.backend.modules.smartaccess.domain.enums.CurfewType;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;
import com.sdms.backend.common.entity.BaseEntity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "curfew_policies", indexes = {
        @Index(name = "idx_curfew_building_active", columnList = "building_id, is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurfewPolicy extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "building_id", nullable = false)
    private UUID buildingId;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "resident_type", nullable = false, columnDefinition = "resident_type_enum")
    private ResidentType residentType;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false, columnDefinition = "curfew_type_enum")
    private CurfewType type;

    @Column(name = "priority", nullable = false)
    private Integer priority;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;
}
