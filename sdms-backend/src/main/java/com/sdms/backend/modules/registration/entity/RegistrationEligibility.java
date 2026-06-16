package com.sdms.backend.modules.registration.entity;

import com.sdms.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
        name = "registration_eligibilities",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_eligibility_period_cccd",
                        columnNames = {
                                "period_id",
                                "cccd"
                        }
                )
        }
)
@Getter
@Setter
public class RegistrationEligibility extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID eligibilityId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private RegistrationPeriod registrationPeriod;

    @Column(nullable = false, length = 20)
    private String cccd;

    @Column(length = 100)
    private String fullName;
}
