package com.sdms.backend.modules.room.dto.request;

import com.sdms.backend.common.enums.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO dùng để cập nhật chính sách cư trú của tầng.
 * * NOTE: floorNumber thường không thay đổi sau khi khởi tạo để tránh sai lệch cấu trúc tầng.
 */
@Getter
@Setter
public class UpdateFloorRequest {

    @NotNull(message = "Occupancy policy is required")
    private Gender gender;
}