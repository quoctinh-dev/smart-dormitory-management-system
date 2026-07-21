package com.sdms.backend.modules.payment.dto.request;

import com.sdms.backend.modules.payment.enums.BillType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class CreateManualBillRequest {
    @NotNull(message = "Student ID không được để trống")
    private UUID studentId;
    
    private UUID roomId;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "0.0", inclusive = false, message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @NotBlank(message = "Lý do không được để trống")
    private String description;

    @NotNull(message = "Loại hóa đơn không được để trống")
    private BillType billType;

    @NotNull(message = "Hạn thanh toán không được để trống")
    private LocalDate dueDate;
}
