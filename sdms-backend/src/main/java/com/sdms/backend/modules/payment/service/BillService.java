package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.payment.dto.response.BillResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.BillType;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.room.repository.RoomRepository;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.system.service.SystemConfigService;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final SystemConfigService systemConfigService;
    private final DormitoryApplicationRepository dormitoryApplicationRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;

    /**
     * Tạo bill tiền ở KTX
     *
     * Flow:
     * Assignment approved
     *    ↓
     * Create accommodation bill
     *    ↓
     * Student payment
     *    ↓
     * Check-in
     */
    @Transactional
    public Bill createAccommodationBill(
            UUID assignmentId,
            UUID applicationId,
            UUID studentId,
            BigDecimal amount,
            int delayMonths
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Số tiền hóa đơn không hợp lệ");
        }

        int deadlineDays = Integer.parseInt(systemConfigService.getConfigValue("PAYMENT_DEADLINE_DAYS", "3"));

        Bill bill = new Bill();
        bill.setAssignmentId(assignmentId);
        bill.setApplicationId(applicationId);
        bill.setStudentId(studentId);
        bill.setBillType(BillType.ACCOMMODATION_FEE);
        bill.setAmount(amount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        // Stagger the due date based on the chunk sequence
        bill.setDueDate(LocalDate.now().plusMonths(delayMonths).plusDays(deadlineDays));
        bill.setDescription("Accommodation fee");
        return billRepository.save(bill);
    }

    /**
     * Lấy hóa đơn mới nhất theo applicationId.
     */
    @Transactional(readOnly = true)
    public BillResponse getBillByApplicationId(UUID applicationId) {
        List<Bill> bills = billRepository.findByApplicationId(applicationId);
        if (bills.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hóa đơn cho hồ sơ này");
        }
        return toBillResponse(bills.get(0));
    }

    /**
     * Lấy danh sách hóa đơn (không phân trang) của sinh viên đang đăng nhập.
     */
    @Transactional(readOnly = true)
    public List<BillResponse> getMyBills(UserAccount currentUser) {
        if (currentUser.getStudent() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Tài khoản chưa được liên kết sinh viên");
        }
        String cccd = currentUser.getStudent().getCccd();
        UUID studentId = currentUser.getStudent().getStudentId();

        List<UUID> applicationIds = dormitoryApplicationRepository.findByCccd(cccd)
                .stream()
                .map(DormitoryApplication::getApplicationId)
                .toList();

        List<Bill> bills = new ArrayList<>();
        for (UUID appId : applicationIds) {
            bills.addAll(billRepository.findByApplicationId(appId));
        }
        // Thêm hóa đơn điện nước theo studentId (tránh trùng lặp)
        billRepository.findByStudentId(studentId).forEach(b -> {
            if (applicationIds.isEmpty() || !applicationIds.contains(b.getApplicationId())) {
                bills.add(b);
            }
        });

        return bills.stream().map(this::toBillResponse).toList();
    }

    /**
     * Lấy danh sách tất cả hóa đơn phân trang (Admin/Staff view) kèm thông tin sinh viên.
     */
    @Transactional(readOnly = true)
    public PageResponse<Map<String, Object>> getAllBillsPaged(Pageable pageable) {
        Page<Bill> billPage = billRepository.findAll(pageable);
        List<Map<String, Object>> result = new ArrayList<>();

        for (Bill bill : billPage.getContent()) {
            Map<String, Object> map = new HashMap<>();
            map.put("billId", bill.getBillId());
            map.put("billCode", bill.getBillId().toString().substring(0, 8).toUpperCase());
            map.put("amount", bill.getAmount());
            map.put("billType", bill.getBillType());
            map.put("status", bill.getStatus());
            map.put("dueDate", bill.getDueDate());

            if (bill.getApplicationId() != null) {
                map.put("applicationId", bill.getApplicationId());
                dormitoryApplicationRepository.findById(bill.getApplicationId())
                        .ifPresent(app -> map.put("studentName", app.getFullName()));
            }

            if (!map.containsKey("studentName") && bill.getStudentId() != null) {
                studentRepository.findById(bill.getStudentId())
                        .ifPresent(student -> map.put("studentName", student.getFullName()));
            }

            if (!map.containsKey("studentName") && bill.getRoomId() != null) {
                roomRepository.findById(bill.getRoomId())
                        .ifPresent(room -> map.put("studentName", "Phòng trống " + room.getRoomCode()));
            }

            if (!map.containsKey("studentName")) {
                map.put("studentName", "Khách " + map.get("billCode"));
            }
            result.add(map);
        }
        return PageResponse.fromPage(billPage, result);
    }

    /**
     * Lấy danh sách hóa đơn phân trang của sinh viên đang đăng nhập.
     * Hợp nhất cả hóa đơn tiền ở KTX (applicationId) và hóa đơn điện nước (studentId).
     *
     * @param currentUser Tài khoản sinh viên đang đăng nhập
     * @param pageable    Thông tin phân trang
     * @return PageResponse chứa danh sách BillResponse
     */
    @Transactional(readOnly = true)
    public PageResponse<BillResponse> getMyBillsPaged(UserAccount currentUser, Pageable pageable) {
        if (currentUser.getStudent() == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Tài khoản chưa được liên kết sinh viên");
        }

        UUID studentId = currentUser.getStudent().getStudentId();
        String cccd = currentUser.getStudent().getCccd();

        // Lấy tất cả applicationId của sinh viên (dùng cho hóa đơn tiền ở KTX)
        List<UUID> applicationIds = dormitoryApplicationRepository.findByCccd(cccd)
                .stream()
                .map(DormitoryApplication::getApplicationId)
                .toList();

        // Nếu sinh viên chưa có application nào, chỉ tìm theo studentId
        Page<Bill> billPage;
        if (applicationIds.isEmpty()) {
            billPage = billRepository.findByStudentIdIn(List.of(studentId), pageable);
        } else {
            billPage = billRepository.findAllMyBills(applicationIds, studentId, pageable);
        }

        List<BillResponse> content = billPage.getContent().stream()
                .map(this::toBillResponse)
                .toList();

        return PageResponse.fromPage(billPage, content);
    }

    /**
     * Chuyển đổi Bill entity sang BillResponse DTO.
     */
    private BillResponse toBillResponse(Bill bill) {
        BigDecimal remaining = bill.getAmount().subtract(
                bill.getPaidAmount() != null ? bill.getPaidAmount() : BigDecimal.ZERO
        );
        return BillResponse.builder()
                .billId(bill.getBillId())
                .billType(bill.getBillType())
                .amount(bill.getAmount())
                .paidAmount(bill.getPaidAmount())
                .remainingAmount(remaining)
                .status(bill.getStatus())
                .dueDate(bill.getDueDate())
                .description(bill.getDescription())
                .assignmentId(bill.getAssignmentId())
                .build();
    }
}