// 📄 Đường dẫn: src/main/java/com/sdms/backend/modules/student/event/StudentProvisioningListener.java
package com.sdms.backend.modules.student.event;

import com.sdms.backend.common.exception.AppException;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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
     * Lắng nghe sự kiện gạch nợ hóa đơn thành công (PaymentSuccessEvent).
     * Tiến hành sinh Hồ sơ cư dân Student và Tài khoản người dùng UserAccount ngầm.
     */
    @EventListener
    @Transactional
    public void handlePaymentSuccess(PaymentSuccessEvent event) {
        log.info("[StudentProvisioningListener] Khởi động luồng sinh hồ sơ tự động cho Đơn={}", event.getApplicationId());

        try {
            // 1. Kiểm tra xem hồ sơ cư dân sinh viên này đã được khởi tạo trước đó chưa (Tránh double click sinh trùng)
            boolean studentExists = studentRepository.existsBySourceApplication_ApplicationId(event.getApplicationId());
            if (studentExists) {
                log.warn("[StudentProvisioningListener] Hồ sơ sinh viên ứng với Đơn {} đã tồn tại. Hủy luồng cấp tài khoản.", event.getApplicationId());
                return;
            }

            // 2. Trích xuất thông tin Đơn đăng ký gốc
            DormitoryApplication application = applicationRepository.findById(event.getApplicationId())
                    .orElseThrow(() -> new AppException("Không tìm thấy đơn đăng ký gốc có ID: " + event.getApplicationId(), HttpStatus.NOT_FOUND));

            // 3. KHỞI TẠO HỒ SƠ SINH VIÊN (STUDENT RESIDENT PROFILE)
            Student student = new Student();
            student.setSourceApplication(application);
            student.setFullName(application.getFullName());
            student.setStudentCode("STU-" + application.getCccd()); // Tạo mã số sinh viên KTX tạm thời theo số CCCD
            student.setCccd(application.getCccd());
            student.setEmail(application.getEmail());
            student.setPhone(application.getPhone());
            student.setFaculty(application.getFaculty());
            student.setPermanentAddress(application.getPermanentAddress());

            // Sao chép chi tiết thông tin nhân thân để quầy lễ tân tra cứu
            student.setFatherName(application.getFatherName());
            student.setFatherPhone(application.getFatherPhone());
            student.setMotherName(application.getMotherName());
            student.setMotherPhone(application.getMotherPhone());
            student.setEmergencyContact(application.getEmergencyContact());

            // 🌟 ĐỒNG BỘ CHUẨN XÁC: Duyệt danh sách minh chứng tìm đúng file ảnh chân dung trên Cloudinary
            String portraitUrl = application.getDocuments().stream()
                    .filter(doc -> doc.getDocumentType() == VerificationDocumentType.PORTRAIT_PHOTO)
                    .map(VerificationDocument::getFileUrl)
                    .findFirst()
                    .orElse("");

            student.setAvatarUrl(portraitUrl); // Đổ link ảnh Cloudinary vào đây để hết bị dính NULL dưới DB!
            student.setFaceImageUrl(portraitUrl);
            student.setIsFaceRegistered(!portraitUrl.isEmpty());
            student.setStatus(StudentStatus.PENDING_CHECKIN); // Đặt trạng thái chờ nhận phòng tại lễ tân

            // Thực hiện lưu hồ sơ Student xuống DB
            student = studentRepository.save(student);
            log.info("[StudentProvisioningListener] Đã lưu thành công Resident Profile cho Sinh viên: {}", student.getFullName());

            // 4. KHỞI TẠO TÀI KHOẢN ĐĂNG NHẬP (USER ACCOUNT)
            UserAccount account = new UserAccount();
            account.setStudent(student);
            account.setUsername(application.getCccd()); // Tài khoản đăng nhập mặc định là số CCCD
            account.setEmail(application.getEmail());

            // 🌟 CHUẨN HÓA MẬT KHẨU TẠM THỜI: Chỉ băm chuỗi phẳng số CCCD (Loại bỏ chữ TEMP- cũ)
            // Đồng bộ 100% với form nhập liệu tại trang giao diện Frontend /activate-account
            String rawTempPassword = application.getCccd();
            account.setPassword(passwordEncoder.encode(rawTempPassword));

            account.setRole(Role.STUDENT);
            account.setStatus(AccountStatus.PENDING_ACTIVATION); // Chờ sinh viên kích hoạt đổi pass lần đầu

            userAccountRepository.save(account);
            log.info("[StudentProvisioningListener] Tài khoản UserAccount cho CCCD={} đã được tạo ở dạng PENDING_ACTIVATION.", application.getCccd());

            // 5. PHÁT SỰ KIỆN LIÊN KẾT PHÒNG (Kích nổ RoomStudentLinkListener để map giường)
            // Truyền đi thông tin ID Phân phòng (assignmentId) và ID sinh viên vừa tạo
            log.info("[StudentProvisioningListener] Kích nổ StudentCreatedEvent để thực hiện liên kết giường trống...");
            eventPublisher.publishEvent(new com.sdms.backend.modules.student.event.StudentCreatedEvent(
                    this,
                    student.getStudentId(),
                    event.getAssignmentId()
            ));

        } catch (Exception e) {
            log.error("[StudentProvisioningListener] Thất bại khi sinh hồ sơ/tài khoản tự động cho Đơn={}. Lý do: {}",
                    event.getApplicationId(), e.getMessage(), e);
            throw new AppException("Lỗi hệ thống ngầm khi sinh tài khoản cư dân tự động.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}