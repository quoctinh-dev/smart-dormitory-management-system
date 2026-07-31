package com.sdms.backend.modules.student.event;

import com.sdms.backend.common.exception.AppException;
import com.sdms.backend.common.exception.ErrorCode;
import com.sdms.backend.modules.application.entity.DormitoryApplication;
import com.sdms.backend.modules.application.entity.VerificationDocument;
import com.sdms.backend.modules.application.enums.VerificationDocumentType;
import com.sdms.backend.modules.application.repository.DormitoryApplicationRepository;
import com.sdms.backend.modules.payment.event.PaymentSuccessEvent;
import com.sdms.backend.modules.student.entity.Student;
import com.sdms.backend.modules.student.enums.StudentStatus;
import com.sdms.backend.modules.student.repository.StudentRepository;
import com.sdms.backend.modules.user.entity.UserAccount;
import com.sdms.backend.modules.user.enums.Role;
import com.sdms.backend.modules.user.enums.AccountStatus;
import com.sdms.backend.modules.user.repository.UserAccountRepository;
import com.sdms.backend.modules.room.event.CheckInCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class StudentProvisioningListener {

    private final DormitoryApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * Lắng nghe sự kiện thanh toán thành công (PaymentSuccessEvent).
     * Thực hiện cấp phát hồ sơ sinh viên và tài khoản người dùng tương ứng.
     * Sử dụng AFTER_COMMIT để đảm bảo tính nhất quán dữ liệu sau khi giao dịch thanh toán hoàn tất.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("[StudentProvisioningListener] Bắt đầu cấp phát hồ sơ cho đơn đăng ký: {}", event.getApplicationId());

        try {
            if (event.getApplicationId() == null) {
                log.info("[StudentProvisioningListener] PaymentSuccessEvent không có applicationId (có thể là hóa đơn gia hạn, hóa đơn điện nước). Bỏ qua cấp phát hồ sơ.");
                return;
            }

            // Kiểm tra tránh xử lý trùng lặp hồ sơ
            if (studentRepository.existsBySourceApplication_ApplicationId(event.getApplicationId())) {
                log.warn("[StudentProvisioningListener] Đơn đăng ký {} đã được xử lý. Bỏ qua cấp phát.", event.getApplicationId());
                return;
            }

            DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                    .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy đơn đăng ký gốc: " + event.getApplicationId()));

            // Khởi tạo hoặc cập nhật hồ sơ sinh viên
            Student student = studentRepository.findByStudentCode(application.getStudentCode()).orElse(new Student());
            boolean isNewStudent = (student.getStudentId() == null);

            student.setSourceApplication(application);
            student.setFullName(application.getFullName());
            student.setStudentCode(application.getStudentCode());
            student.setCccd(application.getCccd());
            student.setEmail(application.getEmail());
            student.setPhone(application.getPhone());
            student.setFaculty(application.getFaculty());
            student.setAcademicYear(application.getCohort());
            student.setContactAddress(application.getContactAddress());
            student.setPermanentAddress(application.getPermanentAddress());

            student.setFatherName(application.getFatherName());
            student.setFatherPhone(application.getFatherPhone());
            student.setMotherName(application.getMotherName());
            student.setMotherPhone(application.getMotherPhone());

            // Đồng bộ ảnh chân dung từ hồ sơ
            String portraitUrl = application.getDocuments().stream()
                    .filter(doc -> doc.getDocumentType() == VerificationDocumentType.PORTRAIT_PHOTO)
                    .map(VerificationDocument::getFileUrl)
                    .findFirst()
                    .orElse(student.getAvatarUrl() != null ? student.getAvatarUrl() : "");

            student.setAvatarUrl(portraitUrl);
            student.setFaceImageUrl(portraitUrl);
            student.setIsFaceRegistered(!portraitUrl.isEmpty());
            student.setStatus(StudentStatus.PENDING_CHECKIN);

            student = studentRepository.save(student);
            log.info("[StudentProvisioningListener] Lưu hồ sơ sinh viên thành công: {}", student.getStudentCode());

            // Cấp phát tài khoản đăng nhập cho sinh viên mới
            if (isNewStudent) {
                UserAccount account = new UserAccount();
                account.setStudent(student);
                account.setUsername(application.getStudentCode());
                account.setEmail(application.getEmail());
                account.setPassword(passwordEncoder.encode(application.getStudentCode()));
                account.setRole(Role.STUDENT);
                account.setStatus(AccountStatus.PENDING_ACTIVATION);
                
                userAccountRepository.save(account);
                log.info("[StudentProvisioningListener] Đã khởi tạo tài khoản cho sinh viên: {}", application.getStudentCode());
            }

            // Phát sự kiện để thực hiện liên kết sinh viên với phòng
            eventPublisher.publishEvent(new StudentCreatedEvent(this, student.getStudentId(), event.getAssignmentId()));

        } catch (Exception e) {
            log.error("[StudentProvisioningListener] Lỗi cấp phát hồ sơ cho đơn {}: {}", event.getApplicationId(), e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Lỗi hệ thống khi cấp phát hồ sơ sinh viên.");
        }
    }

    /**
     * Cập nhật trạng thái sinh viên thành ACTIVE sau khi hoàn tất thủ tục nhận phòng.
     */
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void handleCheckInCompleted(CheckInCompletedEvent event) {
        if (event.getStudentId() != null) {
            studentRepository.findById(event.getStudentId()).ifPresent(student -> {
                student.setStatus(StudentStatus.ACTIVE);
                studentRepository.save(student);
                log.info("[StudentProvisioningListener] Sinh viên {} đã nhận phòng, trạng thái cập nhật thành ACTIVE.", event.getStudentId());
            });
        }
    }
}