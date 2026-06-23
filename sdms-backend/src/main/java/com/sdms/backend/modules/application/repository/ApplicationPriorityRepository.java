package com.sdms.backend.modules.application.repository;

import com.sdms.backend.modules.application.entity.ApplicationPriority;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationPriorityRepository extends JpaRepository<ApplicationPriority, UUID> {
    List<ApplicationPriority> findByApplication_ApplicationId(UUID applicationId);
}
