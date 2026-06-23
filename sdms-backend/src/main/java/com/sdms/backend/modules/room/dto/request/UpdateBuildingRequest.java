package com.sdms.backend.modules.room.dto.request;

import com.sdms.backend.modules.room.enums.BuildingStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO dùng để cập nhật thông tin tòa nhà.
 * * NOTE: Không cho phép cập nhật 'code' sau khi đã khởi tạo để bảo toàn tính toàn vẹn.
 */
@Getter
@Setter
public class UpdateBuildingRequest {

    @NotBlank(message = "Building name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private BuildingStatus status;
}