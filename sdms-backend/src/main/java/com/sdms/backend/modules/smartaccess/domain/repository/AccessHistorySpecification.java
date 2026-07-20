package com.sdms.backend.modules.smartaccess.domain.repository;

import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class AccessHistorySpecification {

    public static Specification<AccessHistory> filter(
            UUID studentId, 
            UUID gateId, 
            String decision, 
            LocalDateTime startDate, 
            LocalDateTime endDate) {
            
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (studentId != null) {
                predicates.add(criteriaBuilder.equal(root.get("studentId"), studentId));
            }
            if (gateId != null) {
                predicates.add(criteriaBuilder.equal(root.get("gateId"), gateId));
            }
            if (decision != null && !decision.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("decision").as(String.class), decision));
            }
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("eventTimestamp"), startDate));
            }
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("eventTimestamp"), endDate));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
