package com.sdms.backend.modules.payment.entity;

import com.sdms.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

@Entity
@Table(name = "utility_usages")
@Getter
@Setter
public class UtilityUsage extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    @Column(name = "room_id", nullable = false)
    private UUID roomId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "utility_type", nullable = false)
    private UtilityType utilityType;
    
    private Integer month;
    private Integer year;
    
    @Column(name = "old_reading")
    private Integer oldReading;
    
    @Column(name = "new_reading")
    private Integer newReading;
    
    @Column(name = "total_usage")
    private Integer totalUsage;
    
    @Column(name = "is_settled")
    private Boolean isSettled = false;
    
    @Version
    private Integer version;
}
