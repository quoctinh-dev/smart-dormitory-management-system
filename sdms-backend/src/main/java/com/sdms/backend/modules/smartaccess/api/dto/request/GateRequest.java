package com.sdms.backend.modules.smartaccess.api.dto.request;

import com.sdms.backend.modules.smartaccess.domain.enums.GateType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class GateRequest {

    @NotBlank(message = "Tên cổng không được để trống")
    private String name;

    @NotNull(message = "Loại cổng không được để trống")
    private GateType gateType;

    private UUID buildingId;
    private UUID roomId;

    private String macAddress;

    private boolean active = true;
}
