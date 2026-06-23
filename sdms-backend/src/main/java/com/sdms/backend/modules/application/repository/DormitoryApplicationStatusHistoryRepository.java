package com.sdms.backend.modules.application.repository;

import com.sdms.backend.modules.application.entity.DormitoryApplicationStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface DormitoryApplicationStatusHistoryRepository extends JpaRepository<DormitoryApplicationStatusHistory, UUID> {
    List<DormitoryApplicationStatusHistory> findByApplication_ApplicationIdOrderByChangedAtAsc(UUID applicationId);
}
