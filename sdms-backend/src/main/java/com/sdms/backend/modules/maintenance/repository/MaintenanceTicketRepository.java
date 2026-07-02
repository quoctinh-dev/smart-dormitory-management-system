package com.sdms.backend.modules.maintenance.repository;

import com.sdms.backend.modules.maintenance.entity.MaintenanceTicket;
import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, UUID> {
    List<MaintenanceTicket> findByRoomIdAndStatus(UUID roomId, MaintenanceStatus status);
}
