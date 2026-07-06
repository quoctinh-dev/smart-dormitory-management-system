package com.sdms.backend.modules.application.service;

import com.sdms.backend.modules.application.entity.ApplicationGeneratedDocument;
import com.sdms.backend.modules.application.entity.ApplicationPriority;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.student.entity.StayExtension;
import com.sdms.backend.modules.application.enums.GeneratedDocumentType;
import com.sdms.backend.modules.application.repository.ApplicationGeneratedDocumentRepository;
import com.sdms.backend.modules.upload.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ApplicationPdfService {

    private final TemplateEngine templateEngine;
    private final CloudinaryService cloudinaryService;
    private final ApplicationGeneratedDocumentRepository generatedDocumentRepository;

    public String generateAndUploadRegistrationFormPdf(DormitoryApplication application) {
        log.info("Generating registration form PDF for application code: {}", application.getApplicationCode());
        Context context = new Context();
        context.setVariable("app", application);
        
        // Ensure priorities is not null and convert to a Set of strings for easy checking in template
        Set<String> priorityCategories = application.getPriorities() != null ?
                application.getPriorities().stream()
                        .map(ap -> ap.getPriorityCategory().name())
                        .collect(Collectors.toSet()) : Collections.emptySet();
        context.setVariable("priorities", priorityCategories);

        String htmlContent = templateEngine.process("pdf/registration_form", context);
        String fileName = "registration_form_" + application.getApplicationCode();

        String fileUrl = generateAndUploadPdf(htmlContent, fileName);
        saveGeneratedDocument(application, GeneratedDocumentType.REGISTRATION_FORM, fileUrl);
        log.info("Successfully generated and uploaded registration form PDF for application code: {}", application.getApplicationCode());
        return fileUrl;
    }

    public String generateAndUploadCommitmentFormPdf(DormitoryApplication application) {
        log.info("Generating commitment form PDF for application code: {}", application.getApplicationCode());
        Context context = new Context();
        context.setVariable("app", application);
        
        // Ensure priorities is not null and convert to a Set of strings for easy checking in template
        Set<String> priorityCategories = application.getPriorities() != null ?
                application.getPriorities().stream()
                        .map(ap -> ap.getPriorityCategory().name())
                        .collect(Collectors.toSet()) : Collections.emptySet();
        context.setVariable("priorities", priorityCategories);

        String htmlContent = templateEngine.process("pdf/commitment_form", context);
        String fileName = "commitment_form_" + application.getApplicationCode();

        String fileUrl = generateAndUploadPdf(htmlContent, fileName);
        saveGeneratedDocument(application, GeneratedDocumentType.COMMITMENT_FORM, fileUrl);
        log.info("Successfully generated and uploaded commitment form PDF for application code: {}", application.getApplicationCode());
        return fileUrl;
    }

    public String generateAndUploadExtensionDecisionPdf(StayExtension extension) {
        log.info("Generating extension decision PDF for student code: {}", extension.getStudent().getStudentCode());
        Context context = new Context();
        context.setVariable("ext", extension);
        context.setVariable("student", extension.getStudent());

        String htmlContent = templateEngine.process("pdf/stay_extension_decision", context);
        String fileName = "extension_decision_" + extension.getStudent().getStudentCode() + "_" + extension.getExtensionId();

        String fileUrl = generateAndUploadPdf(htmlContent, fileName);
        log.info("Successfully generated and uploaded extension decision form PDF for student code: {}", extension.getStudent().getStudentCode());
        return fileUrl;
    }

    private String regularFontPath;
    private String boldFontPath;

    @jakarta.annotation.PostConstruct
    public void initFonts() {
        try {
            java.io.File regFile = java.io.File.createTempFile("times", ".ttf");
            regFile.deleteOnExit();
            try (java.io.InputStream in = new org.springframework.core.io.ClassPathResource("fonts/times.ttf").getInputStream();
                 java.io.OutputStream out = new java.io.FileOutputStream(regFile)) {
                org.springframework.util.StreamUtils.copy(in, out);
            }
            this.regularFontPath = regFile.getAbsolutePath();

            java.io.File boldFile = java.io.File.createTempFile("timesbd", ".ttf");
            boldFile.deleteOnExit();
            try (java.io.InputStream in = new org.springframework.core.io.ClassPathResource("fonts/timesbd.ttf").getInputStream();
                 java.io.OutputStream out = new java.io.FileOutputStream(boldFile)) {
                org.springframework.util.StreamUtils.copy(in, out);
            }
            this.boldFontPath = boldFile.getAbsolutePath();
            log.info("Successfully extracted fonts to temp directory");
        } catch (Exception e) {
            log.error("Failed to extract fonts", e);
        }
    }

    private String generateAndUploadPdf(String htmlContent, String fileName) {
        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            ITextRenderer renderer = new ITextRenderer();
            
            // Add custom fonts for Vietnamese support
            if (this.regularFontPath != null) {
                renderer.getFontResolver().addFont(this.regularFontPath, com.itextpdf.text.pdf.BaseFont.IDENTITY_H, com.itextpdf.text.pdf.BaseFont.EMBEDDED);
            }
            if (this.boldFontPath != null) {
                renderer.getFontResolver().addFont(this.boldFontPath, com.itextpdf.text.pdf.BaseFont.IDENTITY_H, com.itextpdf.text.pdf.BaseFont.EMBEDDED);
            }

            renderer.setDocumentFromString(htmlContent);
            renderer.layout();
            renderer.createPDF(outputStream);

            byte[] pdfBytes = outputStream.toByteArray();
            return cloudinaryService.uploadPdfBytes(pdfBytes, "sdms/pdfs", fileName);
        } catch (Exception e) {
            log.error("Error generating or uploading PDF for file: {}", fileName, e);
            throw new RuntimeException("Failed to generate or upload PDF", e);
        }
    }

    private void saveGeneratedDocument(DormitoryApplication application, GeneratedDocumentType documentType, String fileUrl) {
        ApplicationGeneratedDocument generatedDocument = new ApplicationGeneratedDocument();
        generatedDocument.setApplication(application);
        generatedDocument.setDocumentType(documentType);
        generatedDocument.setFileUrl(fileUrl);
        generatedDocument.setGeneratedAt(LocalDateTime.now());
        generatedDocumentRepository.save(generatedDocument);
    }
}
