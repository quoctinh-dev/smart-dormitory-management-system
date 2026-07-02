# 🏛️ SMART DORMITORY MANAGEMENT SYSTEM (SDMS) - BACKEND CONSTITUTION
**Tài liệu Quy tắc Kỹ thuật Tối cao (PROJECT_RULE.md)**

## 1. PROJECT PHILOSOPHY

**[CURRENT]**
- **Purpose**: Định hướng phát triển hệ thống SDMS Backend thống nhất, bền vững và dễ bảo trì.
- **Rule**:
  - Backend hoạt động như một RESTful API Server độc lập.
  - Tuân thủ nguyên tắc Clean Code và SOLID.
  - Đặt tính bảo mật (Security) và toàn vẹn dữ liệu (Data Integrity) lên hàng đầu.
- **Why**: Giúp hệ thống dễ dàng scale, maintain và on-board developer/AI mới mà không phá vỡ cấu trúc hiện tại.
- **Good Example**: Phân chia logic rõ ràng giữa các module `student`, `room`, `smartaccess`.
- **Bad Example**: Trộn lẫn code xử lý phần cứng ESP32 vào chung với logic quản lý phòng cơ bản.
- **Best Practice**: Modular Monolith Architecture.
- **Current Project Analysis**: Dự án đang áp dụng Modular Monolith với các module riêng biệt trong package `modules`.
- **Recommendation**: Tiếp tục duy trì triết lý này, không biến thành Microservices khi chưa thực sự cần thiết để tránh overhead.

## 2. ARCHITECTURE RULES

**[CURRENT]**
- **Purpose**: Đảm bảo luồng phụ thuộc (Dependency Flow) một chiều và sự chia tách trách nhiệm (Separation of Concerns).
- **Rule**:
  - Áp dụng Feature-based Module Architecture kết hợp Layered Architecture bên trong mỗi module.
  - Dependency Direction: `Controller` -> `Service` -> `Repository`.
  - Không được có Circular Dependency (phụ thuộc vòng) giữa các Service (Ví dụ: `StudentService` gọi `RoomService` và ngược lại).
- **Why**: Giảm coupling, tăng cohesion, dễ dàng viết Unit Test.
- **Good Example**: `StudentController` gọi `StudentService`, `StudentService` gọi `StudentRepository`.
- **Bad Example**: `StudentRepository` gọi ngược lại `StudentService` hoặc Controller chứa logic tính toán.
- **Best Practice**: Nếu hai module cần giao tiếp, sử dụng `Event` (Spring ApplicationEvent) hoặc tạo một lớp Integration/Facade ở giữa.
- **Current Project Analysis**: Các module đang tách biệt tốt (application, auth, student, room...). Dependency một chiều.
- **Recommendation**: Nếu logic liên module phức tạp, hãy tạo `Event` để decouple hoàn toàn.

## 3. PACKAGE RULES

**[CURRENT]**
- **Purpose**: Tổ chức mã nguồn theo một chuẩn duy nhất, dễ tìm kiếm.
- **Rule**:
  - `com.sdms.backend.common`: Chứa Entity base, Exception base, Response struct.
  - `com.sdms.backend.config`: Chứa toàn bộ cấu hình Spring (Security, JWT, Cloudinary, Flyway...).
  - `com.sdms.backend.security`: Chứa các Filter, Handler liên quan đến Authentication và Authorization.
  - `com.sdms.backend.modules`: Chứa các Feature Module (student, room, payment, etc.). Mỗi module chứa `controller`, `service`, `repository`, `dto`, `entity`.
- **Why**: Đóng gói theo Feature (Package by Feature) giúp dev tập trung vào một nghiệp vụ tại một nơi thay vì nhảy qua lại giữa nhiều package kỹ thuật.
- **Good Example**: Tính năng Student nằm toàn bộ trong `modules/student`.
- **Bad Example**: Đặt tất cả Controller của mọi tính năng vào một package `controllers` duy nhất (Package by Layer).
- **Best Practice**: Package by Feature.
- **Current Project Analysis**: Hệ thống tuân thủ chặt chẽ Package by Feature bên trong thư mục `modules`.
- **Recommendation**: Không tạo thêm các package kỹ thuật ngang hàng với `modules`, ngoại trừ code thực sự dùng chung (shared/common).

## 4. MODULE RULES

**[CURRENT]**
- **Purpose**: Chuẩn hóa cấu trúc bên trong mỗi Feature Module.
- **Rule**:
  - Mỗi module bắt buộc phải có các sub-package: `controller`, `service`, `repository`, `entity`, `dto`.
  - DTO phải được chia thành `request` và `response`.
  - Nếu module có xử lý sự kiện thì thêm package `event` và `listener`.
- **Why**: Giữ cho nội bộ module gọn gàng, có tính dự đoán cao (predictable structure).
- **Good Example**: Thư mục `modules/student` có đủ `controller`, `service`, `repository`, `dto/request`, `dto/response`.
- **Bad Example**: Để chung Request DTO và Response DTO trong cùng một thư mục `dto` hỗn độn.
- **Best Practice**: Ranh giới module rõ ràng. Khuyến khích dùng interface cho Service (`StudentService` và `StudentServiceImpl`) nếu logic phức tạp.
- **Current Project Analysis**: Module `student` hiện dùng class `StudentService` trực tiếp thay vì interface.
- **Recommendation**: [RECOMMENDED] Nên cân nhắc áp dụng pattern Interface - Impl cho Service để dễ dàng mock và áp dụng Proxy (như Caching, Transactional) ở quy mô lớn hơn, tuy nhiên hiện tại class vẫn chấp nhận được nếu không quá phức tạp.

## 5. ENTITY RULES

**[CURRENT]**
- **Purpose**: Quản lý vòng đời và ánh xạ dữ liệu chuẩn xác với Database.
- **Rule**:
  - Bắt buộc kế thừa `BaseEntity` để tự động quản lý `createdAt`, `updatedAt` thông qua `@PrePersist` và `@PreUpdate`.
  - Khóa chính (PK) sử dụng kiểu `UUID` để bảo mật và an toàn trong phân tán dữ liệu.
  - Không sử dụng trực tiếp kiểu nguyên thủy (int, boolean) mà dùng Wrapper Class (Integer, Boolean) để cho phép giá trị null nếu cần.
  - Khai báo FetchType.LAZY cho mọi quan hệ (`@OneToMany`, `@ManyToOne`,...).
- **Why**: Tránh lỗi N+1 Query, tự động hóa audit fields, bảo mật khóa chính.
- **Good Example**: `Student` entity extend `BaseEntity`, khai báo `@ManyToOne(fetch = FetchType.LAZY)`.
- **Bad Example**: Khai báo `@Column(name="created_at")` lặp đi lặp lại trong mọi Entity. Sử dụng FetchType.EAGER.
- **Best Practice**: Soft delete bằng một cờ `isDeleted` hoặc `status` (ACTIVE/INACTIVE) thay vì xóa cứng (`DELETE`).
- **Current Project Analysis**: Đang sử dụng `BaseEntity` rất chuẩn. PK dùng UUID.
- **Recommendation**: Bổ sung cơ chế `@SoftDelete` hoặc custom Hibernate annotation nếu hệ thống yêu cầu không được mất dữ liệu lịch sử.

## 6. DTO RULES

**[CURRENT]**
- **Purpose**: Che giấu thông tin Entity và kiểm soát dữ liệu I/O của API.
- **Rule**:
  - KHÔNG BAO GIỜ trả về hoặc nhận trực tiếp Entity qua Controller. Bắt buộc dùng DTO.
  - Phân tách rõ `XXXRequest` (đầu vào) và `XXXResponse` (đầu ra).
- **Why**: Entity chứa các trường nhạy cảm (như mật khẩu, dữ liệu audit) và có các lazy properties. Trả về Entity sẽ gây lỗi `LazyInitializationException` và lộ dữ liệu.
- **Good Example**: Nhận `UpdateProfileRequest`, trả về `StudentProfileResponse`.
- **Bad Example**: `public Student getStudent(...)`
- **Best Practice**: Immutability cho Response DTO (sử dụng `@Builder`, `@Value` hoặc `record`).
- **Current Project Analysis**: Đã phân tách `request` và `response`. DTO được sử dụng đúng cách trong các Controller.
- **Recommendation**: Khuyến khích sử dụng Java 14+ `record` cho các DTO không cần thay đổi dữ liệu để tối ưu bộ nhớ và ngắn gọn hơn.

## 7. MAPPER RULES

**[CURRENT]**
- **Purpose**: Chuyển đổi dữ liệu an toàn giữa DTO và Entity.
- **Rule**:
  - DTO tự cung cấp phương thức static `fromEntity(Entity e)` hoặc sử dụng Mapper class riêng.
  - Controller KHÔNG chứa logic map. Repository KHÔNG trả về DTO trực tiếp (ngoại trừ dùng Projection).
  - Ánh xạ diễn ra tại Service layer.
- **Why**: Tách biệt trách nhiệm. Controller chỉ lo HTTP HTTP routing, Service lo logic.
- **Good Example**: `StudentProfileResponse.fromEntity(student)` được gọi trong `StudentService`.
- **Bad Example**: Controller gọi `new StudentProfileResponse(student.getName(), ...)`
- **Best Practice**: Sử dụng MapStruct cho các dự án phức tạp để tự động sinh code map.
- **Current Project Analysis**: Đang sử dụng static method `fromEntity` thủ công (`StudentProfileResponse.java`).
- **Recommendation**: [RECOMMENDED] Nếu Entity có quá nhiều trường (như Student có tới 15-20 trường), việc viết map thủ công dễ gây lỗi sót trường. Nên tích hợp thư viện `MapStruct` để tự động hóa và an toàn kiểu dữ liệu lúc compile.

## 8. REPOSITORY RULES

**[CURRENT]**
- **Purpose**: Tương tác với CSDL.
- **Rule**:
  - Chỉ chứa logic truy xuất dữ liệu (CRUD, JPQL, Native Query).
  - TUYỆT ĐỐI không chứa Business Logic.
  - Sử dụng `@EntityGraph` khi cần fetch join để tránh N+1 thay vì dùng EAGER.
- **Why**: Tránh phình to Repository, tối ưu hóa truy vấn.
- **Good Example**: `findByStudentCode(String code)` hoặc `@Query("SELECT s FROM Student s WHERE ...")`
- **Bad Example**: Viết logic kiểm tra quyền (Authorization) ngay bên trong câu query.
- **Best Practice**: Sử dụng Spring Data JPA Specifications cho các tính năng lọc (Filter) động.
- **Current Project Analysis**: Tuân thủ Spring Data JPA.
- **Recommendation**: Đảm bảo đánh Index cho các trường thường xuyên query (như email, studentCode, cccd).

## 9. SERVICE RULES

**[CURRENT]**
- **Purpose**: Xử lý nghiệp vụ lõi (Business Logic).
- **Rule**:
  - Đánh dấu `@Transactional` ở các method thay đổi dữ liệu (CUD) và ở mức class với readOnly=true (nếu đa số là read).
  - Không bao giờ trả về Entity cho Controller (đã thực hiện map sang DTO tại đây).
  - Là nơi duy nhất được quyền gọi các external service (payment, mail).
- **Why**: Đảm bảo tính nguyên tử (Atomicity) của giao dịch.
- **Good Example**: `StudentService.updateMyProfile` có annotation `@Transactional` và trả về `StudentProfileResponse`.
- **Bad Example**: Trộn lẫn xử lý HTTP Request (như `HttpServletRequest`) bên trong Service.
- **Best Practice**: Service nên "ignorant" (không biết gì) về Web Layer (không imports các class từ `javax.servlet` hoặc `org.springframework.http`).
- **Current Project Analysis**: `StudentService` có truyền HttpStatus vào `AppException`. Điều này là tạm chấp nhận được nhưng làm Service hơi bị coupling với Web.
- **Recommendation**: [RECOMMENDED] Định nghĩa các ErrorCode chung thay vì truyền `HttpStatus` trực tiếp vào exception trong Service. Controller/GlobalExceptionHandler sẽ tự ánh xạ ErrorCode ra HttpStatus.

## 10. CONTROLLER RULES

**[CURRENT]**
- **Purpose**: Giao tiếp với Client qua REST.
- **Rule**:
  - Chỉ làm nhiệm vụ: Nhận Request -> Validate -> Gọi Service -> Đóng gói Response.
  - KHÔNG Business Logic. KHÔNG gọi Repository. KHÔNG có `@Transactional`.
- **Why**: Giữ Controller mỏng (Thin Controller).
- **Good Example**: `StudentController` chỉ có vài dòng code, uỷ quyền hết cho `studentService`.
- **Bad Example**: Sử dụng `studentRepository.save()` ngay trong Controller.
- **Best Practice**: Sử dụng `@RestController`, ánh xạ URL theo chuẩn RESTful (danh từ số nhiều: `/api/v1/students`).
- **Current Project Analysis**: Controller thực hiện rất tốt, code ngắn gọn, annotation đầy đủ.
- **Recommendation**: Duy trì Thin Controller.

## 11. API CONTRACT RULES

**[CURRENT]**
- **Purpose**: Đảm bảo Frontend nhận được một cấu trúc JSON đồng nhất 100%.
- **Rule**:
  - Mọi API phải bọc trong `ApiResponse<T>` chứa `success`, `message`, `data`, `errorCode`.
  - Phân trang phải dùng `PageResponse<T>`.
  - Lỗi phải trả về cấu trúc có `success: false` và `errorCode`.
  - KHÔNG bao giờ trả về trực tiếp String, Boolean, hay Entity thô.
- **Why**: Frontend chỉ cần viết một Interceptor duy nhất để parse và xử lý kết quả/lỗi.
- **Good Example**: `return ResponseEntity.ok(new ApiResponse<>(true, "Success", data));`
- **Bad Example**: `return ResponseEntity.ok(data);`
- **Best Practice**: Thống nhất dùng tiếng Anh cho các thông điệp hệ thống (message), frontend sẽ tự i18n dựa trên `errorCode`.
- **Current Project Analysis**: `ApiResponse` đang được sử dụng đồng bộ.
- **Recommendation**: Cần tuân thủ tuyệt đối cho các module sắp viết thêm (đặc biệt là AI, MQTT integration).

## 12. FRONTEND INTEGRATION RULES

**[RECOMMENDED]**
- **Purpose**: Tránh đứt gãy giao tiếp giữa 2 team Backend và Frontend (React/Vue).
- **Rule**:
  - Bất kỳ thay đổi nào ở DTO (`Request` hoặc `Response`) hoặc `ApiResponse` đều phải báo trước.
  - Frontend axiosClient dựa trên contract: `response.data.data` (do Spring bọc ApiResponse).
  - Pagination param: `page`, `size`, `sort`. Trả về `totalElements`, `totalPages`.
- **Why**: Hạn chế lỗi "Cannot read properties of undefined" ở Frontend.
- **Good Example**: Thêm trường `isOnline` vào Response DTO và update swagger doc.
- **Bad Example**: Xoá hoặc đổi tên trường `studentCode` thành `code` mà không báo cáo.
- **Best Practice**: Sử dụng OpenAPI (Swagger) để generate Type/Interface cho Frontend tự động.
- **Current Project Analysis**: SpringDoc OpenAPI đã được cấu hình trong `pom.xml`.
- **Recommendation**: Dev/AI cập nhật API phải đồng thời cập nhật Swagger description (`@Operation`, `@Schema`).

## 13. SECURITY RULES

**[CURRENT]**
- **Purpose**: Bảo vệ hệ thống khỏi truy cập trái phép.
- **Rule**:
  - Stateless Authentication bằng JWT (Access Token & Refresh Token).
  - Filter `JwtAuthenticationFilter` chạy trước mọi request để thiết lập `SecurityContext`.
  - Các API thay đổi trạng thái (POST, PUT, DELETE, PATCH) đều phải yêu cầu Auth (ngoại trừ public API như login, register).
  - CORS phải được cấu hình để chỉ cho phép frontend domain.
- **Why**: Đảm bảo an toàn, phòng chống CSRF (vì dùng header Authorization Bearer thay vì Cookie).
- **Good Example**: `JwtAuthenticationFilter` trích xuất token, validate và set `SecurityContextHolder`.
- **Bad Example**: Tắt CSRF nhưng lại lưu token vào Cookie mà không có SameSite flag.
- **Best Practice**: Token hết hạn nhanh (15p) + Refresh Token lưu tại DB có thời hạn dài (7 ngày).
- **Current Project Analysis**: Hệ thống đã có `JwtAuthenticationFilter`, cấu hình thời gian hết hạn qua `application.yml` (900000ms = 15m).
- **Recommendation**: Chú ý bảo mật `Refresh Token`, cần cơ chế revoke (hủy) khi user đăng xuất hoặc đổi mật khẩu.

## 14. AUTHORIZATION RULES

**[CURRENT]**
- **Purpose**: Kiểm soát quyền truy cập chi tiết.
- **Rule**:
  - Sử dụng Method Security (`@PreAuthorize("hasRole('ADMIN')")`).
  - Phân quyền theo Role (ADMIN, STUDENT) hoặc Permission (nếu mở rộng).
- **Why**: Method Security an toàn hơn URL-based security vì nó bảo vệ ở mức logic hàm, dù API endpoint có bị thay đổi.
- **Good Example**: `@PreAuthorize("hasRole('STUDENT')")` trên hàm `getMyProfile()`.
- **Bad Example**: Hardcode logic check role bên trong Service `if(user.getRole().equals("ADMIN"))`.
- **Best Practice**: Tách biệt các Controller theo Role (VD: `CheckoutRequestAdminController` và `CheckoutRequestController`).
- **Current Project Analysis**: Đã tách biệt API Admin và User (ví dụ thư mục controller có `CheckoutRequestAdminController.java`).
- **Recommendation**: Tiếp tục mô hình này. Rất dễ review code và chặn quyền.

## 15. OWNERSHIP RULES (QUY TẮC SỞ HỮU DỮ LIỆU)

**[CURRENT]**
- **Purpose**: Chống IDOR (Insecure Direct Object Reference).
- **Rule**:
  - Student CHỈ ĐƯỢC thao tác dữ liệu của chính mình.
  - TRONG REQUEST, KHÔNG BAO GIỜ truyền `userId`, `studentId`, `accountId` từ Frontend.
  - Backend PHẢI TỰ LẤY ID từ JWT thông qua `SecurityContextHolder.getContext().getAuthentication().getPrincipal()`.
- **Why**: Nếu Frontend truyền `studentId=1`, một user xấu có thể đổi thành `studentId=2` để sửa dữ liệu của người khác. Lấy từ JWT là tuyệt đối an toàn vì JWT đã được ký.
- **Good Example**: Trong `StudentService.updateMyProfile`, ID được lấy từ `account.getStudent()`.
- **Bad Example**: `PUT /api/students/{id}` cho phép update nếu truyền đúng ID.
- **Best Practice**: IDOR check là yêu cầu bắt buộc cho mọi API cá nhân.
- **Current Project Analysis**: Module Student đang làm chuẩn Ownership Rules.
- **Recommendation**: Bắt buộc áp dụng nguyên tắc này cho tất cả các module có tính cá nhân (như payment, room registration, extension).

## 16. VALIDATION RULES

**[CURRENT]**
- **Purpose**: Chặn dữ liệu rác ngay từ cửa ngõ hệ thống.
- **Rule**:
  - Sử dụng Bean Validation (`@Valid`, `@NotNull`, `@NotBlank`, `@Size`, v.v.) trực tiếp trên các DTO.
  - Có thể kết hợp Custom Validator (như `@ValidPhone`, `@ValidCccd`) nếu logic phức tạp.
  - KHÔNG viết `if (request.getEmail() == null)` trong Controller hay Service để validate định dạng.
- **Why**: Code sạch, tránh lặp lại logic if-else, lỗi được `GlobalExceptionHandler` gom chung thành một list trả về Frontend.
- **Good Example**: `@NotBlank(message="Email is required") private String email;` trong Request DTO.
- **Bad Example**: Validation logic dài hàng chục dòng bên trong Controller method.
- **Best Practice**: Validation chỉ check định dạng và rule cơ bản (tồn tại null, độ dài). Kiểm tra nghiệp vụ (VD: email đã tồn tại trong DB chưa) phải nằm ở Service.
- **Current Project Analysis**: Đã có dependency `spring-boot-starter-validation`.
- **Recommendation**: Viết các Custom Annotation cho các mẫu format đặc thù của Việt Nam (SĐT Việt Nam, CCCD 12 số).

## 17. EXCEPTION RULES

**[CURRENT]**
- **Purpose**: Chuẩn hóa mã lỗi trả về.
- **Rule**:
  - Ném `AppException` (hoặc `BusinessException`) thay vì `RuntimeException` chung chung.
  - Gom toàn bộ định nghĩa mã lỗi vào enum `ErrorCode`.
  - Mọi ngoại lệ được `GlobalExceptionHandler` xử lý.
- **Why**: Frontend dựa vào `ErrorCode` để hiển thị popup tiếng Việt/tiếng Anh thay vì hiện thông báo lỗi thô từ DB.
- **Good Example**: `throw new AppException("Student not found", HttpStatus.NOT_FOUND);`
- **Bad Example**: `throw new Exception("Error");` hoặc ném NullPointerException.
- **Best Practice**: Không try-catch tùy tiện trong Service rồi nuốt lỗi (swallow exception). Hãy để lỗi throw lên cho Advice xử lý.
- **Current Project Analysis**: `GlobalExceptionHandler` đang bắt `AppException`, `MethodArgumentNotValidException`, `DataIntegrityViolationException`, JWT. Rất đầy đủ.
- **Recommendation**: Nên bổ sung mã `ErrorCode` đầy đủ vào enum thay vì truyền string message cứng, giúp Frontend handle dễ hơn.

## 18. TRANSACTION RULES

**[CURRENT]**
- **Purpose**: Đảm bảo tính toàn vẹn dữ liệu (ACID).
- **Rule**:
  - Mọi API tạo mới/cập nhật dữ liệu nhiều bảng bắt buộc dùng `@Transactional`.
  - Ưu tiên `@Transactional(readOnly = true)` trên đầu class Service, và ghi đè `@Transactional` trên các method write.
- **Why**: `readOnly=true` giúp tối ưu hiệu năng của Hibernate (không tạo snapshot, không flush).
- **Good Example**: `@Transactional` áp dụng chuẩn trong `StudentService.updateMyProfile`.
- **Bad Example**: Để `@Transactional` ở Controller.
- **Best Practice**: Cẩn thận với lời gọi hàm nội bộ (self-invocation) trong cùng một class Service vì nó sẽ bỏ qua proxy của Spring và `@Transactional` sẽ không có tác dụng.
- **Current Project Analysis**: Đã sử dụng transaction tốt. Xử lý khóa Optimistic Locking (dành cho module room/giường) đã được cấu hình trong `GlobalExceptionHandler` (`ObjectOptimisticLockingFailureException`).
- **Recommendation**: Đảm bảo các Entity như Room, Bed có `@Version` để Optimistic Locking thực sự hoạt động, tránh tình trạng 2 sinh viên cùng chọn 1 giường cùng 1 millisecond.

## 19. EVENT RULES

**[RECOMMENDED]**
- **Purpose**: Decoupling (giảm sự phụ thuộc) giữa các tính năng.
- **Rule**:
  - Sử dụng `ApplicationEventPublisher` cho các tác vụ phụ (VD: Gửi email, đẩy thông báo) sau khi một thao tác chính hoàn tất.
  - Sử dụng `@Async` và `@EventListener`.
- **Why**: Service chính (VD: đăng ký phòng) không phải chờ service gửi mail chạy xong mới trả kết quả cho người dùng.
- **Good Example**: `publisher.publishEvent(new StudentRegisteredEvent(student));`
- **Bad Example**: Gọi `emailService.sendEmail()` trực tiếp trong `registerRoom()`, nếu SMTP server chậm, API đăng ký phòng sẽ timeout.
- **Best Practice**: Đảm bảo Transaction hoàn tất (commit) rồi mới kích hoạt sự kiện bằng `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`.
- **Current Project Analysis**: Dự án có package `event` và `listener` trong module.
- **Recommendation**: Áp dụng triệt để cho tính năng Notification và Brevo Email Integration.

## 20. DATABASE RULES

**[CURRENT]**
- **Purpose**: Quản trị Schema chặt chẽ.
- **Rule**:
  - Sử dụng PostgreSQL.
  - MỌI THAY ĐỔI SCHEMA (tạo bảng, thêm cột, tạo index) BẮT BUỘC thực hiện qua Flyway migration script (`V1__Init.sql`, `V2__Add_Column.sql`...).
  - Không dựa vào `hibernate.ddl-auto=update` trên môi trường PROD (hiện tại file yml đang set `validate`).
  - Khóa ngoại (FK) phải được khai báo rõ ràng, dùng Index cho các cột hay được lọc.
- **Why**: Đảm bảo Schema giống hệt nhau trên máy Dev, Test và Prod. Dễ dàng rollback nếu cần.
- **Good Example**: Tạo file `V1__init_schema.sql` trong `resources/db/migration`.
- **Bad Example**: Sửa Entity và ép Spring Boot tự tạo bảng. Xóa file Flyway cũ.
- **Best Practice**: Tên file Flyway phải rõ ràng, tránh conflict version giữa các developer.
- **Current Project Analysis**: Flyway đã được cấu hình (`spring.flyway.enabled=true`). ddl-auto là `validate`. Rất chuẩn Enterprise.
- **Recommendation**: Tuân thủ viết SQL nguyên thủy chuẩn Postgres trong thư mục migration.

## 21. INTEGRATION RULES

**[RECOMMENDED]**
- **Purpose**: Giao tiếp ổn định với các dịch vụ bên thứ ba (3rd party).
- **Rule**:
  - Dịch vụ Email (Brevo), Thanh toán (VNPAY/Momo), Cloudinary (Upload ảnh) phải được đặt trong package `integration` hoặc service biệt lập.
  - Phải có cơ chế Timeout và Retry (nếu cần thiết).
  - Webhook từ cổng thanh toán phải có xác thực Signature để chống giả mạo.
- **Why**: 3rd party API có thể chết hoặc phản hồi chậm. Không được để chúng làm sập toàn bộ hệ thống.
- **Good Example**: Upload ảnh Cloudinary chạy trong Thread riêng hoặc set timeout 5 giây.
- **Bad Example**: Chặn luồng chính vô thời hạn chờ phản hồi từ MQTT broker.
- **Best Practice**: Sử dụng Circuit Breaker pattern nếu hệ thống tích hợp gọi quá nhiều dịch vụ ngoại vi.
- **Current Project Analysis**: Đã cấu hình RestTemplate, Cloudinary, Brevo.
- **Recommendation**: Đối với MQTT và AI, hãy tách bạch logic xử lý, luôn catch exception khi gọi API ngoại vi.

## 22. NOTIFICATION RULES

**[RECOMMENDED]**
- **Purpose**: Thiết kế luồng thông báo chuẩn xác.
- **Rule**:
  - Thông báo được quản lý theo Notification Ownership: Sinh viên chỉ lấy thông báo của mình.
  - Hỗ trợ các tính năng: Unread count, Mark as Read, Mark All as Read.
  - Có loại Broadcast (Gửi cho toàn bộ KTX) và Direct (Gửi đích danh 1 sinh viên).
  - Tuyệt đối không truyền `userId` từ client khi lấy thông báo, lấy qua JWT.
- **Why**: Đảm bảo tính real-time (nếu có WebSockets) hoặc polling chuẩn, không rò rỉ dữ liệu thông báo của người khác.
- **Current Project Analysis**: Package `notification` đã được lên khung.
- **Recommendation**: Áp dụng Event Listener để tự động tạo record Notification khi có sự kiện (như hóa đơn mới, thanh toán thành công, phòng được duyệt).

## 23. SMART ACCESS RULES

**[RECOMMENDED]**
- **Purpose**: Tương tác với phần cứng (ESP32) và AI (Face Recognition).
- **Rule**:
  - Giao tiếp với ESP32 thông qua MQTT. Backend đóng vai trò MQTT Client (Pub/Sub).
  - Tách bạch luồng AI (Xử lý Python/Model) ra khỏi Spring Boot bằng cách gọi qua REST API hoặc gRPC, Spring Boot không tự nhận diện khuôn mặt.
  - Luôn lưu Access History (Lịch sử ra vào) cho mục đích audit và an ninh.
- **Why**: Spring Boot sinh ra để làm Web/API, không tối ưu cho chạy Deep Learning hay xử lý tín hiệu phần cứng trực tiếp.
- **Current Project Analysis**: Module `smartaccess` và `face` đã có trong cấu trúc.
- **Recommendation**: AI Service (chạy Python/FastAPI) sẽ bóc tách feature khuôn mặt, và Spring Boot sử dụng Hibernate Vector (đã import trong `pom.xml`) để lưu trữ và so sánh vector nếu cần, hoặc ủy quyền toàn bộ nhận diện cho Python. Cấu trúc hiện tại có `hibernate-vector`, cho thấy dự định lưu vector tại PostgreSQL (PgVector) - Đây là một quyết định kiến trúc rất xuất sắc.

## 24. LOGGING RULES

**[CURRENT]**
- **Purpose**: Truy vết lỗi an toàn.
- **Rule**:
  - Sử dụng SLF4J (Lombok `@Slf4j`).
  - Phân chia level rõ ràng: ERROR (lỗi throw exception), WARN (lỗi nghiệp vụ, bad request), INFO (khởi động, logic chính).
  - TUYỆT ĐỐI KHÔNG log: Mật khẩu, JWT token thô, OTP, dữ liệu PII nhạy cảm, Face Embedding.
- **Why**: Đảm bảo tuân thủ tiêu chuẩn bảo mật và giảm dung lượng file log.
- **Good Example**: `log.warn("Validation Error: {}", errors);`
- **Bad Example**: `log.info("User logged in with token: " + jwtToken);`
- **Best Practice**: Sử dụng MDC (Mapped Diagnostic Context) để gắn `requestId` hoặc `userId` vào mỗi log line giúp trace luồng dễ dàng trong môi trường concurrent.
- **Current Project Analysis**: Dự án có cấu hình `logback-spring.xml` và `logs` folder. File `GlobalExceptionHandler` có log đầy đủ.
- **Recommendation**: Duy trì việc che giấu thông tin nhạy cảm.

## 25. TESTING RULES

**[RECOMMENDED]**
- **Purpose**: Đảm bảo chất lượng trước khi deploy.
- **Rule**:
  - Unit Test cho Service Layer (Dùng Mockito để mock Repository).
  - Integration Test cho Repository (Dùng Testcontainers với PostgreSQL thực tế để kiểm tra query).
  - API Controller có thể test bằng `@WebMvcTest`.
- **Why**: Ngăn chặn Regression bugs (sửa lỗi này sinh lỗi khác).
- **Good Example**: Test `updateMyProfile` bằng cách mock `SecurityContext` và `StudentRepository`.
- **Bad Example**: Test service nhưng lại khởi động toàn bộ Spring Context (gây chậm) mà không dùng `@SpringBootTest` đúng cách.
- **Best Practice**: Đảm bảo coverage trên 70% đối với các Core Business Logic (Thanh toán, Đăng ký phòng).
- **Current Project Analysis**: Khai báo thư viện `spring-boot-starter-test`, `testcontainers` đầy đủ trong pom.xml.
- **Recommendation**: Developer/AI khi tạo module mới bắt buộc phải đi kèm Test case cho Service.

## 26. AI CODING RULES

**[MANDATORY FOR AI AGENT]**
- **Purpose**: Quy định rõ giới hạn cho AI Assistant/Agent thao tác trên codebase.
- **Rule**:
  - **AI BẮT BUỘC ĐỌC** tài liệu `PROJECT_RULE.md` này trước khi tạo hay sửa bất kỳ file nào.
  - TUYỆT ĐỐI KHÔNG thay đổi các class lõi như `BaseEntity`, `ApiResponse`, `GlobalExceptionHandler`, cấu hình Security nếu không có lệnh TƯỜNG MINH từ con người.
  - Nếu sửa Database, AI KHÔNG ĐƯỢC dùng cách gen Entity thẳng mà PHẢI tuân thủ tạo file Flyway migration.
  - DTO không được tự tiện đổi tên thuộc tính vì sẽ làm sập giao thức (contract) với Frontend.
  - Giữ vững cấu trúc Package by Feature (tạo tính năng mới thì tạo folder mới trong `modules`, cung cấp đủ controller, service, repo, dto, entity).
- **Why**: AI thường có xu hướng áp dụng template chuẩn chung (generic templates) mà phá vỡ rule cục bộ của dự án. File này là "Hiến pháp" giúp AI không đi chệch hướng.
- **Constraint**: Nếu phát hiện rule nào chưa rõ ràng, AI phải ĐẶT CÂU HỎI cho user thay vì tự ý giả định (assume).

---
*Tài liệu được thiết kế và sinh tự động từ phân tích mã nguồn thực tế của SDMS Backend.*
