package com.sdms.backend.modules.smartaccess.api.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.sdms.backend.modules.smartaccess.application.service.RemoteUnlockService;
import com.sdms.backend.modules.smartaccess.config.TestSecurityConfig;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;
import com.sdms.backend.config.SecurityConfig;
import com.sdms.backend.security.JwtAuthenticationFilter;
import com.sdms.backend.security.CustomAccessDeniedHandler;
import com.sdms.backend.security.JwtAuthenticationEntryPoint;
import org.springframework.context.annotation.Import;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(
    controllers = RemoteUnlockController.class,
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = {
        SecurityConfig.class,
        JwtAuthenticationFilter.class,
        CustomAccessDeniedHandler.class,
        JwtAuthenticationEntryPoint.class
    })
)
@Import(TestSecurityConfig.class)
class RemoteUnlockControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RemoteUnlockService service;
    
    @MockBean
    private StudentQueryPort studentQueryPort;

    @Test
    @WithMockUser(authorities = "VIEW_ACCESS_HISTORY") // Wrong authority
    void shouldReturn403WhenMissingRemoteUnlockAuthority() throws Exception {
        UUID gateId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();

        // Admin has VIEW authority, but NOT REMOTE_UNLOCK. Must be strictly rejected (Zero Trust).
        mockMvc.perform(post("/api/v1/access/gates/" + gateId + "/unlock")
                        .param("buildingId", buildingId.toString())
                        .with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "123e4567-e89b-12d3-a456-426614174000", authorities = "REMOTE_UNLOCK")
    void shouldReturn204WhenAuthorized() throws Exception {
        UUID gateId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();

        // Exact authority matched. Action permitted.
        mockMvc.perform(post("/api/v1/access/gates/" + gateId + "/unlock")
                        .param("buildingId", buildingId.toString())
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
