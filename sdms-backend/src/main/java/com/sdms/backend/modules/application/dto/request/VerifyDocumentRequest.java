package com.sdms.backend.modules.application.dto.request;

import com.sdms.backend.modules.application.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyDocumentRequest {
    @NotNull(message = "Trạng thái xác minh là bắt buộc")
    private VerificationStatus status;

    private String note;
}
