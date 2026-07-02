package com.sdms.backend.modules.room.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class CheckInCompletedEvent extends ApplicationEvent {
    private final UUID assignmentId;
    private final UUID applicationId;
    private final UUID studentId;
    private final String email;
    private final String studentName;
    private final String bedCode;
    private final String roomCode;

    public CheckInCompletedEvent(Object source, UUID assignmentId, UUID applicationId, UUID studentId, String email, String studentName, String bedCode, String roomCode) {
        super(source);
        this.assignmentId = assignmentId;
        this.applicationId = applicationId;
        this.studentId = studentId;
        this.email = email;
        this.studentName = studentName;
        this.bedCode = bedCode;
        this.roomCode = roomCode;
    }
}
