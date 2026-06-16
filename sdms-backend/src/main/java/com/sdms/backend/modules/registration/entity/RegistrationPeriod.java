package com.sdms.backend.modules.registration.entity;

import com.sdms.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DOMAIN ROLE
 *
 * Quản lý các kỳ đăng ký KTX.
 *
 * LIFECYCLE
 *
 * CREATED
 *      ↓
 * ACTIVE
 *      ↓
 * CLOSED
 *
 * ARCHITECTURAL NOTE
 *
 * Là Aggregate Root của Registration Module.
 *
 * Mỗi DormitoryApplication bắt buộc
 * phải thuộc về một RegistrationPeriod.
 */

@Entity
@Table(name = "registration_periods")
@Getter
@Setter
public class RegistrationPeriod extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID periodId;

    @Column(nullable = false, length = 100)
    private String periodName;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime endDate;

    @Column(nullable = false)
    private Boolean isActive = true;
}