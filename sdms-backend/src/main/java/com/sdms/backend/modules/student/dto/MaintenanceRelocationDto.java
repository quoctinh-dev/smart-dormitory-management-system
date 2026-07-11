package com.sdms.backend.modules.student.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class MaintenanceRelocationDto {
    @NotNull(message = "Phòng bảo trì không được để trống")
    private UUID maintenanceRoomId;
    
    @NotEmpty(message = "Danh sách sinh viên di dời không được để trống")
    private List<StudentRelocation> relocations;
    
    @Data
    public static class StudentRelocation {
        @NotNull
        private UUID studentId;
        
        @NotNull
        private UUID targetBedId;
    }
}
