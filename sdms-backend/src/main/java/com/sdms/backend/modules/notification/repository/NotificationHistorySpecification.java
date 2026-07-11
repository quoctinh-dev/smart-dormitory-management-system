package com.sdms.backend.modules.notification.repository;

import com.sdms.backend.modules.notification.entity.NotificationDeliveryHistory;
import com.sdms.backend.modules.notification.enums.NotificationType;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class NotificationHistorySpecification {
    public static Specification<NotificationDeliveryHistory> filter(String keyword, NotificationType type, Boolean isBroadcast) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(keyword)) {
                String search = "%" + keyword.toLowerCase() + "%";
                Predicate recipientMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("recipient")), search);
                Predicate eventMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("eventId")), search);
                predicates.add(criteriaBuilder.or(recipientMatch, eventMatch));
            }

            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }

            if (isBroadcast != null) {
                if (isBroadcast) {
                    predicates.add(criteriaBuilder.like(root.get("eventId"), "broadcast-%"));
                } else {
                    predicates.add(criteriaBuilder.notLike(root.get("eventId"), "broadcast-%"));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
