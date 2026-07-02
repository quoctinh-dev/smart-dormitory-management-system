package com.sdms.backend.modules.face.event;

import java.util.UUID;

public record FaceProfileApprovedEvent(UUID profileId, UUID studentId, String email, String studentName) {}
