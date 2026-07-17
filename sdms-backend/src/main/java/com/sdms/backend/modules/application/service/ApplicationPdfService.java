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

/**
 * [BUSINESS RULE: IMMUTABLE DOCUMENT GENERATION]
 * Service này chịu trách nhiệm sinh ra các tài liệu pháp lý (Phiếu đăng ký, Bản cam kết, Quyết định gia hạn)
 * bằng định dạng PDF và lưu trữ vĩnh viễn trên Cloud.
 * 
 * NGUYÊN TẮC BẤT BIẾN (IMMUTABILITY):
 * 1. Khi sinh viên nộp đơn đăng ký (DormitoryApplication), hệ thống sẽ TẠO MỘT LẦN DUY NHẤT 
 *    2 file PDF (Phiếu đăng ký & Bản cam kết). 
 * 2. 2 File PDF này là "Snapshot" (Bản ghi lịch sử) ghi nhận chính xác trạng thái, thông tin 
 *    của sinh viên ngay tại thời điểm ký nộp đơn. 
 * 3. Nếu sau này sinh viên Cập nhật thông tin cá nhân (Đổi CCCD, Đổi SĐT), hệ thống CHỈ CẬP NHẬT
 *    trong Database (bảng Student), TUYỆT ĐỐI KHÔNG TẠO LẠI (Re-generate) 2 file PDF cũ. 
 *    Nhằm đảm bảo tính pháp lý và không làm sai lệch hồ sơ gốc của năm học đó.
 * 
 * 4. Luồng Gia Hạn (Stay Extension): Sinh viên xin ở thêm ngắn hạn sẽ KHÔNG in lại 2 phiếu trên.
 *    Thay vào đó, hệ thống gọi hàm `generateAndUploadExtensionDecisionPdf` để in ra 
 *    "Quyết Định Gia Hạn" (File loại 3).
 * 5. Luồng Đăng ký năm học mới: Sinh viên bắt buộc phải nộp 1 Đơn Đăng Ký Mới (Application mới).
 *    Lúc đó, hệ thống sẽ sinh ra 1 cặp PDF mới toanh cho Application ID mới đó. 
 *    Dữ liệu cũ hoàn toàn không bị đụng tới.
 */
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

        // Find portrait photo
        String portraitPhotoUrl = null;
        if (application.getDocuments() != null) {
            portraitPhotoUrl = application.getDocuments().stream()
                    .filter(doc -> doc.getDocumentType() == com.sdms.backend.modules.application.enums.VerificationDocumentType.PORTRAIT_PHOTO)
                    .map(com.sdms.backend.modules.application.entity.VerificationDocument::getFileUrl)
                    .findFirst()
                    .orElse(null);
        }
        context.setVariable("portraitPhotoUrl", portraitPhotoUrl);

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

    public String[] generateExtensionPdfs(StayExtension extension) {
        com.sdms.backend.modules.student.entity.Student student = extension.getStudent();
        log.info("Generating Contract and Commitment for Extension: {}", student.getStudentCode());
        
        DormitoryApplication srcApp = student.getSourceApplication();
        DormitoryApplication virtualApp = new DormitoryApplication();
        virtualApp.setApplicationCode("EXT-" + student.getStudentCode());
        virtualApp.setFullName(student.getFullName());
        virtualApp.setStudentCode(student.getStudentCode());
        virtualApp.setDob(srcApp != null ? srcApp.getDob() : null);
        virtualApp.setGender(srcApp != null ? srcApp.getGender() : null);
        virtualApp.setIssueDate(srcApp != null ? srcApp.getIssueDate() : null);
        virtualApp.setIssuePlace(srcApp != null ? srcApp.getIssuePlace() : null);
        virtualApp.setPob(srcApp != null ? srcApp.getPob() : null);
        virtualApp.setEthnic(srcApp != null ? srcApp.getEthnic() : null);
        virtualApp.setReligion(srcApp != null ? srcApp.getReligion() : null);
        virtualApp.setCccd(student.getCccd());
        virtualApp.setFaculty(student.getFaculty());
        // virtualApp.setAcademicYear(student.getAcademicYear());
        virtualApp.setCohort(srcApp != null ? srcApp.getCohort() : null);
        virtualApp.setPermanentAddress(student.getPermanentAddress());
        virtualApp.setContactAddress(srcApp != null ? srcApp.getContactAddress() : null);
        virtualApp.setPhone(student.getPhone());
        virtualApp.setEmail(student.getEmail());
        virtualApp.setFatherName(student.getFatherName());
        virtualApp.setFatherYob(srcApp != null ? srcApp.getFatherYob() : null);
        virtualApp.setFatherJob(srcApp != null ? srcApp.getFatherJob() : null);
        virtualApp.setFatherPhone(student.getFatherPhone());
        virtualApp.setMotherName(student.getMotherName());
        virtualApp.setMotherYob(srcApp != null ? srcApp.getMotherYob() : null);
        virtualApp.setMotherJob(srcApp != null ? srcApp.getMotherJob() : null);
        virtualApp.setMotherPhone(student.getMotherPhone());
      //  virtualApp.setFamilyContact(srcApp != null ? srcApp.getFamilyContact() : null);
        
      //  if (extension.getOldExpectedCheckOutAt() != null) {
         // virtualApp.setCheckInDate(extension.getOldExpectedCheckOutAt().toLocalDate());
       // }
        virtualApp.setCreatedAt(extension.getCreatedAt());
      // virtualApp.setPriorities(srcApp != null ? srcApp.getPriorities() : java.util.Collections.emptyList());

        Context context = new Context();
        context.setVariable("app", virtualApp);
        context.setVariable("portraitPhotoUrl", student.getAvatarUrl());
        
        Set<String> priorityCategories = virtualApp.getPriorities() != null ?
                virtualApp.getPriorities().stream()
                        .map(ap -> ap.getPriorityCategory().name())
                        .collect(Collectors.toSet()) : Collections.emptySet();
        context.setVariable("priorities", priorityCategories);

        String htmlContract = templateEngine.process("pdf/registration_form", context);
        String contractFileName = "contract_ext_" + student.getStudentCode() + "_" + extension.getExtensionId();
        String contractUrl = generateAndUploadPdf(htmlContract, contractFileName);

        String htmlCommitment = templateEngine.process("pdf/commitment_form", context);
        String commitmentFileName = "commitment_ext_" + student.getStudentCode() + "_" + extension.getExtensionId();
        String commitmentUrl = generateAndUploadPdf(htmlCommitment, commitmentFileName);

        return new String[]{contractUrl, commitmentUrl};
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
