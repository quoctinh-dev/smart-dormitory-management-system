package com.sdms.backend.modules.room.event;

import com.sdms.backend.common.enums.Gender;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import java.util.UUID;

@Getter
public class BedReleasedEvent extends ApplicationEvent {
    private final UUID roomId;
    private final UUID bedId;
    private final Gender gender;

    private final UUID assignmentId;
    private final UUID studentId;

    public BedReleasedEvent(Object source, UUID roomId, UUID bedId, Gender gender, UUID assignmentId, UUID studentId) {
        super(source);
        this.roomId = roomId;
        this.bedId = bedId;
        this.gender = gender;
        this.assignmentId = assignmentId;
        this.studentId = studentId;
    }
}
