package com.sdms.backend.modules.student.dto.request;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CheckoutRequestSubmitDto {

    @NotNull(message = "Ngày dự kiến rời khỏi không được để trống")
    @Future(message = "Ngày rời khỏi phải ở trong tương lai")
    private LocalDateTime intendedCheckoutDate;

    @NotBlank(message = "Lý do trả phòng không được để trống")
    private String reason;

    private String bankAccountNumber;

    private String bankName;
}
