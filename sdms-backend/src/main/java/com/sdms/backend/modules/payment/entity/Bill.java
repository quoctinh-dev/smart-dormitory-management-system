package com.sdms.backend.modules.payment.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(
    name = "bills",
    indexes = {
        @Index(name = "idx_bill_student", columnList = "student_id"),
        @Index(name = "idx_bill_status", columnList = "status"),
        @Index(name = "idx_bill_application", columnList = "application_id")
    }
)
public class Bill extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "bill_id")
    private UUID billId;

    @Enumerated(EnumType.STRING)
    @Column(name = "bill_type", nullable = false)
    private BillType billType;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "paid_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BillStatus status = BillStatus.UNPAID;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "assignment_id")
    private UUID assignmentId;

    @Column(name = "application_id")
    private UUID applicationId;

    @Column(name = "room_id")
    private UUID roomId;

    @Column(name = "student_id")
    private UUID studentId;

    @Version
    private Long version;
}
