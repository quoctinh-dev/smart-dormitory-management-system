package com.sdms.backend.modules.face.port;

import org.springframework.web.multipart.MultipartFile;

/**
 * Outbound port for AI Engine interactions.
 * Anti-Corruption Layer between Face Module and the external Python AI service.
 */
public interface AiExtractionPort {

    /**
     * Extracts a 192-dimension vector from a face image URL.
     * Throws an exception if no face is detected or if the AI engine is unreachable.
     *
     * @param imageUrl CDN URL of the uploaded portrait
     * @return 512-dimension vector
     */
    float[] extractVector(String imageUrl);

    /**
     * Extracts a 512-dimension vector directly from a MultipartFile (e.g. from ESP32).
     *
     * @param file The uploaded image file
     * @return 512-dimension vector
     */
    float[] extractVector(MultipartFile file);
}
