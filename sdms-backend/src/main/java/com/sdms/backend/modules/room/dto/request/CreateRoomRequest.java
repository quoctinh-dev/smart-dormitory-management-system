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

    @NotNull(message = "ID tầng là bắt buộc")
    private UUID floorId;

    @NotBlank(message = "Mã phòng là bắt buộc")
    @Size(max = 30, message = "Mã phòng không được vượt quá 30 ký tự")
    private String roomCode;

    @NotNull(message = "Sức chứa là bắt buộc")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1")
    @Max(value = 20, message = "Sức chứa tối đa là 20")
    private Integer capacity;
}