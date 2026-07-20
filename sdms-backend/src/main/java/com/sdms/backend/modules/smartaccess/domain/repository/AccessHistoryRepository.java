package com.sdms.backend.modules.smartaccess.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.repository.Repository;
import com.sdms.backend.modules.smartaccess.domain.entity.AccessHistory;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@org.springframework.stereotype.Repository
public interface AccessHistoryRepository extends Repository<AccessHistory, UUID>, JpaSpecificationExecutor<AccessHistory> {

    AccessHistory save(AccessHistory entity);

    Page<AccessHistory> findByStudentId(UUID studentId, Pageable pageable);

    Page<AccessHistory> findByGateId(UUID gateId, Pageable pageable);
    
    Page<AccessHistory> findByBuildingId(UUID buildingId, Pageable pageable);

    Page<AccessHistory> findAll(Pageable pageable);

    @Query(value = """
        SELECT COUNT(DISTINCT sha.student_id)
        FROM student_housing_assignments sha
        JOIN access_history ah ON sha.student_id = ah.student_id
        JOIN gates g ON ah.gate_id = g.gate_id
        WHERE sha.status = 'OCCUPIED'
        AND g.gate_type IN ('MAIN_GATE', 'BUILDING_GATE')
        AND ah.id = (
            SELECT ah2.id
            FROM access_history ah2
            JOIN gates g2 ON ah2.gate_id = g2.gate_id
            WHERE ah2.student_id = sha.student_id
            AND g2.gate_type IN ('MAIN_GATE', 'BUILDING_GATE')
            ORDER BY ah2.event_timestamp DESC
            LIMIT 1
        )
        AND ah.direction = 'OUT'
        """, nativeQuery = true)
    long countOccupiedStudentsCurrentlyOutside();

    @Query(value = """
        SELECT CAST(sha.student_id AS VARCHAR) as student_id, 
               s.full_name as student_name, 
               s.student_code as student_code, 
               r.room_code as room_code, 
               b.name as building_name, 
               ah.event_timestamp as last_out_time
        FROM student_housing_assignments sha
        JOIN students s ON sha.student_id = s.student_id
        JOIN beds bd ON sha.bed_id = bd.bed_id
        JOIN rooms r ON bd.room_id = r.room_id
        JOIN floors f ON r.floor_id = f.floor_id
        JOIN buildings b ON f.building_id = b.building_id
        JOIN access_history ah ON sha.student_id = ah.student_id
        JOIN gates g ON ah.gate_id = g.gate_id
        WHERE sha.status = 'OCCUPIED'
        AND g.gate_type IN ('MAIN_GATE', 'BUILDING_GATE')
        AND ah.id = (
            SELECT ah2.id
            FROM access_history ah2
            JOIN gates g2 ON ah2.gate_id = g2.gate_id
            WHERE ah2.student_id = sha.student_id
            AND g2.gate_type IN ('MAIN_GATE', 'BUILDING_GATE')
            ORDER BY ah2.event_timestamp DESC
            LIMIT 1
        )
        AND ah.direction = 'OUT'
        ORDER BY ah.event_timestamp ASC
        """, nativeQuery = true)
    List<Object[]> findOccupiedStudentsCurrentlyOutside();

    @Query(value = """
        SELECT EXTRACT(HOUR FROM ah.event_timestamp) as hour, ah.direction, COUNT(*) as count
        FROM access_history ah
        JOIN gates g ON ah.gate_id = g.gate_id
        WHERE ah.event_timestamp >= :startDate AND ah.event_timestamp <= :endDate
        AND g.gate_type IN ('MAIN_GATE', 'BUILDING_GATE')
        GROUP BY EXTRACT(HOUR FROM ah.event_timestamp), ah.direction
        """, nativeQuery = true)
    List<Object[]> getHourlyTraffic(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query(value = """
        SELECT ah.direction FROM access_history ah
        JOIN gates g ON ah.gate_id = g.gate_id
        WHERE ah.student_id = :studentId 
        AND ah.direction IN ('IN', 'OUT')
        AND g.gate_type IN ('MAIN_GATE', 'BUILDING_GATE')
        ORDER BY ah.event_timestamp DESC LIMIT 1
        """, nativeQuery = true)
    String findLastDirectionForStudent(@Param("studentId") UUID studentId);
}
