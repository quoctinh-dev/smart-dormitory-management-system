package com.sdms.backend.modules.smartaccess.application.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.sdms.backend.modules.smartaccess.domain.entity.ProcessedMessage;
import com.sdms.backend.modules.smartaccess.domain.repository.ProcessedMessageRepository;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final ProcessedMessageRepository processedMessageRepository;

    @Transactional
    public boolean isDuplicateOrRegister(String eventId, String source) {
        if (processedMessageRepository.existsById(eventId)) {
            return true;
        }
        processedMessageRepository.save(ProcessedMessage.builder()
                .messageId(eventId)
                .processedAt(LocalDateTime.now())
                .source(source)
                .build());
        return false;
    }
}
