package com.sdms.backend.modules.smartaccess.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sdms.backend.modules.smartaccess.domain.entity.TimeWindowPolicy;
import com.sdms.backend.modules.smartaccess.domain.enums.ResidentType;

import java.util.List;
import java.util.UUID;

@Repository
public interface TimeWindowPolicyRepository extends JpaRepository<TimeWindowPolicy, UUID> {
    // Để truy xuất các chính sách cửa sổ thời gian đang hoạt động cho một tòa nhà cụ thể và loại cư dân cụ thể.
    List<TimeWindowPolicy> findByBuildingIdAndResidentTypeAndIsActiveTrue(UUID buildingId, ResidentType residentType);
}
