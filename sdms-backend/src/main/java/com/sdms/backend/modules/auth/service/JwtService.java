package com.sdms.backend.modules.auth.service;

import com.sdms.backend.config.JwtConfig;
import com.sdms.backend.modules.user.entity.UserAccount;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;
import java.util.function.Function;

/**
 * Service xử lý các thao tác liên quan đến JWT (JSON Web Token).
 * Đảm nhận việc tạo, xác thực và trích xuất thông tin từ token.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtConfig jwtConfig;

    /**
     * Tạo Access Token (Token ngắn hạn).
     * Chứa thông tin định danh và quyền hạn của người dùng.
     */
    public String generateAccessToken(UserAccount account) {
        return Jwts.builder()
                .subject(account.getUsername())
                .claim("accountId", account.getAccountId().toString())
                .claim("role", account.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getAccessExpiration()))
                .signWith(getAccessSigningKey())
                .compact();
    }

    /**
     * Tạo Refresh Token (Token dài hạn).
     * Dùng để cấp lại Access Token mới khi nó hết hạn.
     */
    public String generateRefreshToken(UserAccount account) {
        return Jwts.builder()
                .subject(account.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getRefreshExpiration()))
                .signWith(getRefreshSigningKey())
                .compact();
    }

    /**
     * Tạo Activation Token.
     * Token này có thời hạn ngắn, dùng để kích hoạt tài khoản lần đầu.
     */
    public String generateActivationToken(UUID userId, String email) {
        return Jwts.builder()
                .subject(email)
                .claim("userId", userId.toString())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 300000))
                .signWith(getAccessSigningKey())
                .compact();
    }

    /**
     * Xác thực Activation Token.
     */
    public boolean validateActivationToken(String token) {
        try {
            extractActivationClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    /**
     * Trích xuất userId từ Activation Token.
     */
    public UUID extractUserIdFromActivationToken(String token) throws JwtException {
        Claims claims = extractActivationClaims(token);
        String userId = claims.get("userId", String.class);
        return UUID.fromString(userId);
    }

    // Các hàm helper để trích xuất thông tin (Claims) từ token
    public <T> T extractAccessClaim(String token, Function<Claims, T> claimsResolver) throws JwtException {
        final Claims claims = extractAccessClaims(token);
        return claimsResolver.apply(claims);
    }

    public <T> T extractRefreshClaim(String token, Function<Claims, T> claimsResolver) throws JwtException {
        final Claims claims = extractRefreshClaims(token);
        return claimsResolver.apply(claims);
    }

    public String extractUsernameFromAccessToken(String token) throws JwtException {
        return extractAccessClaim(token, Claims::getSubject);
    }

    public String extractUsernameFromRefreshToken(String token) throws JwtException {
        return extractRefreshClaim(token, Claims::getSubject);
    }

    public UUID extractAccountId(String token) throws JwtException {
        String accountId = extractAccessClaim(token, claims -> claims.get("accountId", String.class));
        return UUID.fromString(accountId);
    }

    /**
     * Kiểm tra tính hợp lệ (chữ ký, thời hạn) của Token.
     */
    public void validateAccessToken(String token) throws JwtException {
        extractAccessClaims(token);
    }

    public void validateRefreshToken(String token) throws JwtException {
        extractRefreshClaims(token);
    }

    // --- Private Logic nội bộ ---

    private Claims extractAccessClaims(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(getAccessSigningKey()) // Xác thực chữ ký bằng key Access
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Claims extractRefreshClaims(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(getRefreshSigningKey()) // Xác thực chữ ký bằng key Refresh
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private Claims extractActivationClaims(String token) throws JwtException {
        return Jwts.parser()
                .verifyWith(getAccessSigningKey()) // Sử dụng cùng key với Access Token
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Lấy SecretKey cho AccessToken từ cấu hình.
     */
    private SecretKey getAccessSigningKey() {
        String secret = jwtConfig.getAccessSecret();
        validateSecretKey(secret, "Access");
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Lấy SecretKey cho RefreshToken từ cấu hình.
     */
    private SecretKey getRefreshSigningKey() {
        String secret = jwtConfig.getRefreshSecret();
        validateSecretKey(secret, "Refresh");
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Kiểm tra bảo mật của Key: Phải có độ dài tối thiểu 32 bytes (256-bit) theo chuẩn HS256.
     */
    private void validateSecretKey(String secret, String keyType) {
        if (secret == null || secret.trim().isEmpty()) {
            throw new IllegalStateException(keyType + " secret key must not be null or empty");
        }
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    keyType + " secret key must be at least 32 bytes long for HS256 (current: " + keyBytes.length + ")"
            );
        }
    }
}
