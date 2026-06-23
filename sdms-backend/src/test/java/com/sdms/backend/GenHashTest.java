package com.sdms.backend;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GenHashTest {
    @Test
    public void testHash() {
        System.out.println("HASH_IS=" + new BCryptPasswordEncoder().encode("123456"));
    }
}
