package com.sdms.backend.modules.user.service;

import com.sdms.backend.modules.auth.dto.response.MeResponse;
import com.sdms.backend.modules.user.entity.UserAccount;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    public MeResponse getMe() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // 1. Kiểm tra xác thực có tồn tại và đã được xác thực chưa
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Người dùng chưa được xác thực");
        }

        Object principal = authentication.getPrincipal();

        // 2. Kiểm tra xem principal có phải là UserAccount không
        if (principal instanceof UserAccount account) {
            return MeResponse.builder()
                    .accountId(account.getAccountId())
                    .username(account.getUsername())
                    .email(account.getEmail())
                    .role(account.getRole().name())
                    .build();
        }

        throw new RuntimeException("Thông tin người dùng không hợp lệ");
    }
}
