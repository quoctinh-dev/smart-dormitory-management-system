package com.sdms.backend.modules.face.infrastructure.adapter;

import com.sdms.backend.modules.face.port.AiExtractionPort;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class RestAiExtractionAdapter implements AiExtractionPort {

    private final RestTemplate restTemplate;

    @Value("${ai.face.engine.url:http://localhost:8000/api/v1/faces/extract}")
    private String aiEngineUrl;

    @Override
    public float[] extractVector(String imageUrl) {
        log.info("Requesting vector extraction from AI Engine. Image: {}", imageUrl);
        try {
            // Map<String, String> payload = Map.of("image_url", imageUrl);
            // return restTemplate.postForObject(aiEngineUrl, payload, float[].class);
            
            // Temporary Mock for Local Development & Demo Validation
            // Must be deterministic so the same imageUrl yields the exact same vector!
            log.warn("AI Engine sidecar is pending deployment. Returning DETERMINISTIC MOCK 512-dimension vector.");
            float[] mockVector = new float[512];
            int hash = imageUrl != null ? imageUrl.hashCode() : 0;
            for (int i = 0; i < 512; i++) {
                // Use a seeded pseudorandom approach or simple math based on hash
                // Normalizing loosely to avoid massive vectors
                mockVector[i] = (float) Math.abs(Math.sin(hash + i)); 
            }
            return mockVector;
        } catch (Exception e) {
            log.error("AI Engine connection error: {}", e.getMessage());
            throw new RuntimeException("Failed to extract face vector from external AI Engine", e);
        }
    }
}
