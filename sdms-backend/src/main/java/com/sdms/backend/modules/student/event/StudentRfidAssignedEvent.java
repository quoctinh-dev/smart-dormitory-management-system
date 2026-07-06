package com.sdms.backend.modules.student.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class StudentRfidAssignedEvent extends ApplicationEvent {

    private final UUID studentId;
    private final String rfidCode;

    public StudentRfidAssignedEvent(Object source, UUID studentId, String rfidCode) {
        super(source);
        this.studentId = studentId;
        this.rfidCode = rfidCode;
    }
}
