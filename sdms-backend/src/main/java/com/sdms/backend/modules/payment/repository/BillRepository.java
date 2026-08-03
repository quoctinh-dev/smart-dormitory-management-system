package com.sdms.backend.modules.payment.repository;

import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    // --- TRUY VẤN THEO TRẠNG THÁI & THỐNG KÊ ---
    long countByStatus(BillStatus status);

    @Query("SELECT SUM(b.paidAmount) FROM Bill b")
    BigDecimal sumTotalPaidAmount();

    List<Bill> findByStatusAndDueDateBefore(BillStatus status, LocalDate date);

    List<Bill> findByStatusAndDueDate(BillStatus status, LocalDate date);

    // --- KHÓA BẢN GHI (PESSIMISTIC LOCKING) ---
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM Bill b WHERE b.billId = :id")
    Optional<Bill> findByIdForUpdate(@Param("id") UUID id);

    // --- TRUY VẤN THEO NGHIỆP VỤ ---
    List<Bill> findByAssignmentId(UUID assignmentId);

    List<Bill> findByApplicationId(UUID applicationId);

    List<Bill> findByApplicationIdAndStatusIn(UUID applicationId, Collection<BillStatus> statuses);

    List<Bill> findByRoomIdAndBillType(UUID roomId, BillType billType);

    List<Bill> findByStudentId(UUID studentId);

    boolean existsByStudentIdAndStatusIn(UUID studentId, List<BillStatus> statuses);

    // --- CẬP NHẬT TRẠNG THÁI HÓA ĐƠN QUÁ HẠN ---
    @Modifying
    @Query("UPDATE Bill b SET b.status = :newStatus WHERE b.status IN :oldStatuses AND b.dueDate < :currentDate")
    int updateOverdueBills(
            @Param("oldStatuses") List<BillStatus> oldStatuses,
            @Param("newStatus") BillStatus newStatus,
            @Param("currentDate") LocalDate currentDate
    );

    // --- PHÂN TRANG CHO TÀI KHOẢN CÁ NHÂN (ME) ---
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

    // --- TÌM KIẾM THEO TIỀN TỐ ID ---
    @Query(value = "SELECT * FROM bills b WHERE CAST(b.bill_id AS VARCHAR) LIKE :prefix%", nativeQuery = true)
    List<Bill> findByBillIdPrefix(@Param("prefix") String prefix);
}