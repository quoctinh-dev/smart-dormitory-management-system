# SDMS PAYMENT-01: BÁO CÁO KIỂM TOÁN KIẾN TRÚC TOÀN DIỆN (FINAL ARCHITECTURE AUDIT)

**Vai trò kiểm toán**: Senior Java Architect | PostgreSQL Architect | Domain Driven Design Architect | SDMS Technical Governance Board

---

## BỐI CẢNH & KHÁI QUÁT CHUNG
Hệ thống KTX thông minh (SDMS) đã đóng băng **ROOM MODULE** tại mốc ROOM-05. Module `payment` được sao chép trực tiếp từ dự án STU cũ sang SDMS hiện tại chứa các xung đột nghiêm trọng về mặt biên dịch (compilation error), kiểu dữ liệu (data types mismatch), đồng bộ bất đồng bộ (concurrency), và đặc biệt là sai lệch nghiêm trọng về luồng nghiệp vụ KTX thực tế. 

Dưới đây là kết quả đánh giá chi tiết tính tương thích của module Payment STU so với SDMS.

---

## PHẦN 1 - DOMAIN AUDIT (KIỂM TOÁN MIỀN DỮ LIỆU)

### 1. Lỗi package và imports hệ thống
Toàn bộ 16 file thuộc module Payment sao chép từ STU đều khai báo package bắt đầu bằng `package com.stu.dormitory...` và import các cấu trúc dùng chung của STU như `BaseEntity`, `AppException`, `ApiResponse` từ package `com.stu.dormitory...`. 
* **Đánh giá**: **FAIL**. Hệ thống SDMS chạy trên package root là `com.sdms.backend`. Dự án sẽ bị lỗi biên dịch ngay lập tức nếu không sửa lại toàn bộ package và imports.

### 2. Chi tiết đánh giá các thành phần
* **[Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java)**:
  * **Đánh giá**: **FAIL**.
  * **Lý do**:
    1. Lớp này kế thừa `BaseEntity`, tuy nhiên [BaseEntity.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/common/entity/BaseEntity.java) của SDMS chỉ chứa các trường audit (`createdAt`, `updatedAt`) và không có trường `@Id`. Trong khi đó, `Bill.java` không hề khai báo trường `@Id` nào trong thân lớp. Điều này khiến thực thể JPA này không thể hoạt động.
    2. Liên kết `assignment` dạng `@ManyToOne` trỏ sang [StudentHousingAssignment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/entity/StudentHousingAssignment.java) có khóa ngoại JPA kiểu Object, nhưng kiểu khóa gốc của `StudentHousingAssignment` trong SDMS là `UUID` (trong khi ở STU là `Long`).
* **[Payment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Payment.java)**:
  * **Đánh giá**: **FAIL**.
  * **Lý do**: Kế thừa `BaseEntity` nhưng không khai báo trường khóa chính `@Id` nào, dẫn đến thực thể không hợp lệ trong JPA Hibernate.
* **[BillResponse.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/response/BillResponse.java)**:
  * **Đánh giá**: **FAIL**.
  * **Lý do**: Trường `assignmentId` được định nghĩa kiểu `Long`, không khớp với kiểu `UUID` của `StudentHousingAssignment` trong hệ thống mới.
* **Các Enum**:
  * [BillStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillStatus.java), [BillType.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillType.java), [PaymentMethod.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentMethod.java), [PaymentStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentStatus.java)
  * **Đánh giá**: **PASS (Chức năng)** | **WARNING (Biên dịch)**. Các giá trị định danh là hợp lý, tuy nhiên package cần được refactor sang `com.sdms.backend`.
* **Các Repository**:
  * [BillRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/repository/BillRepository.java), [PaymentRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/repository/PaymentRepository.java)
  * **Đánh giá**: **FAIL**. Định nghĩa kiểu dữ liệu khóa chính kế thừa từ `JpaRepository<Entity, Long>` không tương thích nếu ID của Bill/Payment được thay đổi thành `UUID` để đồng bộ kiến trúc với SDMS.

---

## PHẦN 2 - ROOM MODULE COMPATIBILITY AUDIT (KIỂM TOÁN TƯƠNG THÍCH MẠNG LƯỚI PHÒNG)

Module Room trong SDMS đã được đóng băng. Việc Payment can thiệp thô bạo vào dữ liệu của Room/Bed/Assignment là một sự vi phạm nghiêm trọng.

1. **Có logic release Bed không?**
   * **CÓ (Vi phạm)**. Trong [PaymentExpirationService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentExpirationService.java), phương thức `releaseAssignmentAndBed` tự động gán `bed.setStatus(BedStatus.AVAILABLE)` rồi gọi `bedRepository.save(bed)`.
   * **Xung đột**: Bypasses cơ chế đóng gói bảo vệ của [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java) (thiếu khóa bi quan Room/Bed và dễ sinh lỗi bất đồng bộ).
2. **Có logic release Room không?**
   * **CÓ (Vi phạm nghiêm trọng)**. Lớp `PaymentExpirationService.java` tự động trừ số lượng giường đang chiếm dụng: `room.setOccupiedBeds(Math.max(room.getOccupiedBeds() - 1, 0))` và tự cập nhật trạng thái phòng thành `AVAILABLE`.
   * **Xung đột**: Bỏ qua nghiệp vụ tự phục hồi dữ liệu và kiểm tra trạng thái đặc biệt như `MAINTENANCE` (bảo trì) hoặc `CLOSED` (đã đóng) vốn đã được bảo vệ nghiêm ngặt tại phương thức `recalculateRoomStatus` thuộc `HousingAssignmentService`.
3. **Có logic expire Assignment không?**
   * **CÓ (Xung đột trạng thái)**. `PaymentExpirationService.java` tự cập nhật trạng thái `StudentHousingAssignment` thành `CANCELLED`.
   * **Xung đột**: Trong SDMS mới, cơ chế hết hạn đã được chuyển giao cho [PaymentExpireJob.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/scheduler/PaymentExpireJob.java) và phương thức `HousingAssignmentService.expirePaymentReservation` chạy trên `DormitoryApplication` (với lock bi quan và chuyển trạng thái đơn sang `EXPIRED`). Payment cũ không hề cập nhật trạng thái của `DormitoryApplication`, khiến hồ sơ bị kẹt ở trạng thái `WAITING_PAYMENT` mãi mãi.
4. **Có logic Waiting List Promotion không?**
   * **CÓ (Gây lỗi biên dịch)**. `PaymentExpirationService.java` cố gắng gọi `housingAssignmentService.promoteWaitingList()` sau khi giải phóng giường.
   * **Xung đột**: [HousingAssignmentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/service/HousingAssignmentService.java) của SDMS không có hàm `promoteWaitingList()` không tham số mà thay vào đó sử dụng `promoteFromWaitingList(UUID applicationId)` chạy biệt lập theo từng hồ sơ. Việc thăng hạng này được điều phối độc lập bởi [WaitingListPromotionJob.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/scheduler/WaitingListPromotionJob.java).
5. **Có Scheduler riêng không?**
   * **CÓ (Redundant & Conflict)**. `PaymentExpirationService.java` định nghĩa `@Scheduled(cron = "0 0 * * * *")` chạy mỗi giờ để quét hóa đơn quá hạn.
   * **Xung đột**: SDMS mới đã cấu hình ShedLock tập trung tại [HousingJobScheduler.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/room/scheduler/HousingJobScheduler.java) chạy job `PaymentExpireJob` mỗi 5 phút để bảo vệ hệ thống phân tán, chống chạy trùng lặp.
6. **Có xử lý trạng thái Application trái với Room Module không?**
   * **CÓ**. Module payment cũ hoàn toàn ngó lơ thực thể [DormitoryApplication.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplication.java). Khi thanh toán thành công hoặc quá hạn, trạng thái của đơn đăng ký không hề được cập nhật đồng bộ, phá vỡ flow trạng thái của hệ thống.

---

## PHẦN 3 - DATABASE AUDIT (KIỂM TOÁN CƠ SỞ DỮ LIỆU)

### 1. Phân tích cấu trúc & Chuẩn hóa
* Mối quan hệ giữa `Bill` -> `StudentHousingAssignment` -> `DormitoryApplication` -> `Student` được tổ chức hợp lý về mặt ERD lý thuyết (Chuẩn hóa tốt, không có cột dư thừa trực tiếp).
* Tuy nhiên, có sự không nhất quán cực lớn giữa các kiểu dữ liệu khóa chính:
  * ID của `StudentHousingAssignment` là `UUID`.
  * ID của `Bill` và `Payment` lại đang gián tiếp kế thừa kiểu `Long` từ STU (hoặc lỗi thiếu `@Id`).
  * Khóa ngoại `assignment_id` trong bảng `bills` bắt buộc phải là kiểu `UUID` để khớp nối.

### 2. Vi phạm nguyên tắc Aggregate Root (Coupling cực cao)
* **Vi phạm DDD nghiêm trọng**: Module `payment` trực tiếp import và thao tác trên repository của các module khác: `StudentHousingAssignmentRepository`, `BedRepository`, `RoomRepository`.
* Dưới góc nhìn DDD, module Payment và Room là 2 **Bounded Context** riêng biệt. Việc Payment Service trực tiếp ghi đè trạng thái của Bed và Assignment mà không thông qua Domain Events hoặc API công khai của Room Context sẽ gây mất tính toàn vẹn dữ liệu và tạo ra mối liên kết cứng (tight coupling), vi phạm tính độc lập của các Aggregate Root.

---

## PHẦN 4 - CONCURRENCY AUDIT (KIỂM TOÁN ĐỒNG THỜI)

| Loại rủi ro | Trạng thái | Đánh giá kỹ thuật |
| :--- | :---: | :--- |
| **Double Payment** | **PASS** | Sử dụng `@Lock(LockModeType.PESSIMISTIC_WRITE)` trên phương thức `findByIdForUpdate` của `BillRepository` giúp tuần tự hóa tất cả luồng thanh toán đồng thời vào cùng một hóa đơn. |
| **Duplicate Transaction** | **WARNING** | Có kiểm tra trùng mã giao dịch ở tầng Java (`createPaymentRecord`). Tuy nhiên, nếu hai giao dịch trùng mã gọi đồng thời vào hai hóa đơn khác nhau, bộ lọc Java sẽ không phát hiện ra. Hệ thống phải phụ thuộc vào Unique Index ở tầng DB để báo lỗi (ném ra `PSQLException` thay vì `AppException` có cấu trúc). |
| **Lost Update** | **FAIL** | 1. Khi cập nhật số tiền đã trả trên hóa đơn: **PASS** (do khóa bi quan Bill).<br>2. Khi cập nhật trạng thái Room/Bed khi thanh toán thành công: **FAIL**. [PaymentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java) tự sửa đổi thực thể `Bed` sang `OCCUPIED` mà không hề lock đối tượng phòng (`Room`), có thể ghi đè làm mất dữ liệu của các thread check-out hoặc bảo trì phòng chạy song song. |
| **Payment Replay** | **PASS** | Có cơ chế chặn thanh toán hóa đơn đã ở trạng thái `PAID`. |
| **Cash Approval Race Condition** | **FAIL** | Nếu Admin phê duyệt tiền mặt cùng lúc Job quét quá hạn (`PaymentExpirationService`) đang xử lý:<br>- Job quét quá hạn đọc Bill dạng không khóa (Non-locking Read), thấy quá hạn.<br>- Admin khóa Bill, thực hiện thanh toán thành công, đổi trạng thái Bill sang `PAID` và cập nhật Assignment sang `OCCUPIED` rồi commit.<br>- Job quét quá hạn tiếp tục chạy, sử dụng dữ liệu cũ trong bộ nhớ ghi đè trạng thái Bill thành `OVERDUE` và hủy Assignment thành `CANCELLED`. Kết quả: Sinh viên đã đóng tiền mặt nhưng bị hủy phòng oan. |
| **Concurrent Online Payment** | **PASS** | Bảo vệ bởi khóa bi quan trên `Bill` tại hàm `validateBillAndAmount`. |

---

## PHẦN 5 - KTX BUSINESS FLOW AUDIT (KIỂM TOÁN LUỒNG NGHIỆP VỤ)

Luồng nghiệp vụ KTX thực tế yêu cầu:
```
Application APPROVED
↓
Reserve Bed (Bed = RESERVED, Room Occupancy + 1)
↓
WAITING_PAYMENT (Application = WAITING_PAYMENT)
↓
Student pays
↓
Create Student & Create UserAccount (Tài khoản kích hoạt, gán Student)
↓
Assignment VẪN giữ trạng thái RESERVED (Giường vẫn RESERVED)
↓
Student lên KTX làm thủ tục trực tiếp
↓
Check-In
↓
Assignment -> OCCUPIED (Giường -> OCCUPIED)
```

### Điểm sai lệch nghiêm trọng của Module Payment cũ:
1. **Flow Check-in tự động bị lỗi**: Ngay khi thanh toán thành công (`PaymentStatus.SUCCESS`), `PaymentService` tự động chuyển trạng thái Assignment và Bed sang `OCCUPIED` (tức là coi như sinh viên đã dọn vào ở). Điều này bỏ qua bước Check-In vật lý khi sinh viên đến KTX làm thủ tục giấy tờ thực tế.
2. **Thiếu cơ chế tạo tài khoản tự động**: Khi thanh toán thành công, hệ thống không hề có logic gọi sang Module Student/User để tạo hồ sơ `Student` và `UserAccount` theo đúng luồng.
3. **Mất đồng bộ trạng thái đơn đăng ký**: Không hề cập nhật trạng thái đơn [DormitoryApplication.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/application/entity/DormitoryApplication.java) từ `WAITING_PAYMENT` sang trạng thái tiếp theo sau khi đóng tiền.

---

## PHẦN 6 - OUTPUT FORMAT & KẾT LUẬN

### MỨC ĐỘ TƯƠNG THÍCH ĐẠT ĐƯỢC: **30%**
*(Chỉ tận dụng được các DTO cơ bản và các trường thuộc tính Entity, toàn bộ logic dịch vụ, tích hợp và lập lịch phải viết lại/bỏ đi).*

---

### PHÂN LOẠI CHI TIẾT TẬP TIN

#### 1. PASS (Các file giữ nguyên cấu trúc nghiệp vụ, chỉ sửa package/import)
Các tập tin này lưu trữ các định nghĩa chuẩn về dữ liệu thanh toán và yêu cầu đầu vào, cấu trúc nghiệp vụ của chúng hoàn toàn khớp với SDMS:
* [BillStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillStatus.java) (Trạng thái hóa đơn)
* [BillType.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillType.java) (Loại hóa đơn)
* [PaymentMethod.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentMethod.java) (Phương thức thanh toán)
* [PaymentStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentStatus.java) (Trạng thái thanh toán)
* [CashPaymentRequest.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/request/CashPaymentRequest.java) (Request nộp tiền mặt)
* [OnlinePaymentRequest.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/request/OnlinePaymentRequest.java) (Request thanh toán online)

#### 2. WARNING (Các file cần xem xét điều chỉnh sâu cấu trúc dữ liệu)
* [BillResponse.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/response/BillResponse.java): Cần sửa kiểu dữ liệu của `assignmentId` từ `Long` thành `UUID`.
* [PaymentResponse.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/response/PaymentResponse.java): Sửa đổi import và cấu trúc liên quan để đồng bộ các mã trạng thái mới.
* [PaymentController.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/controller/PaymentController.java): Cần cấu hình lại các phân quyền bảo mật của Spring Security cho các endpoint `/online` và `/cash/approve` để khớp với hệ thống phân quyền mới của SDMS.

#### 3. FAIL (Các file bắt buộc phải viết lại/điều chỉnh toàn diện)
* [Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java): 
  * Cần bổ sung khóa chính `@Id` định dạng `UUID` (hoặc `Long` tự tăng khai báo rõ ràng).
  * Chuyển kiểu liên kết `assignment` tương thích với UUID của `StudentHousingAssignment`.
* [Payment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Payment.java): Bổ sung khóa chính `@Id` tự sinh.
* [BillRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/repository/BillRepository.java): Sửa kiểu ID trong JpaRepository sang kiểu khóa chính thực tế tương thích.
* [PaymentRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/repository/PaymentRepository.java): Sửa kiểu ID trong JpaRepository sang kiểu khóa chính thực tế tương thích.
* [BillService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/BillService.java): Thay đổi kiểu dữ liệu đối số đầu vào (dùng UUID thay vì truyền thô) để match với Room module.
* [PaymentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java): 
  * Loại bỏ hoàn toàn logic tự động cập nhật trạng thái `StudentHousingAssignment` và `Bed` sang `OCCUPIED`.
  * Tách biệt tầng giao tiếp bằng cách đưa logic cập nhật trạng thái về đúng module Room quản lý (qua Event hoặc gọi Service Room có khóa Room chống race condition).
  * Tích hợp thêm nghiệp vụ tạo hồ sơ `Student`, tạo `UserAccount` và cập nhật đơn đăng ký `DormitoryApplication` sau khi thanh toán thành công.

---

### DANH SÁCH TẬP TIN XỬ LÝ (ACTION MATRIX)

#### FILES TO KEEP (Giữ lại và chỉ refactor Package/Import)
1. [BillStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillStatus.java)
2. [BillType.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/BillType.java)
3. [PaymentMethod.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentMethod.java)
4. [PaymentStatus.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/enums/PaymentStatus.java)
5. [CashPaymentRequest.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/request/CashPaymentRequest.java)
6. [OnlinePaymentRequest.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/request/OnlinePaymentRequest.java)

#### FILES TO MODIFY (Chỉnh sửa cấu trúc dữ liệu / thiết kế luồng)
1. [Bill.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Bill.java)
2. [Payment.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/entity/Payment.java)
3. [BillResponse.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/response/BillResponse.java)
4. [PaymentResponse.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/dto/response/PaymentResponse.java)
5. [PaymentController.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/controller/PaymentController.java)
6. [BillRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/repository/BillRepository.java)
7. [PaymentRepository.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/repository/PaymentRepository.java)
8. [BillService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/BillService.java)
9. [PaymentService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentService.java)

#### FILES TO DELETE (Xóa hoàn toàn khỏi mã nguồn)
1. [PaymentExpirationService.java](file:///D:/qt-team-projects/graduation_thesis/smart-dormitory-management-system/sdms-backend/src/main/java/com/sdms/backend/modules/payment/service/PaymentExpirationService.java)
   *(Lý do: Đã bị thay thế hoàn toàn bằng `PaymentExpireJob` chạy ShedLock đồng bộ độc lập của Room module, chứa các lệnh gọi và thiết lập không còn tồn tại trên thực tế gây lỗi compile hệ thống).*
