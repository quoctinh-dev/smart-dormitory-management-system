# Đặc tả API: Tính năng Gia hạn lưu trú (Stay Extension)

## 1. Mục đích
API hỗ trợ sinh viên nộp đơn xin gia hạn lưu trú KTX trực tuyến dựa trên các chính sách ưu tiên và quỹ giường còn trống.

## 2. Thông tin API
- **Endpoint:** `POST /api/v1/students/extensions`
- **Method:** `POST`
- **Authentication:** `Bearer Token` (Chỉ Sinh viên mới có quyền truy cập, xác thực qua token để lấy mã `studentCode`)

## 3. Quy tắc nghiệp vụ (Business Logic)
1. **Kiểm tra đợt mở đăng ký (Active Extension Wave):**
   - Hệ thống tự động kiểm tra xem bảng `registration_periods` có đang kích hoạt đợt đăng ký nào thuộc loại `CURRENT_RESIDENT` hay không.
   - Nếu không có đợt gia hạn nào đang mở: Trả về lỗi `400 Bad Request` ("Hiện tại KTX không trong đợt tiếp nhận đơn gia hạn").
2. **Kiểm tra tính hợp lệ của Sinh viên:**
   - Hệ thống kiểm tra sinh viên có lưu trú tại KTX không (Dựa vào `StudentHousingAssignment` có status `OCCUPIED`).
   - Kiểm tra sinh viên có nộp trùng đơn gia hạn trước đó chưa. Nếu đã có sẽ ném lỗi 400.
3. **Chính sách ưu tiên (Priority Filter):**
   - Dựa trên Enum `ExtensionReason` (`ROOM_LEADER`, `POLICY_BENEFICIARY`, `ACADEMIC_EXCELLENCE`, `OTHER`), nhà quản trị có thể phân bổ ưu tiên xét duyệt.
   - Mặc định sau khi tạo, đơn gia hạn nằm ở trạng thái `PENDING`.
4. **Kế thừa dữ liệu và Trích xuất PDF:**
   - Đơn gia hạn kế thừa tự động `currentBed` của sinh viên.
   - Trích xuất thông tin, kết xuất chứng từ PDF (ký điện tử) và lưu trữ URL tại `pdfUrl`.

## 4. Đặc tả Payload
### Request Body (`StayExtensionRequest`)
```json
{
  "reason": "ROOM_LEADER",
  "description": "Tôi là trưởng phòng 101-B, mong muốn gia hạn để tiếp tục hỗ trợ công tác quản lý phòng."
}
```

### Response Body (`StayExtensionResponse`) - Thành công `201 Created`
```json
{
  "code": 200,
  "message": "Đã nộp đơn gia hạn lưu trú thành công",
  "data": {
    "extensionId": "550e8400-e29b-41d4-a716-446655440000",
    "studentId": "660e8400-e29b-41d4-a716-446655440001",
    "studentCode": "20520000",
    "fullName": "Nguyễn Văn A",
    "reason": "ROOM_LEADER",
    "status": "PENDING",
    "currentBedId": "770e8400-e29b-41d4-a716-446655440002",
    "currentBedCode": "B01",
    "currentRoomCode": "101-B",
    "pdfUrl": "https://sdms-storage.s3.amazonaws.com/extensions/20520000_extension.pdf",
    "description": "Tôi là trưởng phòng 101-B, mong muốn gia hạn để tiếp tục hỗ trợ công tác quản lý phòng."
  }
}
```

## 5. Danh sách File cấu trúc đã triển khai
1. **Enums:** `ExtensionReason.java`, `ExtensionStatus.java` (Tại `modules/student/enums/`)
2. **Entity:** `StayExtension.java` (Khóa ngoại với `Student` và `Bed`)
3. **Repository:** `StayExtensionRepository.java`
4. **Service:** `StayExtensionService.java`
5. **Controller:** `StayExtensionController.java`
6. **DTOs:** `StayExtensionRequest.java`, `StayExtensionResponse.java`
7. **Database Migration:** `V31__create_stay_extensions_table.sql`
