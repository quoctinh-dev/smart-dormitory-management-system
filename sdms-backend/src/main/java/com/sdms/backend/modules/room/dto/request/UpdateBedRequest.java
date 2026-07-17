package com.sdms.backend.modules.room.dto.request;

import com.sdms.backend.modules.room.enums.BedStatus;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

/**
 * DTO dùng để cập nhật trạng thái giường (ví dụ: chuyển sang MAINTENANCE).
 */
@Getter
@Setter
public class UpdateBedRequest {

    private BedStatus status;

    @Size(max = 500, message = "Ghi chú không được vượt quá 500 ký tự")
    private String note;
}