package com.sdms.backend.modules.student.dto.response;

import com.sdms.backend.modules.student.enums.CheckoutStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CheckoutRequestResponse {
    private UUID requestId;
    private UUID studentId;
    private String studentCode;
    private String fullName;
    private UUID assignmentId;
    private String roomCode;
    private String bedCode;
    
    private LocalDateTime intendedCheckoutDate;
    private String reason;
    private String bankAccountNumber;
    private String bankName;
    
    private CheckoutStatus status;
    private String rejectReason;
    private LocalDateTime createdAt;
}
