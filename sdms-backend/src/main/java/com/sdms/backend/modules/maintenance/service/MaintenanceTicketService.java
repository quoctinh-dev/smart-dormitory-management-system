package com.sdms.backend.modules.maintenance.service;

import com.sdms.backend.modules.maintenance.entity.MaintenanceTicket;
import com.sdms.backend.modules.maintenance.enums.MaintenanceSeverity;
import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import com.sdms.backend.modules.maintenance.event.RoomMaintenanceCompletedEvent;
import com.sdms.backend.modules.maintenance.event.RoomMaintenanceRequiredEvent;
import com.sdms.backend.modules.maintenance.repository.MaintenanceTicketRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceTicketService {

    private final MaintenanceTicketRepository ticketRepository;
    private final ApplicationEventPublisher eventPublisher;

    public MaintenanceTicket createTicket(UUID roomId, UUID bedId, UUID studentId, MaintenanceSeverity severity, String description) {
        MaintenanceTicket ticket = new MaintenanceTicket();
        ticket.setRoomId(roomId);
        ticket.setBedId(bedId);
        ticket.setReportedByStudentId(studentId);
        ticket.setSeverity(severity);
        ticket.setDescription(description);
        ticket.setStatus(MaintenanceStatus.PENDING);

        ticket = ticketRepository.save(ticket);
        log.info("Created Maintenance Ticket ID: {}", ticket.getTicketId());

        if (severity == MaintenanceSeverity.CRITICAL || severity == MaintenanceSeverity.HIGH) {
            eventPublisher.publishEvent(new RoomMaintenanceRequiredEvent(
                    this,
                    ticket.getTicketId(),
                    roomId,
                    bedId,
                    severity.name(),
                    description
            ));
            log.info("Published RoomMaintenanceRequiredEvent for Ticket ID: {}", ticket.getTicketId());
        }

        return ticket;
    }

    public void resolveTicket(UUID ticketId) {
        MaintenanceTicket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));

        ticket.setStatus(MaintenanceStatus.RESOLVED);
        ticketRepository.save(ticket);
        log.info("Resolved Maintenance Ticket ID: {}", ticket.getTicketId());

        if (ticket.getSeverity() == MaintenanceSeverity.CRITICAL || ticket.getSeverity() == MaintenanceSeverity.HIGH) {
            eventPublisher.publishEvent(new RoomMaintenanceCompletedEvent(
                    this,
                    ticket.getTicketId(),
                    ticket.getRoomId(),
                    ticket.getBedId()
            ));
            log.info("Published RoomMaintenanceCompletedEvent for Ticket ID: {}", ticket.getTicketId());
        }
    }
}
