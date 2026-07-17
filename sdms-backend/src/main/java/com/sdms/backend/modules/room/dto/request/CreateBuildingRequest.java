package com.sdms.backend.modules.room.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO dùng để tạo mới một tòa nhà.
 * * BUSINESS RULE:
 * - Code phải là duy nhất (kiểm tra ở Service Layer).
 * - Code và Name là bắt buộc.
 */
@Getter
@Setter
public class CreateBuildingRequest {

    @NotBlank(message = "Mã tòa nhà là bắt buộc")
    @Size(max = 20, message = "Mã không được vượt quá 20 ký tự")
    private String code;

    @NotBlank(message = "Tên tòa nhà là bắt buộc")
    @Size(max = 100, message = "Tên không được vượt quá 100 ký tự")
    private String name;

    @Size(max = 1000, message = "Mô tả không được vượt quá 1000 ký tự")
    private String description;

    private com.sdms.backend.modules.room.enums.BuildingGender gender = com.sdms.backend.modules.room.enums.BuildingGender.MIXED;
}