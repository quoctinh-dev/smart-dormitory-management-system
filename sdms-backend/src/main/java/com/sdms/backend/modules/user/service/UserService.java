package com.sdms.backend.modules.user.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.user.dto.response.MeResponse;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserAccountRepository repository;

    public MeResponse getMe() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(
                    "Unauthorized",
                    HttpStatus.UNAUTHORIZED
            );
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof UserAccount account) {

            return new MeResponse(
                    account.getAccountId(),
                    account.getUsername(),
                    account.getEmail(),
                    account.getRole().name(),
                    account.getStatus().name()
            );
        }

        throw new AppException(
                "Invalid authentication information",
                HttpStatus.UNAUTHORIZED
        );
    }
}
