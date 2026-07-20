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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    List<Bill> findByStatus(BillStatus status);

    long countByStatus(BillStatus status);

    @Query("SELECT SUM(b.amount) FROM Bill b WHERE b.status = :status")
    java.math.BigDecimal sumAmountByStatus(@Param("status") BillStatus status);

    List<Bill> findByBillType(BillType billType);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bill b WHERE b.billId = :id")
    Optional<Bill> findByIdForUpdate(@Param("id") UUID id);

    List<Bill> findByAssignmentId(UUID assignmentId);

    List<Bill> findByApplicationId(UUID applicationId);

    List<Bill> findByApplicationIdAndStatusIn(UUID applicationId, Collection<BillStatus> statuses);

    List<Bill> findByStatusIn(List<BillStatus> statuses);

    List<Bill> findByRoomIdAndBillType(UUID roomId, BillType billType);

    @org.springframework.data.jpa.repository.Modifying
    @Query("UPDATE Bill b SET b.status = :newStatus WHERE b.status IN :oldStatuses AND b.dueDate < :currentDate")
    int updateOverdueBills(
            @Param("oldStatuses") List<BillStatus> oldStatuses,
            @Param("newStatus") BillStatus newStatus,
            @Param("currentDate") java.time.LocalDate currentDate);
    
    List<Bill> findByStudentIdAndBillTypeAndStatus(UUID studentId, BillType billType, BillStatus status);

    List<Bill> findByStudentId(UUID studentId);

    boolean existsByStudentIdAndStatusIn(UUID studentId, List<BillStatus> statuses);

    List<Bill> findByStatusAndDueDateBefore(BillStatus status, java.time.LocalDate date);

    /**
     * Lấy hóa đơn phân trang theo danh sách application ID (dùng cho /me/paged - hóa đơn tiền ở KTX).
     */
    @Query("SELECT b FROM Bill b WHERE b.applicationId IN :applicationIds ORDER BY b.createdAt DESC")
    Page<Bill> findByApplicationIdIn(@Param("applicationIds") List<UUID> applicationIds, Pageable pageable);

    /**
     * Lấy hóa đơn phân trang theo studentId (dùng cho /me/paged - hóa đơn điện nước).
     */
    @Query("SELECT b FROM Bill b WHERE b.studentId IN :studentIds ORDER BY b.createdAt DESC")
    Page<Bill> findByStudentIdIn(@Param("studentIds") List<UUID> studentIds, Pageable pageable);

    /**
     * Lấy tất cả hóa đơn phân trang theo applicationId hoặc studentId.
     * Dùng để hợp nhất cả 2 loại hóa đơn (tiền ở + điện nước) cho một sinh viên.
     */
    @Query("SELECT b FROM Bill b WHERE b.applicationId IN :applicationIds OR b.studentId = :studentId ORDER BY b.createdAt DESC")
    Page<Bill> findAllMyBills(
            @Param("applicationIds") List<UUID> applicationIds,
            @Param("studentId") UUID studentId,
            Pageable pageable
    );

    @Query(value = "SELECT * FROM bills b WHERE CAST(b.bill_id AS VARCHAR) LIKE :prefix%", nativeQuery = true)
    List<Bill> findByBillIdPrefix(@Param("prefix") String prefix);
}
