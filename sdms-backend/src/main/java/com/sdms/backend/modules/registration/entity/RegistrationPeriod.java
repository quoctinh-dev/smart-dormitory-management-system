package com.sdms.backend.modules.registration.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.registration.enums.RegistrationType;
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
 * ARCHITECTURAL NOTE:
 * Là Aggregate Root của Registration Module.
 * Mỗi DormitoryApplication bắt buộc phải thuộc về một RegistrationPeriod.
 * 
 * [BUSINESS RULE: PERIOD-BASED CONTRACT]
 * - Ban quản lý KTX (Admin) có thể tùy biến (Customizable) không giới hạn số đợt đăng ký.
 * - Mỗi đợt (Period) sẽ phục vụ một nhóm đối tượng riêng (Tân sinh viên, SV cũ, hoặc Đợt tự do)
 *   thông qua trường `registrationType`.
 * - Điểm cốt lõi: Thời gian hợp đồng lưu trú (stayStartDate, stayEndDate) được gắn cứng
 *   với từng Đợt đăng ký, chứ không gộp chung. 
 * - VD: Đợt Tân sinh viên ở từ 05/09 đến 30/06. Đợt SV cũ ở từ 15/08 đến 30/06.
 *   Việc này giải quyết triệt để bài toán "Mỗi đối tượng có một mốc thời gian ở khác nhau",
 *   tránh sai sót khi xuất file PDF Bản Cam Kết / Hợp Đồng cho từng nhóm.
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
    private LocalDateTime stayStartDate;

    @Column(nullable = false)
    private LocalDateTime stayEndDate;

    @Column(nullable = false)
    private Boolean isActive = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private RegistrationType registrationType;
}