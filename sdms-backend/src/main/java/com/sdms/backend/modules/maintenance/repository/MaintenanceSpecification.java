package com.sdms.backend.modules.maintenance.repository;

import com.sdms.backend.modules.maintenance.entity.MaintenanceRequest;
import com.sdms.backend.modules.maintenance.enums.MaintenanceStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

public class MaintenanceSpecification {

    public static Specification<MaintenanceRequest> filterRequests(MaintenanceStatus status, String roomId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            if (StringUtils.hasText(roomId)) {
                predicates.add(criteriaBuilder.like(root.get("roomId"), "%" + roomId + "%"));
            }

            // Always order by createdAt desc if not already specified
            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
