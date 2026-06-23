package com.sdms.backend.modules.application.service;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.modules.application.entity.ApplicationGeneratedDocument;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.enums.GeneratedDocumentType;
import com.sdms.backend.modules.application.repository.ApplicationGeneratedDocumentRepository;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationPdfService {

    private final DormitoryApplicationRepository applicationRepository;
    private final ApplicationGeneratedDocumentRepository generatedDocumentRepository;
    private final SpringTemplateEngine templateEngine;
    
    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Sinh tài liệu PDF Phiếu đăng ký lưu trú không đồng bộ.
     */
    @Async
    @Transactional
    public CompletableFuture<String> generateRegistrationFormPdf(UUID applicationId) {
        log.info("Starting async generation of REGISTRATION_FORM for application={}", applicationId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        try {
            // Chuẩn bị Data cho Template
            Context context = new Context();
            context.setVariable("app", application);
            
            int year = LocalDateTime.now().getYear();
            context.setVariable("academicYear", year + " - " + (year + 1));
            
            // Xử lý list diện ưu tiên sang List String để dễ check in template
            List<String> priorityCodes = application.getPriorities() != null ? 
                application.getPriorities().stream()
                    .map(p -> p.getPriorityCategory().name())
                    .collect(Collectors.toList()) : List.of();
            context.setVariable("priorities", priorityCodes);

            // Render HTML
            String html = templateEngine.process("pdf/registration_form", context);

            // Tạo file PDF
            String fileName = "registration_" + application.getApplicationCode() + ".pdf";
            String fileUrl = generatePdfFile(html, fileName);

            // Lưu thông tin Metadata
            ApplicationGeneratedDocument genDoc = generatedDocumentRepository
                    .findByApplication_ApplicationIdAndDocumentType(applicationId, GeneratedDocumentType.REGISTRATION_FORM)
                    .orElseGet(() -> {
                        ApplicationGeneratedDocument doc = new ApplicationGeneratedDocument();
                        doc.setApplication(application);
                        doc.setDocumentType(GeneratedDocumentType.REGISTRATION_FORM);
                        return doc;
                    });

            genDoc.setFileUrl(fileUrl);
            genDoc.setTemplateVersion("V1.0");
            genDoc.setGeneratedAt(LocalDateTime.now());
            generatedDocumentRepository.save(genDoc);

            application.setApplicationPdfUrl(fileUrl);
            applicationRepository.save(application);

            log.info("Finished async generation of REGISTRATION_FORM for application={}: {}", applicationId, fileUrl);
            return CompletableFuture.completedFuture(fileUrl);
        } catch (Exception e) {
            log.error("Failed to generate REGISTRATION_FORM PDF for application={}", applicationId, e);
            return CompletableFuture.completedFuture(null);
        }
    }

    /**
     * Sinh tài liệu PDF Bản cam kết nội trú không đồng bộ.
     */
    @Async
    @Transactional
    public CompletableFuture<String> generateCommitmentFormPdf(UUID applicationId) {
        log.info("Starting async generation of COMMITMENT_FORM for application={}", applicationId);
        DormitoryApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new AppException("Application not found", HttpStatus.NOT_FOUND));

        try {
            // Chuẩn bị Data cho Template
            Context context = new Context();
            context.setVariable("app", application);

            // Render HTML
            String html = templateEngine.process("pdf/commitment_form", context);

            // Tạo file PDF
            String fileName = "commitment_" + application.getApplicationCode() + ".pdf";
            String fileUrl = generatePdfFile(html, fileName);

            // Lưu thông tin Metadata
            ApplicationGeneratedDocument genDoc = generatedDocumentRepository
                    .findByApplication_ApplicationIdAndDocumentType(applicationId, GeneratedDocumentType.COMMITMENT_FORM)
                    .orElseGet(() -> {
                        ApplicationGeneratedDocument doc = new ApplicationGeneratedDocument();
                        doc.setApplication(application);
                        doc.setDocumentType(GeneratedDocumentType.COMMITMENT_FORM);
                        return doc;
                    });

            genDoc.setFileUrl(fileUrl);
            genDoc.setTemplateVersion("V1.0");
            genDoc.setGeneratedAt(LocalDateTime.now());
            generatedDocumentRepository.save(genDoc);

            log.info("Finished async generation of COMMITMENT_FORM for application={}: {}", applicationId, fileUrl);
            return CompletableFuture.completedFuture(fileUrl);
        } catch (Exception e) {
            log.error("Failed to generate COMMITMENT_FORM PDF for application={}", applicationId, e);
            return CompletableFuture.completedFuture(null);
        }
    }
    
    private String generatePdfFile(String htmlContent, String fileName) throws Exception {
        Path pdfDir = Paths.get(uploadDir, "pdfs");
        if (!Files.exists(pdfDir)) {
            Files.createDirectories(pdfDir);
        }
        
        File pdfFile = pdfDir.resolve(fileName).toFile();
        try (OutputStream os = new FileOutputStream(pdfFile)) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            builder.useFastMode();
            builder.withHtmlContent(htmlContent, null);
            builder.toStream(os);
            builder.run();
        }
        
        // Trả về Mock URL để tải (Trong thực tế có thể upload lên S3 và trả link S3)
        // Hiện tại giả lập trả về URL localhost hoặc đường dẫn tương đối
        return "/uploads/pdfs/" + fileName;
    }
}
