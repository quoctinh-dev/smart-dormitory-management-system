package com.sdms.backend.modules.user.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.student.dto.response.StudentProfileResponse;
import com.sdms.backend.modules.user.dto.response.MeResponse;
import com.sdms.backend.modules.user.dto.response.UserAccountResponse;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.common.response.PageResponse;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserAccountRepository repository;
    private final PasswordEncoder passwordEncoder;

    public MeResponse getMe() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
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

        throw new AppException(ErrorCode.INVALID_CREDENTIALS);
    }

    public PageResponse<UserAccountResponse> searchAccounts(String keyword, Role role, AccountStatus status, Pageable pageable) {
        String searchKeyword = (keyword == null) ? "" : keyword;
        Page<UserAccount> page = repository.searchAccounts(searchKeyword, role, status, pageable);
        
        Page<UserAccountResponse> dtoPage = page.map(account -> UserAccountResponse.builder()
                .accountId(account.getAccountId())
                .username(account.getUsername())
                .email(account.getEmail())
                .role(account.getRole().name())
                .status(account.getStatus().name())
                .lastLogin(account.getLastLogin())
                .build());

        return PageResponse.fromPage(page, dtoPage.getContent());
    }

    @Transactional
    public void toggleAccountStatus(UUID accountId) {
        UserAccount account = repository.findById(accountId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserAccount currentAccount) {
            if (account.getAccountId().equals(currentAccount.getAccountId())) {
                throw new AppException(ErrorCode.CANNOT_LOCK_SELF);
            }
        }

        if (account.getRole() == Role.ADMIN && account.getStatus() == AccountStatus.ACTIVE) {
            throw new AppException(ErrorCode.CANNOT_LOCK_ADMIN);
        }

        if (account.getStatus() == AccountStatus.PENDING_ACTIVATION) {
            throw new AppException(ErrorCode.CANNOT_TOGGLE_PENDING_ACCOUNT);
        }

        if (account.getStatus() == AccountStatus.ACTIVE) {
            account.setStatus(AccountStatus.LOCKED);
            account.setRefreshToken(null);
        } else if (account.getStatus() == AccountStatus.LOCKED) {
            account.setStatus(AccountStatus.ACTIVE);
            account.setFailedLoginAttempts(0);
            account.setLockTime(null);
        } else {
            throw new AppException(ErrorCode.INVALID_ACCOUNT_STATE);
        }

        repository.save(account);
    }

    @Transactional
    public void createStaff(com.sdms.backend.modules.user.dto.request.CreateStaffRequest request) {
        if (repository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_ALREADY_EXISTS);
        }
        if (repository.existsByEmail(request.getEmail())) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        UserAccount staff = new UserAccount();
        staff.setUsername(request.getUsername());
        staff.setEmail(request.getEmail());
        staff.setPassword(passwordEncoder.encode(request.getPassword()));
        staff.setRole(Role.STAFF);
        staff.setStatus(AccountStatus.ACTIVE);
        staff.setFailedLoginAttempts(0);

        repository.save(staff);
    }

    // Đã xóa hàm getStudentProfileByAccountId và updateStudentAcademicInfo do không sử dụng ở frontend
}
