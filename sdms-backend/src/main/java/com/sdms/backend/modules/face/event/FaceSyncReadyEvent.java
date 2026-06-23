package com.sdms.backend.modules.face.event;

import java.util.UUID;

public record FaceSyncReadyEvent(UUID profileId) {}
