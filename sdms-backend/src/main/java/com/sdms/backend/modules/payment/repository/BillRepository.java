package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    List<Bill> findByStatus(BillStatus status);

    List<Bill> findByBillType(BillType billType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bill b WHERE b.billId = :id")
    Optional<Bill> findByIdForUpdate(@Param("id") UUID id);

    Optional<Bill> findByAssignmentId(UUID assignmentId);

    List<Bill> findByApplicationId(UUID applicationId);

    List<Bill> findByApplicationIdAndStatusIn(UUID applicationId, Collection<BillStatus> statuses);

    List<Bill> findByStatusIn(List<BillStatus> statuses);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Bill b SET b.status = :newStatus WHERE b.status IN :oldStatuses AND b.dueDate < :currentDate")
    int updateOverdueBills(
            @Param("oldStatuses") List<BillStatus> oldStatuses,
            @Param("newStatus") BillStatus newStatus,
            @Param("currentDate") java.time.LocalDate currentDate);
    
    List<Bill> findByStudentIdAndBillTypeAndStatus(UUID studentId, BillType billType, BillStatus status);
}
