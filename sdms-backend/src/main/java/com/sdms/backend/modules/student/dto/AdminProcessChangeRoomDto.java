package com.sdms.backend.modules.student.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class AdminProcessChangeRoomDto {
    @NotNull(message = "Phải xác định phê duyệt hay từ chối")
    private Boolean isApproved;
    
    private String adminNote;
    
    // Bắt buộc nếu isApproved = true
    private UUID newBedId;
}
