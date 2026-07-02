package com.sdms.backend.modules.student.dto.request;

import com.sdms.backend.modules.student.enums.CheckoutStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CheckoutRequestReviewDto {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private CheckoutStatus status;

    private String rejectReason;
}
