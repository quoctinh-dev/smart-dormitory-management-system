package com.sdms.backend.modules.system.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.system.dto.SystemConfigDTO;
import com.sdms.backend.modules.system.entity.SystemConfig;
import com.sdms.backend.modules.system.repository.SystemConfigRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;

    @Transactional(readOnly = true)
    public List<SystemConfigDTO> getAllConfigs() {
        return systemConfigRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String getConfigValue(String key, String defaultValue) {
        return systemConfigRepository.findById(key)
                .map(SystemConfig::getConfigValue)
                .orElse(defaultValue);
    }

    @Transactional
    public SystemConfigDTO updateConfig(String key, SystemConfigDTO dto) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseThrow(() -> new AppException("System config not found with key: " + key, HttpStatus.NOT_FOUND));

        config.setConfigValue(dto.getConfigValue());
        if (dto.getDescription() != null) {
            config.setDescription(dto.getDescription());
        }

        config = systemConfigRepository.save(config);
        return mapToDTO(config);
    }

    private SystemConfigDTO mapToDTO(SystemConfig config) {
        return SystemConfigDTO.builder()
                .configKey(config.getConfigKey())
                .configValue(config.getConfigValue())
                .description(config.getDescription())
                .build();
    }
}
