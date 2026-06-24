package com.sdms.backend.modules.user.repository;

import com.sdms.backend.modules.user.entity.UserAccount;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    
    @EntityGraph(attributePaths = {"student"})
    Optional<UserAccount> findByUsername(String username);
    
    @EntityGraph(attributePaths = {"student"})
    Optional<UserAccount> findByEmail(String email);

    boolean existsByUsername(String username);

    Optional<UserAccount> findByResetPasswordToken(String token);

    Optional<UserAccount> findByStudent_StudentId(UUID studentId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UserAccount u WHERE u.email = :email")
    Optional<UserAccount> findByEmailForUpdate(@Param("email") String email);
}
