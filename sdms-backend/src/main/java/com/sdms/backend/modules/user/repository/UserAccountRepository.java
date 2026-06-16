package com.sdms.backend.modules.user.repository;

import com.sdms.backend.modules.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    Optional<UserAccount> findByUsername(String username);
    Optional<UserAccount> findByEmail(String email);
    Optional<UserAccount> findByStudent_StudentId(UUID studentId);
    Optional<UserAccount> findByRefreshToken(String refreshToken);
    Optional<UserAccount> findByResetPasswordToken(String resetPasswordToken);
}
