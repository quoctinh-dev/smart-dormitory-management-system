package com.sdms.backend.modules.smartaccess.api.dto.request;

import com.sdms.backend.modules.smartaccess.domain.enums.CurfewRequestStatus;
import lombok.Data;

@Data
public class UpdateCurfewRequestDto {
    private CurfewRequestStatus status;
    private String adminNote;
}
