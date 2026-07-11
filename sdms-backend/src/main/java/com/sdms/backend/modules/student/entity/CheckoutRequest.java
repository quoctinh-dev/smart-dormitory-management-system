package com.sdms.backend.modules.student.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.student.enums.CheckoutStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "checkout_requests",
    indexes = {
        @Index(name = "idx_checkout_student", columnList = "student_id"),
        @Index(name = "idx_checkout_status", columnList = "status")
    }
)
@Getter
@Setter
public class CheckoutRequest extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID requestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_id", nullable = false)
    private StudentHousingAssignment assignment;

    @Column(nullable = false)
    private LocalDateTime intendedCheckoutDate;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(length = 50)
    private String bankAccountNumber;

    @Column(length = 100)
    private String bankName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CheckoutStatus status = CheckoutStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String rejectReason;
}
