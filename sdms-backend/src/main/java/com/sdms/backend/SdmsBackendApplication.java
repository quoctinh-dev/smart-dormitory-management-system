package com.sdms.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
@EnableAsync
public class SdmsBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(SdmsBackendApplication.class, args);
        BCryptPasswordEncoder encoder =
                new BCryptPasswordEncoder();
        System.out.println(
                encoder.encode("123456")
        );
    }

}