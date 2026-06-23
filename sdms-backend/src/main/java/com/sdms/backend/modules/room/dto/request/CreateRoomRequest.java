package com.sdms.backend.modules.room.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO dùng để tạo mới phòng.
 * * BUSINESS RULE:
 * - capacity giới hạn từ 1 đến 20 (thực tế KTX).
 * - floorId xác định phòng thuộc tầng nào.
 */
@Getter
@Setter
public class CreateRoomRequest {

    @NotNull(message = "Floor ID is required")
    private UUID floorId;

    @NotBlank(message = "Room code is required")
    @Size(max = 30, message = "Room code must not exceed 30 characters")
    private String roomCode;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    @Max(value = 20, message = "Capacity must not exceed 20")
    private Integer capacity;
}