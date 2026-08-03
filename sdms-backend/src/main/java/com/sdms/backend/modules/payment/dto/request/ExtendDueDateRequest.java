package com.sdms.backend.modules.payment.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class ExtendDueDateRequest {
    @NotNull(message = "Ngày đến hạn mới không được để trống")
    @Future(message = "Ngày đến hạn mới phải ở tương lai")
    private LocalDate newDueDate;
}
