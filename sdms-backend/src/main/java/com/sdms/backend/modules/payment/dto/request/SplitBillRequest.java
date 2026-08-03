package com.sdms.backend.modules.payment.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class SplitBillRequest {

    @NotEmpty(message = "Danh sách sinh viên vi phạm không được để trống")
    private List<UUID> nonPayingStudentIds;

    @NotNull(message = "Số tiền chia đều mỗi sinh viên không được để trống")
    @DecimalMin(value = "1.0", message = "Số tiền phải lớn hơn 0")
    private BigDecimal amountPerStudent;
}
