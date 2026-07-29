package com.sdms.backend.modules.student.dto.request;

import com.sdms.backend.modules.student.enums.CheckoutStatus;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class BulkCheckoutReviewDto {
    @NotEmpty(message = "Danh sách đơn không được để trống")
    private List<UUID> requestIds;

    @NotNull(message = "Trạng thái không được để trống")
    private CheckoutStatus status;
}
