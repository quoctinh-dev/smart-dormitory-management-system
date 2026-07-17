package com.sdms.backend.modules.smartaccess.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.sdms.backend.modules.smartaccess.domain.entity.CurfewPolicy;

import java.util.List;
import java.util.UUID;

@Repository
public interface CurfewPolicyRepository extends JpaRepository<CurfewPolicy, UUID> {
    // Để truy xuất các chính sách giới nghiêm đang hoạt động cho một tòa nhà cụ thể.
    List<CurfewPolicy> findByBuildingIdAndIsActiveTrue(UUID buildingId);
}
