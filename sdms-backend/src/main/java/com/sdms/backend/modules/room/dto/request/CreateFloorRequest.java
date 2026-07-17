package com.sdms.backend.modules.room.dto.request;

import com.sdms.backend.common.enums.Gender;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import java.util.UUID;

/**
 * DTO dùng để tạo mới một tầng cho tòa nhà.
 * * BUSINESS RULE:
 * - buildingId là bắt buộc để xác định tầng thuộc tòa nhà nào.
 * - floorNumber và gender giúp định hình cơ sở hạ tầng KTX.
 */
@Getter
@Setter
public class CreateFloorRequest {

    @NotNull(message = "ID tòa nhà là bắt buộc")
    private UUID buildingId;

    @NotNull(message = "Số tầng là bắt buộc")
    private Integer floorNumber;

    @NotNull(message = "Chính sách giới tính là bắt buộc")
    private Gender gender;
}