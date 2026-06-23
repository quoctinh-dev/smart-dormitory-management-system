package com.sdms.backend.modules.face.event;

import java.util.UUID;

public record FaceReplacementRejectedEvent(UUID profileId, String reason) {}
