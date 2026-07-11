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

    @NotBlank(message = "Building code is required")
    @Size(max = 20, message = "Code must not exceed 20 characters")
    private String code;

    @NotBlank(message = "Building name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    private com.sdms.backend.modules.room.enums.BuildingGender gender = com.sdms.backend.modules.room.enums.BuildingGender.MIXED;
}