package com.sdms.backend.modules.student.event;

import org.springframework.context.ApplicationEvent;
import java.util.UUID;

public class StudentRoomChangedEvent extends ApplicationEvent {
    private final UUID studentId;
    private final UUID oldBedId;
    private final UUID newBedId;

    public StudentRoomChangedEvent(Object source, UUID studentId, UUID oldBedId, UUID newBedId) {
        super(source);
        this.studentId = studentId;
        this.oldBedId = oldBedId;
        this.newBedId = newBedId;
    }

    public UUID getStudentId() {
        return studentId;
    }

    public UUID getOldBedId() {
        return oldBedId;
    }

    public UUID getNewBedId() {
        return newBedId;
    }
}
