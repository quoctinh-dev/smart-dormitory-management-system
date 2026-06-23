package com.sdms.backend.modules.face.event;

import java.util.UUID;

public record FaceProfileRevokedEvent(UUID profileId, String reason) {}
