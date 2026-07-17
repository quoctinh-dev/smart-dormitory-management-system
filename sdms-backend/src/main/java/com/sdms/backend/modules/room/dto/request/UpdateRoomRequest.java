package com.sdms.backend.modules.room.dto.request;

import com.sdms.backend.modules.room.enums.RoomStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO dùng để cập nhật phòng.
 * * NOTE: Không cho phép đổi roomCode sau khi đã khởi tạo để tránh sai lệch định danh.
 */
@Getter
@Setter
public class UpdateRoomRequest {

    @Min(value = 1, message = "Sức chứa tối thiểu là 1")
    @Max(value = 20, message = "Sức chứa tối đa là 20")
    private Integer capacity;

    private RoomStatus status;
}