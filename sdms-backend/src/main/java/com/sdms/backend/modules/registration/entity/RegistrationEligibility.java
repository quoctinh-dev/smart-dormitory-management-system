package com.sdms.backend.modules.registration.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.registration.enums.RegistrationTarget;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * Entity quản lý danh sách sinh viên đủ điều kiện đăng ký ký túc xá theo từng đợt.
 * Phục vụ cho việc kiểm tra phân nhóm đối tượng (Ví dụ: Group A/B check) trước khi cho phép đăng ký.
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

    /**
     * Khóa chính, định danh duy nhất của bản ghi điều kiện đăng ký.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID eligibilityId;

    /**
     * Đợt đăng ký áp dụng điều kiện này.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "period_id", nullable = false)
    private RegistrationPeriod registrationPeriod;

    /**
     * Số Căn cước công dân.
     */
    @Column(length = 20, nullable = true)
    private String cccd;

    /**
     * Họ và tên đầy đủ của sinh viên.
     */
    @Column(length = 100)
    private String fullName;

    /**
     * Email do nhà trường cấp.
     * Đây là định danh chính dùng để sinh viên đăng nhập vào hệ thống.
     */
    @Column(name = "email", length = 100, nullable = false)
    private String email;

    /**
     * Mã số sinh viên (MSSV).
     * Đây là định danh cốt lõi của sinh viên trong hệ thống quản lý.
     */
    @Column(name = "student_code", length = 50, nullable = false)
    private String studentCode;

    /**
     * Đối tượng đăng ký (Ví dụ: Sinh viên năm nhất, sinh viên năm 2,...).
     * Mặc định là {@link RegistrationTarget#FRESHMAN}.
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 50)
    private RegistrationTarget target = RegistrationTarget.FRESHMAN;
}