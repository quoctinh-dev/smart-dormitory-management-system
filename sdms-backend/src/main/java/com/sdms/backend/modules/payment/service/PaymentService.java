package com.sdms.backend.modules.payment.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.payment.dto.response.PaymentResponse;
import com.sdms.backend.modules.payment.entity.Bill;
import com.sdms.backend.modules.payment.entity.Payment;
import com.sdms.backend.modules.payment.enums.BillStatus;
import com.sdms.backend.modules.payment.enums.PaymentStatus;
import com.sdms.backend.modules.payment.enums.PaymentMethod;
import com.sdms.backend.modules.payment.repository.BillRepository;
import com.sdms.backend.modules.payment.repository.PaymentRepository;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
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
    private final ApplicationEventPublisher eventPublisher;

    // ==================== ONLINE PAYMENT (STUDENT) ====================
    @PreAuthorize("hasRole('STUDENT')")
    @Transactional
    public PaymentResponse processOnlinePayment(UUID billId,
                                                BigDecimal amount,
                                                PaymentMethod method,
                                                String transactionCode) {
        if (method == PaymentMethod.CASH) {
            throw new AppException("CASH payment is not allowed here", HttpStatus.BAD_REQUEST);
        }
        // Giả lập xử lý thành công lập tức trong phân đoạn này.
        return executePayment(billId, amount, method, transactionCode, PaymentStatus.SUCCESS);
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
            throw new AppException("No unpaid or partially paid bill found for this application", HttpStatus.NOT_FOUND);
        }
        Bill bill = bills.get(0); // Assuming one bill per application for simplicity in mock

        // Calculate remaining amount
        BigDecimal remainingAmount = bill.getAmount().subtract(bill.getPaidAmount());
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Bill is already fully paid", HttpStatus.BAD_REQUEST);
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
            if (bill.getAssignmentId() != null && bill.getApplicationId() != null) {
                eventPublisher.publishEvent(new PaymentSuccessEvent(
                        this,
                        bill.getBillId(),
                        bill.getAssignmentId(),
                        bill.getApplicationId()
                ));
                log.info("[PaymentService] Published PaymentSuccessEvent for mock payment: bill={}, assignment={}",
                        bill.getBillId(), bill.getAssignmentId());
            }
        }

        return buildPaymentResponse(bill, payment);
    }

    // ==================== PRIVATE COMMON LOGIC ====================
    // ==================== LIFECYCLE COMPLETION ====================
    @Transactional
    public void markPaymentFailed(UUID paymentId, String reason) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException("Payment not found", HttpStatus.NOT_FOUND));
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new AppException("Only PENDING payments can be marked as FAILED", HttpStatus.BAD_REQUEST);
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
                .orElseThrow(() -> new AppException("Payment not found", HttpStatus.NOT_FOUND));
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new AppException("Only SUCCESS payments can be refunded", HttpStatus.BAD_REQUEST);
        }
        if (refundAmount.compareTo(payment.getAmount()) > 0) {
            throw new AppException("Refund amount exceeds original payment amount", HttpStatus.BAD_REQUEST);
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
                .orElseThrow(() -> new AppException("Payment not found", HttpStatus.NOT_FOUND));
        
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new AppException("Payment is not PENDING", HttpStatus.BAD_REQUEST);
        }
        
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(LocalDateTime.now());
        paymentRepository.save(payment);
        
        Bill bill = payment.getBill();
        updateBillAfterPayment(bill, payment.getAmount()); // Note: using original intended amount to apply to bill
        
        if (bill.getStatus() == BillStatus.PAID) {
            if (bill.getAssignmentId() != null && bill.getApplicationId() != null) {
                eventPublisher.publishEvent(new PaymentSuccessEvent(
                        this,
                        bill.getBillId(),
                        bill.getAssignmentId(),
                        bill.getApplicationId()
                ));
                log.info("[PaymentService] Published PaymentSuccessEvent for bill={}, assignment={}",
                        bill.getBillId(), bill.getAssignmentId());
            }
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
                if (bill.getAssignmentId() != null && bill.getApplicationId() != null) {
                    eventPublisher.publishEvent(new PaymentSuccessEvent(
                            this,
                            bill.getBillId(),
                            bill.getAssignmentId(),
                            bill.getApplicationId()
                    ));
                    log.info("[PaymentService] Published PaymentSuccessEvent for bill={}, assignment={}",
                            bill.getBillId(), bill.getAssignmentId());
                }
            }
        }

        log.info("Payment processed: billId={}, amount={}, method={}, transactionCode={}, paymentStatus={}, billStatus={}",
                bill.getBillId(), amount, method, payment.getTransactionCode(), payment.getStatus(),
                paymentStatus == PaymentStatus.SUCCESS ? bill.getStatus() : null);

        return buildPaymentResponse(bill, payment);
    }

    private Bill validateBillAndAmount(UUID billId, BigDecimal amount) {
        Bill bill = billRepository.findByIdForUpdate(billId)
                .orElseThrow(() -> new AppException("Bill not found", HttpStatus.NOT_FOUND));

        if (bill.getStatus() == BillStatus.PAID) {
            throw new AppException("Bill already paid", HttpStatus.BAD_REQUEST);
        }
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new AppException("Invalid payment amount", HttpStatus.BAD_REQUEST);
        }
        BigDecimal remaining = bill.getAmount().subtract(bill.getPaidAmount());
        if (amount.compareTo(remaining) > 0) {
            throw new AppException("Payment exceeds remaining balance", HttpStatus.BAD_REQUEST);
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
            throw new AppException("Duplicate transaction", HttpStatus.BAD_REQUEST);
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
                .message(isSuccess ? "Payment successful" : "Payment failed")
                .build();
    }
}
