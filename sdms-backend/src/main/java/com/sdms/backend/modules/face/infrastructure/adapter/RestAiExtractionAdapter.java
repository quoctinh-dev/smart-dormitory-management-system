package com.sdms.backend.modules.face.infrastructure.adapter;

import com.sdms.backend.modules.face.port.AiExtractionPort;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Component
@RequiredArgsConstructor
public class RestAiExtractionAdapter implements AiExtractionPort {

    private final RestTemplate restTemplate;

    @Value("${ai.face.engine.url:http://localhost:8000/api/v1/extract}")
    private String aiEngineUrl;

    @Override
    public float[] extractVector(String imageUrl) {
        log.info("Downloading image from URL to extract vector: {}", imageUrl);
        try {
            byte[] imageBytes = restTemplate.getForObject(imageUrl, byte[].class);
            if (imageBytes == null || imageBytes.length == 0) {
                throw new RuntimeException("Failed to download image from URL: " + imageUrl);
            }
            
            return extractFromBytes(imageBytes, "downloaded_image.jpg");
        } catch (Exception e) {
            log.error("Error during extraction from URL: {}", e.getMessage());
            throw new RuntimeException("Failed to extract face vector from URL", e);
        }
    }

    @Override
    public float[] extractVector(MultipartFile file) {
        log.info("Extracting vector directly from MultipartFile: {}", file.getOriginalFilename());
        try {
            return extractFromBytes(file.getBytes(), file.getOriginalFilename());
        } catch (Exception e) {
            log.error("Error reading bytes from MultipartFile: {}", e.getMessage());
            throw new RuntimeException("Failed to read file for extraction", e);
        }
    }

    private float[] extractFromBytes(byte[] imageBytes, String filename) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            
            // Wrap the byte array in a resource so RestTemplate knows it's a file
            ByteArrayResource resource = new ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return filename != null ? filename : "image.jpg";
                }
            };
            
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            log.info("Calling Python AI Engine at {}", aiEngineUrl);
            ResponseEntity<AiResponse> response = restTemplate.postForEntity(aiEngineUrl, requestEntity, AiResponse.class);

            AiResponse aiResponse = response.getBody();
            if (aiResponse != null && aiResponse.isSuccess() && aiResponse.getData() != null) {
                float[] vector = aiResponse.getData().getVector();
                if (vector == null || vector.length != 192) {
                    log.warn("AI Engine returned vector of unexpected length: {}", vector != null ? vector.length : "null");
                }
                return vector;
            } else {
                String errorMsg = aiResponse != null ? aiResponse.getMessage() : "No response body";
                throw new RuntimeException("AI Engine Error: " + errorMsg);
            }
        } catch (Exception e) {
            log.error("AI Engine connection error: {}", e.getMessage());
            throw new RuntimeException("Failed to extract face vector from external AI Engine", e);
        }
    }

    // --- DTOs for parsing the agreed JSON contract ---
    @Data
    public static class AiResponse {
        private boolean success;
        private String message;
        private AiData data;
    }

    @Data
    public static class AiData {
        private float[] vector;
    }
}
