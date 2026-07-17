package com.sdms.backend.modules.student.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.UUID;

@Data
public class ChangeRoomSubmitDto {
    @NotBlank(message = "Lý do đổi phòng không được để trống")
    private String reason;
    private UUID targetRoomId; // Optional
}
