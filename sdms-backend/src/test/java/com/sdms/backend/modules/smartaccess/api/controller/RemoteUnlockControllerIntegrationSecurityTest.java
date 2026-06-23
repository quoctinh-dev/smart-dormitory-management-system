package com.sdms.backend.modules.smartaccess.api.controller;

import com.sdms.backend.modules.auth.service.JwtService;
import com.sdms.backend.modules.smartaccess.application.service.RemoteUnlockService;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class RemoteUnlockControllerIntegrationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private RemoteUnlockService remoteUnlockService;
    
    @MockBean
    private StudentQueryPort studentQueryPort;

    @Test
    void shouldReturn401WhenNoJwtProvided() throws Exception {
        UUID gateId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();

        mockMvc.perform(post("/api/v1/access/gates/" + gateId + "/unlock")
                        .param("buildingId", buildingId.toString())
                        .with(csrf()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldReturn403WhenJwtProvidedButMissingAuthority() throws Exception {
        UUID gateId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();

        String testUsername = UUID.randomUUID().toString();
        UserAccount account = new UserAccount();
        account.setAccountId(UUID.randomUUID());
        account.setUsername(testUsername);
        account.setRole(Role.STUDENT);
        account.setStatus(AccountStatus.ACTIVE);

        when(userAccountRepository.findByUsernameWithStudent(testUsername)).thenReturn(Optional.of(account));

        String token = jwtService.generateAccessToken(account);

        mockMvc.perform(post("/api/v1/access/gates/" + gateId + "/unlock")
                        .param("buildingId", buildingId.toString())
                        .header("Authorization", "Bearer " + token)
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    void shouldReturn204WhenJwtProvidedWithCorrectAuthority() throws Exception {
        UUID gateId = UUID.randomUUID();
        UUID buildingId = UUID.randomUUID();

        String adminUsername = UUID.randomUUID().toString();
        UserAccount account = spy(new UserAccount());
        account.setAccountId(UUID.randomUUID());
        account.setUsername(adminUsername);
        account.setRole(Role.ADMIN);
        account.setStatus(AccountStatus.ACTIVE);

        doReturn(List.of(new SimpleGrantedAuthority("REMOTE_UNLOCK"))).when(account).getAuthorities();

        when(userAccountRepository.findByUsernameWithStudent(adminUsername)).thenReturn(Optional.of(account));

        String token = jwtService.generateAccessToken(account);

        mockMvc.perform(post("/api/v1/access/gates/" + gateId + "/unlock")
                        .param("buildingId", buildingId.toString())
                        .header("Authorization", "Bearer " + token)
                        .with(csrf()))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(remoteUnlockService, times(1)).executeRemoteUnlock(any(), any(), any());
    }
}
