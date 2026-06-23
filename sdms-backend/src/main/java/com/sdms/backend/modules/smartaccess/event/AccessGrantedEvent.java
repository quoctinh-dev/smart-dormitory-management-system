package com.sdms.backend.modules.smartaccess.event;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class AccessGrantedEvent {
    private final UUID gateId;
    private final UUID studentId;
    
    // This event MUST be consumed by an IoT module listener 
    // annotated with @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
}
