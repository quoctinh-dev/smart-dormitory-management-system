package com.sdms.backend.modules.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class MeResponse {

    private UUID accountId;

    private String username;

    private String email;

    private String role;

    private String status;
}
