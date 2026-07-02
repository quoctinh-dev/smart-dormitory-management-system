package com.sdms.backend.modules.student.dto.request;

import com.sdms.backend.modules.student.enums.ExtensionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StayExtensionReviewRequest {

    @NotNull(message = "Trạng thái phê duyệt không được để trống")
    private ExtensionStatus status;

    private String rejectReason;
}
