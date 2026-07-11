package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.UUID;

@Getter
@AllArgsConstructor
public class RoomPinChangedEvent {
    private final UUID roomId;
    private final String roomCode;
    private final String newPin;
}
