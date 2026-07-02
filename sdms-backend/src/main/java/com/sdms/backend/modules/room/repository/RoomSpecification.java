package com.sdms.backend.modules.room.repository;

import com.sdms.backend.modules.room.entity.Room;
import com.sdms.backend.common.enums.Gender;
import com.sdms.backend.modules.room.enums.BuildingGender;
import com.sdms.backend.modules.room.enums.RoomStatus;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public class RoomSpecification {

    public static Specification<Room> filterRooms(UUID buildingId, UUID floorId, RoomStatus status, Gender policy) {
        return (root, query, criteriaBuilder) -> {

            // Ép JPA Join (Fetch) trước để tránh N+1 Query khi convert sang DTO
            if (Long.class != query.getResultType()) {
                root.fetch("floor", JoinType.LEFT).fetch("building", JoinType.LEFT);
            }

            Specification<Room> spec = Specification.where(null);

            if (floorId != null) {
                spec = spec.and((r, q, cb) -> cb.equal(r.get("floor").get("floorId"), floorId));
            } else if (buildingId != null) {
                spec = spec.and((r, q, cb) -> cb.equal(r.get("floor").get("building").get("buildingId"), buildingId));
            }

            if (status != null) {
                spec = spec.and((r, q, cb) -> cb.equal(r.get("status"), status));
            }

            if (policy != null) {
                spec = spec.and((r, q, cb) -> cb.and(
                        cb.or(
                                cb.equal(r.get("floor").get("building").get("gender"), cb.literal(BuildingGender.valueOf(policy.name()))),
                                cb.equal(r.get("floor").get("building").get("gender"), BuildingGender.MIXED)
                        ),
                        cb.equal(r.get("floor").get("gender"), policy)
                ));
            }

            return spec.toPredicate(root, query, criteriaBuilder);
        };
    }
}
