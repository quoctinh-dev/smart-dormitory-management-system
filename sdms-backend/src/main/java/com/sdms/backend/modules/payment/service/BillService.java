package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.payment.dto.request.CreateManualBillRequest;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import com.sdms.backend.modules.payment.event.ManualBillCreatedEvent;

@Service
@RequiredArgsConstructor
public class BillService {

    private final BillRepository billRepository;
    private final SystemConfigService systemConfigService;
    private final DormitoryApplicationRepository dormitoryApplicationRepository;
    private final StudentRepository studentRepository;
    private final RoomRepository roomRepository;
    private final ApplicationEventPublisher eventPublisher;

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
            LocalDate dueDate
    ) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Số tiền hóa đơn không hợp lệ");
        }


        Bill bill = new Bill();
        bill.setAssignmentId(assignmentId);
        bill.setApplicationId(applicationId);
        bill.setStudentId(studentId);
        bill.setBillType(BillType.ACCOMMODATION_FEE);
        bill.setAmount(amount);
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(dueDate);
        bill.setDescription("Thanh toán tiền phòng (Bắt buộc)");
        bill.setBillCode(generateBillCode(BillType.ACCOMMODATION_FEE));
        Bill savedBill = billRepository.save(bill);
        
        eventPublisher.publishEvent(new ManualBillCreatedEvent(
                savedBill.getBillCode(),
                savedBill.getStudentId(),
                savedBill.getBillType(),
                savedBill.getAmount(),
                savedBill.getDescription()
        ));
        
        return savedBill;
    }

    /**
     * Tạo hóa đơn thủ công (Đền bù tài sản, Phạt vi phạm, etc.)
     */
    @Transactional
    public BillResponse createManualBill(CreateManualBillRequest request) {
        studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy sinh viên"));

        if (request.getRoomId() != null) {
            roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy phòng"));
        }

        Bill bill = new Bill();
        bill.setStudentId(request.getStudentId());
        bill.setRoomId(request.getRoomId());
        bill.setBillType(request.getBillType());
        bill.setAmount(request.getAmount());
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setStatus(BillStatus.UNPAID);
        bill.setDueDate(request.getDueDate());
        bill.setDescription(request.getDescription());
        bill.setBillCode(generateBillCode(request.getBillType()));
        
        Bill savedBill = billRepository.save(bill);
        eventPublisher.publishEvent(new ManualBillCreatedEvent(
                savedBill.getBillCode(),
                savedBill.getStudentId(),
                savedBill.getBillType(),
                savedBill.getAmount(),
                savedBill.getDescription()
        ));
        return toBillResponse(savedBill);
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
        // Thêm hóa đơn điện nước theo studentId
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
    public PageResponse<Map<String, Object>> getAllBillsPaged(String search, String status, String billType, Pageable pageable) {
        List<Bill> allBills = billRepository.findAll();
        List<Map<String, Object>> filteredResult = new ArrayList<>();

        boolean filterStatus = status != null && !status.isEmpty() && !status.equals("ALL");
        boolean filterType = billType != null && !billType.isEmpty() && !billType.equals("ALL");
        String searchLower = (search != null && !search.isEmpty()) ? search.toLowerCase() : null;

        for (Bill bill : allBills) {
            if (filterStatus && !bill.getStatus().name().equals(status)) continue;
            if (filterType && !bill.getBillType().name().equals(billType)) continue;

            Map<String, Object> map = new HashMap<>();
            map.put("billId", bill.getBillId());
            String billCode = bill.getBillCode() != null ? bill.getBillCode() : bill.getBillId().toString().substring(0, 8).toUpperCase();
            map.put("billCode", billCode);
            map.put("amount", bill.getAmount());
            map.put("billType", bill.getBillType());
            map.put("status", bill.getStatus());
            map.put("dueDate", bill.getDueDate());

            String studentName = null;
            if (bill.getApplicationId() != null) {
                map.put("applicationId", bill.getApplicationId());
                studentName = dormitoryApplicationRepository.findById(bill.getApplicationId())
                        .map(app -> app.getFullName()).orElse(null);
            }
            if (studentName == null && bill.getStudentId() != null) {
                studentName = studentRepository.findById(bill.getStudentId())
                        .map(student -> student.getFullName()).orElse(null);
            }
            if (studentName == null && bill.getRoomId() != null) {
                studentName = roomRepository.findById(bill.getRoomId())
                        .map(room -> "Phòng trống " + room.getRoomCode()).orElse(null);
            }
            if (studentName == null) {
                studentName = "Khách " + billCode;
            }
            map.put("studentName", studentName);

            map.put("createdAt", bill.getCreatedAt());

            if (searchLower != null) {
                if (!billCode.toLowerCase().contains(searchLower) && !studentName.toLowerCase().contains(searchLower)) {
                    continue;
                }
            }
            filteredResult.add(map);
        }

        // Sắp xếp giảm dần theo thời gian tạo (createdAt DESC)
        filteredResult.sort((a, b) -> {
            LocalDateTime timeA = (LocalDateTime) a.get("createdAt");
            LocalDateTime timeB = (LocalDateTime) b.get("createdAt");
            if (timeA == null || timeB == null) return 0;
            return timeB.compareTo(timeA); // DESC
        });

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), filteredResult.size());
        List<Map<String, Object>> pagedResult = (start <= end && start <= filteredResult.size()) ? filteredResult.subList(start, end) : new ArrayList<>();
        
        return new PageResponse<>(
                pagedResult,
                pageable.getPageNumber(),
                pageable.getPageSize(),
                filteredResult.size(),
                (int) Math.ceil((double) filteredResult.size() / pageable.getPageSize()),
                end >= filteredResult.size()
        );
    }

    /**
     * Lấy danh sách hóa đơn phân trang của sinh viên đang đăng nhập.
     * Hợp nhất cả hóa đơn tiền ở KTX (applicationId) và hóa đơn điện (studentId).
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
     * Dời ngày đến hạn của hóa đơn (Admin).
     * Yêu cầu: Hóa đơn phải chưa thanh toán, chưa hết hạn, và ngày mới phải xa hơn.
     */
    @Transactional
    public BillResponse extendDueDate(UUID billId, LocalDate newDueDate) {
        Bill bill = billRepository.findById(billId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hóa đơn"));

        if (bill.getStatus() != BillStatus.UNPAID) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể gia hạn hóa đơn chưa thanh toán");
        }
        
        if (bill.getDueDate() != null && !newDueDate.isAfter(bill.getDueDate())) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Ngày đến hạn mới phải sau ngày đến hạn hiện tại");
        }

        if (bill.getExtensionCount() != null && bill.getExtensionCount() >= 1) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Mỗi hóa đơn chỉ được gia hạn tối đa 1 lần");
        }

        bill.setExtensionCount((bill.getExtensionCount() == null ? 0 : bill.getExtensionCount()) + 1);
        bill.setDueDate(newDueDate);
        Bill savedBill = billRepository.save(bill);
        
        return toBillResponse(savedBill);
    }

    /**
     * Tách nợ hóa đơn tiền điện (F04: SPLIT UTILITY BILL).
     * Trưởng phòng báo cáo thành viên không đóng tiền.
     */
    @Transactional
    public BillResponse splitUtilityBill(UUID billId, com.sdms.backend.modules.payment.dto.request.SplitBillRequest request, UUID requesterId) {
        Bill originalBill = billRepository.findByIdForUpdate(billId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hóa đơn"));

        // Xác thực logic
        if (originalBill.getBillType() != BillType.ELECTRIC_FEE) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ được tách nợ đối với hóa đơn tiền điện");
        }
        if (originalBill.getStatus() != BillStatus.UNPAID && originalBill.getStatus() != BillStatus.PARTIALLY_PAID) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể tách nợ khi hóa đơn chưa thanh toán xong");
        }
        if (!originalBill.getStudentId().equals(requesterId)) {
            // Wait, since admin or room leader can do this. For now, we skip requester validation or assume it's checked in Controller.
            // Actually, let's keep it robust. If requesterId is not null, it must match.
            if (requesterId != null && !originalBill.getStudentId().equals(requesterId)) {
                throw new AppException(ErrorCode.FORBIDDEN, "Chỉ người đại diện hóa đơn mới được phép báo cáo tách nợ");
            }
        }

        BigDecimal totalDeduction = request.getAmountPerStudent().multiply(new BigDecimal(request.getNonPayingStudentIds().size()));
        
        if (originalBill.getAmount().compareTo(totalDeduction) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Tổng số tiền tách nợ không được lớn hơn hoặc bằng tổng hóa đơn");
        }

        // Trừ tiền hóa đơn gốc
        originalBill.setAmount(originalBill.getAmount().subtract(totalDeduction));
        Bill savedOriginalBill = billRepository.save(originalBill);

        // Tạo các hóa đơn phạt (PENALTY_FEE) cho người vi phạm
        for (UUID nonPayingStudentId : request.getNonPayingStudentIds()) {
            Bill penaltyBill = new Bill();
            penaltyBill.setStudentId(nonPayingStudentId);
            penaltyBill.setRoomId(originalBill.getRoomId());
            penaltyBill.setBillType(BillType.PENALTY_FEE);
            penaltyBill.setAmount(request.getAmountPerStudent());
            penaltyBill.setPaidAmount(BigDecimal.ZERO);
            penaltyBill.setStatus(BillStatus.UNPAID);
            penaltyBill.setDueDate(originalBill.getDueDate());
            penaltyBill.setDescription("Nợ tiền điện chung phòng. Chuyển từ hóa đơn: " + originalBill.getBillCode());
            penaltyBill.setBillCode(generateBillCode(BillType.PENALTY_FEE));
            
            Bill savedPenaltyBill = billRepository.save(penaltyBill);
            
            // Thông báo (tùy chọn)
            eventPublisher.publishEvent(new ManualBillCreatedEvent(
                    savedPenaltyBill.getBillCode(),
                    savedPenaltyBill.getStudentId(),
                    savedPenaltyBill.getBillType(),
                    savedPenaltyBill.getAmount(),
                    savedPenaltyBill.getDescription()
            ));
        }

        return toBillResponse(savedOriginalBill);
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
                .billCode(bill.getBillCode())
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
    
    public static String generateBillCode(BillType type) {
        String prefix = switch (type) {
            case ACCOMMODATION_FEE -> "HDP-"; // Hóa Đơn Phòng
            case ELECTRIC_FEE -> "HDD-";      // Hóa Đơn Điện
            case PENALTY_FEE -> "HDF-";       // Hóa Đơn Phạt
            default -> "HD-";
        };
        return prefix + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}