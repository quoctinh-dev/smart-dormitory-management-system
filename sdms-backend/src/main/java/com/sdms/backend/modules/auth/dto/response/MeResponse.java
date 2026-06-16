package com.sdms.backend.modules.auth.dto.response;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeResponse {

    private UUID accountId;

    private String username;

    private String email;

    private String role;

    private String fullName;

    private String avatarUrl;
}
