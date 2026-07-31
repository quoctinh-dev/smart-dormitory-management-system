package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.response.PaymentResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.PaymentMethod;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.repository.PaymentRepository;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;
    private final StudentHousingAssignmentRepository assignmentRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${payment.sepay.bank-account}")
    private String sepayBankAccount;

    @Value("${payment.sepay.bank-code}")
    private String sepayBankCode;

    // ==================== THANH TOÁN TRỰC TUYẾN (SINH VIÊN) ====================

    /**
     * Khởi tạo giao dịch thanh toán trực tuyến và sinh URL VietQR qua SePay.
     */
    @Transactional
    public PaymentResponse processOnlinePayment(UUID billId,
                                                BigDecimal amount,
                                                PaymentMethod method,
                                                String transactionCode) {
        if (method == PaymentMethod.CASH) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không hỗ trợ thanh toán tiền mặt tại đây");
        }

        // 1. Xác thực hóa đơn và số tiền
        Bill bill = validateBillAndAmount(billId, amount);

        // 2. Tạo mã giao dịch cố định để khớp với SePay: "SDMS" + 8 ký tự đầu của Bill ID
        String txnCode = "SDMS" + bill.getBillId().toString().substring(0, 8).toUpperCase();

        // 3. Tìm giao dịch PENDING hiện có hoặc tạo mới để tránh tạo trùng
        Payment payment = paymentRepository.findByBill_BillIdAndStatus(bill.getBillId(), PaymentStatus.PENDING)
                .orElseGet(() -> createPaymentRecord(bill, amount, method, txnCode, PaymentStatus.PENDING));

        // 4. Tạo mã VietQR qua SePay dựa trên cấu hình hệ thống
        String sepayCheckoutUrl = String.format(
                "https://qr.sepay.vn/img?acc=%s&bank=%s&amount=%s&des=%s",
                sepayBankAccount, sepayBankCode, amount.toPlainString(), txnCode
        );

        // 5. Trả về thông tin cho Frontend hiển thị QR Code
        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentStatus(payment.getStatus())
                .paymentMethod(payment.getMethod())
                .transactionCode(payment.getTransactionCode())
                .amount(payment.getAmount())
                .billId(bill.getBillId())
                .paymentUrl(sepayCheckoutUrl)
                .build();
    }

    /**
     * Hoàn tất giao dịch thanh toán trực tuyến (thường được gọi khi Webhook nhận thông báo thành công).
     */
    @Transactional
    public void completeOnlinePayment(UUID paymentId, BigDecimal finalAmount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy giao dịch thanh toán"));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Giao dịch không ở trạng thái ĐANG XỬ LÝ");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);

        Bill bill = payment.getBill();
        updateBillAfterPayment(bill, payment.getAmount());

        if (bill.getStatus() == BillStatus.PAID) {
            publishPaymentSuccessEvent(bill);
        }
    }

    // ==================== THANH TOÁN TIỀN MẶT (ADMIN / STAFF) ====================

    /**
     * Admin xác nhận thu tiền mặt trực tiếp tại quầy theo billId.
     */
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public PaymentResponse approveCashPayment(UUID billId, BigDecimal amount) {
        String transactionCode = generateCashTransactionCode();
        return executePayment(billId, amount, PaymentMethod.CASH, transactionCode, PaymentStatus.SUCCESS);
    }

    /**
     * Admin/Staff xác nhận thu tiền mặt trực tiếp theo applicationId (cho hóa đơn tiền KTX).
     */
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    @Transactional
    public PaymentResponse confirmCashPaymentByApplication(UUID applicationId) {
        log.info("[PaymentService] Admin/Staff xác nhận thu tiền mặt cho applicationId={}", applicationId);

        List<Bill> bills = billRepository.findByApplicationIdAndStatusIn(
                applicationId, List.of(BillStatus.UNPAID, BillStatus.PARTIALLY_PAID));
        if (bills.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hóa đơn chưa thanh toán cho đơn đăng ký này");
        }

        Bill bill = bills.get(0);
        BigDecimal remainingAmount = bill.getAmount().subtract(bill.getPaidAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hóa đơn đã được thanh toán toàn bộ");
        }

        String transactionCode = generateCashTransactionCode();
        return executePayment(bill.getBillId(), remainingAmount, PaymentMethod.CASH, transactionCode, PaymentStatus.SUCCESS);
    }

    /**
     * Hàm dùng chung xử lý và thực thi ghi nhận thanh toán.
     */
    public PaymentResponse executePayment(UUID billId,
                                          BigDecimal amount,
                                          PaymentMethod method,
                                          String transactionCode,
                                          PaymentStatus paymentStatus) {
        Bill bill = validateBillAndAmount(billId, amount);
        Payment payment = createPaymentRecord(bill, amount, method, transactionCode, paymentStatus);

        if (paymentStatus == PaymentStatus.SUCCESS) {
            updateBillAfterPayment(bill, amount);

            if (bill.getStatus() == BillStatus.PAID) {
                publishPaymentSuccessEvent(bill);
            }
        }

        log.info("Payment processed: billId={}, amount={}, method={}, transactionCode={}, paymentStatus={}, billStatus={}",
                bill.getBillId(), amount, method, payment.getTransactionCode(), payment.getStatus(),
                paymentStatus == PaymentStatus.SUCCESS ? bill.getStatus() : null);

        return buildPaymentResponse(bill, payment);
    }

    // ==================== QUẢN LÝ VÒNG ĐỜI GIAO DỊCH (JOB & SCHEDULER) ====================

    /**
     * Đánh dấu giao dịch PENDING là thất bại khi hết hạn hoặc có lỗi.
     */
    @Transactional
    public void markPaymentFailed(UUID paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy giao dịch thanh toán"));

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể đánh dấu THẤT BẠI cho các giao dịch đang XỬ LÝ");
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setDescription(reason);
        paymentRepository.save(payment);
        log.info("[PaymentService] Payment={} marked as FAILED. Reason: {}", paymentId, reason);
    }

    /**
     * Tự động quét và đánh dấu EXPIRED các giao dịch PENDING quá 24h (dùng cho Cron Job).
     */
    @Transactional
    public void expirePendingPayments() {
        LocalDateTime expiryTime = LocalDateTime.now().minusHours(24);
        int expiredCount = paymentRepository.updateStatusForOldPendingPayments(PaymentStatus.PENDING, PaymentStatus.EXPIRED, expiryTime);
        if (expiredCount > 0) {
            log.info("[PaymentService] Expired {} pending payments older than 24 hours.", expiredCount);
        }
    }

    // ==================== HÀM BỔ TRỢ / PRIVATE HELPER METHODS ====================

    private Bill validateBillAndAmount(UUID billId, BigDecimal amount) {
        Bill bill = billRepository.findByIdForUpdate(billId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy hóa đơn"));

        if (bill.getAssignmentId() != null) {
            assignmentRepository.findById(bill.getAssignmentId()).ifPresent(assignment -> {
                if (assignment.getStatus() == AssignmentStatus.EXPIRED || assignment.getStatus() == AssignmentStatus.CANCELLED) {
                    throw new AppException(ErrorCode.VALIDATION_FAILED, "Hóa đơn này thuộc về một đơn giữ chỗ đã hết hạn hoặc bị hủy. Không thể tiến hành thanh toán!");
                }
            });
        }

        if (bill.getStatus() == BillStatus.PAID) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hóa đơn đã được thanh toán");
        }
        if (bill.getStatus() == BillStatus.CANCELLED) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hóa đơn đã bị hủy, không thể thanh toán");
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Số tiền thanh toán không hợp lệ");
        }

        BigDecimal remaining = bill.getAmount().subtract(bill.getPaidAmount());
        if (amount.compareTo(remaining) > 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Số tiền thanh toán vượt quá số dư còn lại");
        }

        return bill;
    }

    private Payment createPaymentRecord(Bill bill, BigDecimal amount, PaymentMethod method,
                                        String txnCode, PaymentStatus status) {
        if (txnCode == null || txnCode.isBlank()) {
            txnCode = generateCashTransactionCode();
        }

        if (method != PaymentMethod.BANK_TRANSFER && paymentRepository.findByTransactionCode(txnCode).isPresent()) {
            log.warn("Duplicate transaction code: {}", txnCode);
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Giao dịch bị trùng lặp");
        }

        Payment payment = new Payment();
        payment.setBill(bill);
        payment.setAmount(amount);
        payment.setMethod(method);
        payment.setStatus(status);
        payment.setTransactionCode(txnCode);
        if (status == PaymentStatus.SUCCESS) {
            payment.setPaidAt(LocalDateTime.now());
        }

        return paymentRepository.save(payment);
    }

    private void updateBillAfterPayment(Bill bill, BigDecimal amount) {
        BigDecimal newPaidAmount = bill.getPaidAmount().add(amount);
        bill.setPaidAmount(newPaidAmount);

        if (newPaidAmount.compareTo(bill.getAmount()) >= 0) {
            bill.setStatus(BillStatus.PAID);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        billRepository.save(bill);
    }

    private void publishPaymentSuccessEvent(Bill bill) {
        eventPublisher.publishEvent(new PaymentSuccessEvent(
                this,
                bill.getBillId(),
                bill.getAssignmentId(),
                bill.getApplicationId(),
                bill.getStudentId(),
                null,
                null,
                bill.getAmount()
        ));
        log.info("[PaymentService] Published PaymentSuccessEvent for bill={}, assignment={}",
                bill.getBillId(), bill.getAssignmentId());
    }

    private String generateCashTransactionCode() {
        return "CASH-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
    }

    private PaymentResponse buildPaymentResponse(Bill bill, Payment payment) {
        boolean isSuccess = payment.getStatus() == PaymentStatus.SUCCESS;

        return PaymentResponse.builder()
                .paymentId(payment.getPaymentId())
                .paymentStatus(payment.getStatus())
                .paymentMethod(payment.getMethod())
                .transactionCode(payment.getTransactionCode())
                .amount(payment.getAmount())
                .paidAt(payment.getPaidAt())
                .billId(bill.getBillId())
                .billStatus(isSuccess ? bill.getStatus() : null)
                .paidAmount(isSuccess ? bill.getPaidAmount() : null)
                .assignmentStatus(null)
                .message(isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại")
                .build();
    }
}