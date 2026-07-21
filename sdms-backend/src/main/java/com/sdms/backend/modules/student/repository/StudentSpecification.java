package com.sdms.backend.modules.student.repository;

import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.StudentStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class StudentSpecification {
    public static Specification<Student> getFilter(String search, StudentStatus status) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.trim().isEmpty()) {
                String searchLike = "%" + search.trim().toLowerCase() + "%";
                Predicate fullNameMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), searchLike);
                Predicate studentCodeMatch = criteriaBuilder.like(criteriaBuilder.lower(root.get("studentCode")), searchLike);
                predicates.add(criteriaBuilder.or(fullNameMatch, studentCodeMatch));
            }

            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
