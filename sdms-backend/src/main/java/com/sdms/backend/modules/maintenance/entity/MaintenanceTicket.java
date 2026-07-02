package com.sdms.backend.modules.maintenance.entity;

import com.sdms.backend.common.entity.BaseEntity;
import com.sdms.backend.modules.maintenance.enums.MaintenanceSeverity;
import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "maintenance_tickets")
public class MaintenanceTicket extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "ticket_id")
    private UUID ticketId;

    @Column(name = "room_id", nullable = false)
    private UUID roomId;

    @Column(name = "bed_id")
    private UUID bedId;

    @Column(name = "reported_by_student_id")
    private UUID reportedByStudentId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MaintenanceStatus status = MaintenanceStatus.PENDING;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;
}
