package com.sdms.backend.modules.registration.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.registration.enums.RegistrationTarget;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Danh sách sinh viên đủ điều kiện đăng ký ký túc xá theo từng đợt (Group A/B check).
 */
@Entity
@Table(
    name = "registration_eligibilities",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uk_eligibility_period_cccd",
            columnNames = {"period_id", "cccd"}
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

    // Email có thể không có trong tệp trường cung cấp ban đầu
    @Column(name = "email", length = 100, nullable = true)
    private String email;

    // MSSV để trống đối với Tân sinh viên (Group A) khi import danh sách
    @Column(name = "student_code", length = 50, nullable = true)
    private String studentCode;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private RegistrationTarget target = RegistrationTarget.FRESHMAN;
}
