package com.sdms.backend.modules.face.event;

import java.util.UUID;

public record FaceMatchSuccessEvent(String gateDeviceId, UUID profileId, UUID attemptId) {}
