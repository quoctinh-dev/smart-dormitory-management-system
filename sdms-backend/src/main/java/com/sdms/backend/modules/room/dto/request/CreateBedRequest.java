package com.sdms.backend.modules.room.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO dùng để tạo mới một giường vào hệ thống.
 * * BUSINESS RULE:
 * - bedCode phải có độ dài hợp lý để đồng bộ với định danh IoT.
 */
@Getter
@Setter
public class CreateBedRequest {

    @NotNull(message = "Room ID is required")
    private UUID roomId;

    @NotBlank(message = "Bed code is required")
    @Size(max = 30, message = "Bed code must not exceed 30 characters")
    private String bedCode;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    private String note;
}