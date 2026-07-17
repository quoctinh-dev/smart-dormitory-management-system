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

    @NotBlank(message = "Tên tòa nhà là bắt buộc")
    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự")
    private String name;

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;

    private BuildingStatus status;

    private com.sdms.backend.modules.room.enums.BuildingGender gender;
}