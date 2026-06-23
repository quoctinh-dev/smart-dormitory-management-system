package com.sdms.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import org.springframework.boot.test.mock.mockito.MockBean;
import com.sdms.backend.modules.smartaccess.application.port.out.StudentQueryPort;

@SpringBootTest
class SdmsBackendApplicationTests {

    @MockBean
    private StudentQueryPort studentQueryPort;

    @Test
    void contextLoads() {
    }

}
