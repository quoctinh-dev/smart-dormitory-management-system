package com.sdms.backend.modules.user.repository;

import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.Role;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserAccountRepository extends JpaRepository<UserAccount, UUID> {
    
    @EntityGraph(attributePaths = {"student"})
    Optional<UserAccount> findByUsername(String username);
    
    @EntityGraph(attributePaths = {"student"})
    Optional<UserAccount> findByEmail(String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    Optional<UserAccount> findByResetPasswordToken(String token);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UserAccount u WHERE u.email = :email")
    Optional<UserAccount> findByEmailForUpdate(@Param("email") String email);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT u FROM UserAccount u WHERE u.username = :username")
    Optional<UserAccount> findByUsernameForUpdate(@Param("username") String username);

    List<UserAccount> findByRole(Role role);

    @Query("SELECT u FROM UserAccount u WHERE " +
           "(LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:role IS NULL OR CAST(:role AS string) = '' OR u.role = :role) " +
           "AND (:status IS NULL OR CAST(:status AS string) = '' OR u.status = :status)")
    Page<UserAccount> searchAccounts(@Param("keyword") String keyword, 
                                     @Param("role") Role role, 
                                     @Param("status") com.sdms.backend.modules.user.enums.AccountStatus status, 
                                     Pageable pageable);
}
