package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.payment.dto.response.PaymentResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import com.sdms.backend.modules.payment.enums.PaymentMethod;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.repository.PaymentRepository;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.room.repository.StudentHousingAssignmentRepository;
import com.sdms.backend.modules.room.entity.StudentHousingAssignment;
import com.sdms.backend.modules.room.enums.AssignmentStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
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

    @org.springframework.beans.factory.annotation.Value("${payment.sepay.api-key:default-api-key}")
    private String sepayApiKey;

    // ==================== ONLINE PAYMENT (STUDENT) ====================
    // @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public PaymentResponse processOnlinePayment(UUID billId,
                                                BigDecimal amount,
                                                PaymentMethod method,
                                                String transactionCode) {
        if (method == PaymentMethod.CASH) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Không hỗ trợ thanh toán tiền mặt tại đây");
        }
        // 1. Validate the bill and amount
        Bill bill = validateBillAndAmount(billId, amount);

        // 2. Generate deterministic transaction code for SePay matching: "SDMS" + first 8 characters of Bill ID
        String txnCode = "SDMS" + bill.getBillId().toString().substring(0, 8).toUpperCase();

        // 3. Find existing PENDING payment or create a new one
        Payment payment = paymentRepository.findByBill_BillIdAndStatus(bill.getBillId(), PaymentStatus.PENDING)
                .orElseGet(() -> createPaymentRecord(bill, amount, method, txnCode, PaymentStatus.PENDING));

        // 4. Generate the VietQR URL directly for the linked MBBank account
        // Format: https://qr.sepay.vn/img?acc={account}&bank={bank}&amount={amount}&des={description}
        String sepayCheckoutUrl = String.format("https://qr.sepay.vn/img?acc=0819281512&bank=MBBank&amount=%s&des=%s",
                amount.toPlainString(), txnCode);

        // 5. Return response with paymentUrl so frontend can redirect
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

    // ==================== CASH PAYMENT (ADMIN) ====================
    @PreAuthorize("hasRole('ADMIN')")
    @Transactional
    public PaymentResponse approveCashPayment(UUID billId, BigDecimal amount) {
        String transactionCode = "CASH-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        return executePayment(billId, amount, PaymentMethod.CASH, transactionCode, PaymentStatus.SUCCESS);
    }

    // ==================== MOCK PAYMENT SUCCESS (FOR TESTING/DEMO) ====================
    // This method is for testing/demo purposes only. In a real scenario, payments come from gateways.
    @Transactional
    public PaymentResponse mockPaymentSuccess(UUID applicationId) {
        log.info("[PaymentService] Mocking payment success for application={}", applicationId);

        // Find the bill for the application that is UNPAID or PARTIALLY_PAID
        List<Bill> bills = billRepository.findByApplicationIdAndStatusIn(applicationId, List.of(BillStatus.UNPAID, BillStatus.PARTIALLY_PAID));
        if (bills.isEmpty()) {
            throw new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy hóa đơn chưa thanh toán cho đơn đăng ký này");
        }
        Bill bill = bills.get(0); // Assuming one bill per application for simplicity in mock

        // Calculate remaining amount
        BigDecimal remainingAmount = bill.getAmount().subtract(bill.getPaidAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Hóa đơn đã được thanh toán toàn bộ");
        }

        // Create a mock payment record
        Payment payment = createPaymentRecord(
                bill,
                remainingAmount,
                PaymentMethod.BANK_TRANSFER, // Using BANK_TRANSFER as a valid mock method
                "MOCK-" + UUID.randomUUID().toString().replace("-", "").substring(0, 10).toUpperCase(),
                PaymentStatus.SUCCESS
        );

        // Update bill status
        updateBillAfterPayment(bill, remainingAmount);

        // Publish event if bill is fully paid
        if (bill.getStatus() == BillStatus.PAID) {
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
            log.info("[PaymentService] Published PaymentSuccessEvent for mock payment: bill={}, assignment={}",
                    bill.getBillId(), bill.getAssignmentId());
        }

        return buildPaymentResponse(bill, payment);
    }

    // ==================== PRIVATE COMMON LOGIC ====================
    // ==================== LIFECYCLE COMPLETION ====================
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

    @Transactional
    public void expirePendingPayments() {
        LocalDateTime expiryTime = LocalDateTime.now().minusHours(24);
        int expiredCount = paymentRepository.updateStatusForOldPendingPayments(PaymentStatus.PENDING, PaymentStatus.EXPIRED, expiryTime);
        if (expiredCount > 0) {
            log.info("[PaymentService] Expired {} pending payments older than 24 hours.", expiredCount);
        }
    }

    @Transactional
    public void processRefund(UUID paymentId, BigDecimal refundAmount) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException(ErrorCode.VALIDATION_FAILED, "Không tìm thấy giao dịch thanh toán"));
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Chỉ có thể hoàn tiền cho các giao dịch THÀNH CÔNG");
        }
        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new AppException(ErrorCode.VALIDATION_FAILED, "Số tiền hoàn lại vượt quá số tiền thanh toán gốc");
        }
        
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setDescription("Refunded amount: " + refundAmount);
        paymentRepository.save(payment);
        
        Bill bill = payment.getBill();
        BigDecimal newPaidAmount = bill.getPaidAmount().subtract(refundAmount);
        bill.setPaidAmount(newPaidAmount);
        if (newPaidAmount.compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(BillStatus.CANCELLED);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }
        billRepository.save(bill);
        
        log.info("[PaymentService] Payment={} refunded. Amount: {}", paymentId, refundAmount);
    }

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
        updateBillAfterPayment(bill, payment.getAmount()); // Note: using original intended amount to apply to bill
        
        if (bill.getStatus() == BillStatus.PAID) {
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
    }

    public PaymentResponse executePayment(UUID billId,
                                           BigDecimal amount,
                                           PaymentMethod method,
                                           String transactionCode,
                                           PaymentStatus paymentStatus) {
        // 1. Khóa bi quan và kiểm tra hóa đơn
        Bill bill = validateBillAndAmount(billId, amount);

        // 2. Tạo bản ghi giao dịch (Payment record)
        Payment payment = createPaymentRecord(bill, amount, method, transactionCode, paymentStatus);

        // 3. Chỉ cập nhật và phát sự kiện khi thanh toán thành công
        if (paymentStatus == PaymentStatus.SUCCESS) {
            updateBillAfterPayment(bill, amount);
            
            // Nếu hóa đơn đã được thanh toán hoàn toàn (PAID), phát sự kiện PaymentSuccessEvent
            if (bill.getStatus() == BillStatus.PAID) {
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
        }

        log.info("Payment processed: billId={}, amount={}, method={}, transactionCode={}, paymentStatus={}, billStatus={}",
                bill.getBillId(), amount, method, payment.getTransactionCode(), payment.getStatus(),
                paymentStatus == PaymentStatus.SUCCESS ? bill.getStatus() : null);

        return buildPaymentResponse(bill, payment);
    }

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
            txnCode = "TXN-" + UUID.randomUUID().toString().replace("-", "").toUpperCase();
        }
        // Check for duplicate transaction code only if it's not a mock payment
        if (method != PaymentMethod.BANK_TRANSFER && paymentRepository.findByTransactionCode(txnCode).isPresent()) { // Changed MOCK to BANK_TRANSFER
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
