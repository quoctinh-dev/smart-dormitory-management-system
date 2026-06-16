package com.sdms.backend;

import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class SdmsBackendApplication {


    public static void main(String[] args) {
        SpringApplication.run(SdmsBackendApplication.class, args);
    }

}