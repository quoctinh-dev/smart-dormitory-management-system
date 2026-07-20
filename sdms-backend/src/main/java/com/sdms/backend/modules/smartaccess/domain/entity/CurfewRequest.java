package com.sdms.backend.modules.smartaccess.domain.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestStatus;
import com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestType;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.user.entity.UserAccount;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "curfew_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CurfewRequest extends BaseEntity {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "request_id", updatable = false, nullable = false)
    private UUID requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "reason", columnDefinition = "TEXT", nullable = false)
    private String reason;

    @Column(name = "expected_arrival_time")
    private LocalDateTime expectedArrivalTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "request_type", length = 30, nullable = false)
    @Builder.Default
    private CurfewRequestType requestType = CurfewRequestType.LATE_RETURN;

    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private CurfewRequestStatus status = CurfewRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private UserAccount resolvedBy;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;
}
