package com.sdms.backend.modules.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;
import java.io.Serializable;

@Data
@Builder
public class HourlyTrafficDto implements Serializable {
    private String time;
    private long in;
    private long out;
}
