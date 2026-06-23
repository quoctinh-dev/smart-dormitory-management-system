package com.sdms.backend.modules.smartaccess.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import com.sdms.backend.modules.smartaccess.domain.enums.AccessDecision;
import com.sdms.backend.modules.smartaccess.domain.enums.VerificationMethod;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "access_history", indexes = {
        @Index(name = "idx_access_history_student", columnList = "student_id"),
        @Index(name = "idx_access_history_building", columnList = "building_id"),
        @Index(name = "idx_access_history_decision", columnList = "decision")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class AccessHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "gate_id", nullable = false)
    private UUID gateId;

    @Column(name = "building_id", nullable = false)
    private UUID buildingId;

    @Column(name = "operator_id")
    private UUID operatorId;

    @Column(name = "event_timestamp", nullable = false)
    private LocalDateTime eventTimestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false, columnDefinition = "access_decision_enum")
    private AccessDecision decision;

    @Column(name = "denial_reason")
    private String denialReason;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", nullable = false, columnDefinition = "verification_method_enum")
    private VerificationMethod method;

    // Explicitly avoids extending BaseEntity. Immutable.
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
