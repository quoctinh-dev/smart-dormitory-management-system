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
            name = "uk_eligibility_period_student_code",
            columnNames = {"period_id", "student_code"}
        ),
        @UniqueConstraint(
            name = "uk_eligibility_period_email",
            columnNames = {"period_id", "email"}
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

    // Trích xuất từ OCR nên Admin có thể không biết trước
    @Column(length = 20, nullable = true)
    private String cccd;

    @Column(length = 100)
    private String fullName;

    // Email trường cấp là định danh chính để sinh viên đăng nhập
    @Column(name = "email", length = 100, nullable = false)
    private String email;

    // MSSV là định danh cốt lõi
    @Column(name = "student_code", length = 50, nullable = false)
    private String studentCode;

    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private RegistrationTarget target = RegistrationTarget.FRESHMAN;
}
