package com.sdms.backend.modules.user.repository;

import com.sdms.backend.modules.user.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UserAccount u WHERE u.email = :email")
    Optional<UserAccount> findByEmailForUpdate(@Param("email") String email);

    @Query("SELECT u FROM UserAccount u LEFT JOIN FETCH u.student WHERE u.username = :username")
    Optional<UserAccount> findByUsernameWithStudent(@Param("username") String username);
}