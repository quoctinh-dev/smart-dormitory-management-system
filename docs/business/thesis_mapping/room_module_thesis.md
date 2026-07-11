# PHÂN TÍCH MODULE PHÒNG (ROOM MODULE) – LUẬN VĂN TỐT NGHIỆP SDMS
> Cập nhật: 09/07/2026 | Đã quét code thực tế | Đáp ứng THESIS_DEPTH_RULE

---

## Chương 1: Giới thiệu

### 1.1. Đặt vấn đề, mục tiêu
- **Đặt vấn đề:** Quản lý thủ công hàng ngàn phòng, giường trong KTX bằng Excel dẫn đến sai sót, overbooking (đặt lố), khó theo dõi tình trạng lấp đầy và thất thoát doanh thu. Khi có phòng bảo trì hay sự cố, quản trị viên không có công cụ để phản ứng nhanh.
- **Mục tiêu:** Xây dựng phân hệ quản lý cơ sở vật chất tự động hóa, liên kết chặt chẽ với quy trình đăng ký, thanh toán, kiểm soát ra vào (IoT), nhận diện khuôn mặt (AI) và hệ thống thông báo.

### 1.2. Những thách thức kỹ thuật và nghiệp vụ
| Thách thức | Loại | Giải pháp áp dụng |
|---|---|---|
| Overbooking khi nhiều SV chọn cùng 1 giường | Kỹ thuật | **Optimistic Locking** (`@Version`) trên Bed entity |
| Xóa phòng khi SV đang ở | Nghiệp vụ | **Soft Delete** + **RoomValidator** chặn trước khi thao tác |
| Hạ sức chứa xuống dưới số giường đang có người | Nghiệp vụ | `validateCapacity()` đếm OCCUPIED theo scope phòng |
| Bảo trì phòng khi vẫn còn cư dân | Nghiệp vụ | `validateCanMaintenance()` kiểm tra RESERVED/OCCUPIED |
| Hệ thống IoT mất đồng bộ khi trạng thái phòng thay đổi | Kỹ thuật | Event-driven: `BuildingStatusChangedEvent`, `BedStatusChangedEvent` |
| Giữ chỗ giường mà không có cơ chế hết hạn | Nghiệp vụ | Scheduler auto-cancel sau 3 ngày không thanh toán |

### 1.3. Nội dung, phạm vi thực hiện
**Sơ đồ phân cấp hạ tầng:**
```
Building (Tòa nhà)
  └── Floor (Tầng)
        └── Room (Phòng)
              └── Bed (Giường)
                    └── StudentHousingAssignment (Hợp đồng lưu trú)
```
**Phạm vi module Room:**
- CRUD Building, Floor, Room, Bed với validation nghiệp vụ đa lớp
- State Machine cho Bed (AVAILABLE → RESERVED → OCCUPIED → MAINTENANCE)
- Auto-generate beds theo capacity (naming convention: `A101-B01`)
- Analytics Dashboard: Occupancy rate, Revenue at risk, Maintenance report
- Check-in workflow cho Admin

### 1.4. Kết quả cần đạt

| # | Tiêu chí | Mô tả | Loại | Kết quả |
|---|----------|-------|------|---------|
| 1 | CRUD an toàn | Soft delete + kiểm tra ràng buộc trước khi thao tác | Chức năng | ✅ Đạt |
| 2 | Chống overbooking | Optimistic Locking trên Bed và Room entity | Chức năng | ✅ Đạt |
| 3 | Tự động hóa | Auto-cancel giường sau 3 ngày + auto-generate beds | Chức năng | ✅ Đạt |
| 4 | Analytics Dashboard | Occupancy rate, Revenue at risk, Maintenance report | Chức năng | ✅ Đạt |
| 5 | UI/UX trực quan | Grid/Card theo Tòa nhà/Tầng + BedDetailDrawer drill-down | Chức năng | ✅ Đạt |
| 6 | Hiệu năng | Pagination + Specification filter + Cache (`@Cacheable`) | Phi chức năng | ✅ Đạt |
| 7 | Phân quyền API | 100% endpoint có `@PreAuthorize` | Phi chức năng | ⚠️ **Cần fix** (xem §API Matrix) |
| 8 | Kiểm toán dữ liệu | created_at, updated_at trong BaseEntity | Phi chức năng | ⚠️ **Thiếu created_by/updated_by** |

---

## Chương 2: Phương pháp thực hiện

### 2.1. Các hệ thống tương tự
| Hệ thống | Ưu điểm | Nhược điểm |
|---|---|---|
| Quản lý KTX bằng Excel/Sổ tay | Đơn giản, không cần công nghệ | Không có real-time, dễ sai sót, không thể tích hợp IoT |
| Hệ thống quản lý khách sạn thương mại | Chuyên nghiệp, đa tính năng | Quá phức tạp, không phù hợp nghiệp vụ KTX trường học (phân theo học kỳ, giới tính, đối tượng SV) |
| **SDMS (Hệ thống này)** | Real-time, tích hợp AI/IoT, phân quyền chặt chẽ | Đang hoàn thiện, phụ thuộc hạ tầng mạng ổn định |

### 2.3. Công nghệ sử dụng
| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| Backend | Java 21, Spring Boot 3.x | Type-safe, ecosystem trưởng thành, annotation-driven |
| ORM | Hibernate JPA, Flyway | Soft delete tự nhiên, migration có version |
| Database | PostgreSQL | Hỗ trợ pgvector (AI face), JSON, ACID |
| Concurrency | `@Version` (Optimistic Locking) | Chống race condition không làm sụt hiệu năng |
| Caching | Spring Cache (`@Cacheable`) | Giảm tải DB cho analytics dashboard |
| Event | Spring `ApplicationEventPublisher` | Loose coupling giữa Room → Payment → IoT |
| Frontend | React + TypeScript, MUI v5 | Type-safe UI, Component tái sử dụng |
| State | React hooks | Đơn giản, không cần Redux |

### 2.4. Phân tích yêu cầu

#### 2.4.1. Quy trình Giữ chỗ giường (Bed Reservation Flow)
```
[SV Nộp đơn]
     ↓
[ApplicationApprovedEvent] → Room Module lắng nghe
     ↓
Tìm giường AVAILABLE theo gender + building
     ↓
Bed.status → RESERVED (Optimistic Lock check)
     ↓
StudentHousingAssignment.status = RESERVED
     ↓
[Scheduler: 72h] → Nếu chưa thanh toán → Hủy (Bed → AVAILABLE)
     ↓
[PaymentSuccessEvent] → Bed.status → OCCUPIED, Assignment.status → OCCUPIED
```

#### 2.4.2. Quy trình Check-in thực tế
```
Admin tìm kiếm SV theo CCCD
     ↓
Hệ thống trả về Assignment PENDING_CHECKIN
     ↓
Admin xác nhận thủ tục nhận phòng
     ↓
Assignment.status → OCCUPIED, checkInAt = now()
     ↓
Kích hoạt SmartAccess (IoT door) cho SV
```

#### 2.4.3. Sơ đồ Use case tổng quát
**Actor: Admin**
| Use case | Mô tả |
|---|---|
| Quản lý Tòa nhà (CRUD) | Tạo/Sửa/Đổi trạng thái Building |
| Quản lý Tầng (CRUD) | Tạo/Sửa tầng theo tòa nhà với chính sách giới tính |
| Quản lý Phòng (CRUD) | Tạo/Sửa/Đổi trạng thái phòng với validator |
| Sinh giường tự động | Auto-generate beds theo capacity |
| Dashboard giám sát | Xem occupancy rate, maintenance, revenue at risk |
| Bed Drill-down | Tra cứu SV đang ở tại giường cụ thể |
| Xử lý Check-in | Xác nhận SV nhận phòng theo CCCD |
| Tạo PIN tự động/Reset PIN | Quản lý mã PIN cửa phòng, tự động sinh hàng loạt |

#### 2.4.4. Quy trình Cấp phát Mã PIN Phòng (Room PIN Workflow)
Kiến trúc PIN được gắn trực tiếp vào thực thể `Room` thay vì `Student`. Điều này đảm bảo:
- **Tự động đồng bộ:** Khi SV được Approved đổi phòng hoặc di dời khẩn cấp, trạng thái `Assignment` chuyển sang `OCCUPIED` ở phòng mới. Hệ thống IoT ngay lập tức chấp nhận PIN của phòng mới và từ chối PIN cũ mà không cần can thiệp cập nhật thủ công.
- **Bảo mật vật lý:** PIN phòng độc lập với hệ thống FaceID/RFID ở tòa nhà. Đảm bảo 2 lớp an ninh.
- **Tiện lợi Admin:** Hỗ trợ tính năng `Bulk Generate PIN` (sinh PIN hàng loạt cho các phòng chưa có) và `Reset PIN` cho một phòng khi có sinh viên mới chuyển đến.

**Actor: Sinh viên**
| Use case | Mô tả |
|---|---|
| Xem thông tin phòng hiện tại | Tra cứu vị trí phòng, tầng, tòa nhà |
| Xem đếm ngược hạn thanh toán | Biết còn bao nhiêu giờ để thanh toán giữ chỗ |

---

## Chương 3: Thiết kế

### 3.1. Mô hình dữ liệu (Vật lý)

#### Entities và Relationships
| Entity | Table | Quan hệ |
|---|---|---|
| Building | `buildings` | 1-n Floor |
| Floor | `floors` | n-1 Building, 1-n Room |
| Room | `rooms` | n-1 Floor, 1-n Bed |
| Bed | `beds` | n-1 Room, 1-n Assignment |
| StudentHousingAssignment | `student_housing_assignments` | n-1 Bed, n-1 Student, n-1 Application |

#### Ràng buộc DB đáng chú ý
| Ràng buộc | Bảng | Mục đích |
|---|---|---|
| `uk_floor_room_code` | rooms(floor_id, room_code) | Không trùng mã phòng trong cùng tầng |
| `uk_room_bed_code` | beds(room_id, bed_code) | Không trùng mã giường trong cùng phòng |
| `@Version` | rooms, beds | Optimistic locking chống overbooking |
| `idx_bed_status` | beds(status) | Tăng tốc tìm giường AVAILABLE |
| `idx_assignment_status` | assignments(status) | Tăng tốc truy vấn OCCUPIED/RESERVED |
| `idx_assignment_student` | assignments(student_id) | Tăng tốc tìm phòng theo SV |
| `uk_active_assignment_bed` | (V12) | 1 bed chỉ có 1 assignment ACTIVE |

### 3.2. State Machine Giường (Bed)
```
AVAILABLE ──────┐
     ↑           │ reserve (ApplicationApproved)
     │           ↓
 release      RESERVED ───────────────┐
(Cancel/       │                      │ cancel (3 ngày không TT)
Checkout)      │ checkIn              ↓
               ↓               AVAILABLE (release)
            OCCUPIED
               │
               │ checkOut
               ↓
          CHECKED_OUT (Assignment) → Bed trở về AVAILABLE

AVAILABLE ⟷ MAINTENANCE (Admin thủ công, chỉ khi không có SV)
```

### 3.3. Hệ thống màn hình Frontend

| Component | File | Chức năng |
|---|---|---|
| RoomManagementPage | `RoomManagementPage.tsx` | Bộ lọc đa cấp Building/Floor/Status/Gender |
| DashboardView | `DashboardView.tsx` | Sơ đồ Grid giường theo màu sắc |
| RoomCard | `RoomCard.tsx` | Card phòng với occupancy badge |
| BedDetailDrawer | `BedDetailDrawer.tsx` | Drawer chi tiết SV tại giường (Drill-down) |
| RoomActionMenu | `RoomActionMenu.tsx` | Menu: Thêm giường, Sinh giường tự động, Đổi trạng thái |
| BuildingFormDialog | `BuildingFormDialog.tsx` | Create/Update Building |
| FloorFormDialog | `FloorFormDialog.tsx` | Create/Update Floor + Smart Lock giới tính |
| CreateRoomDialog | `CreateRoomDialog.tsx` | Tạo phòng mới |
| UpdateRoomDialog | `UpdateRoomDialog.tsx` | Cập nhật phòng (Cấm đổi mã phòng) |
| BedIcon | `BedIcon.tsx` | Icon màu sắc theo trạng thái giường |

---

## Chương 4: Thử nghiệm

### 4.1. Các kịch bản thử nghiệm

| # | Kịch bản | Bước thực hiện | Kết quả kỳ vọng |
|---|---|---|---|
| TC-01 | Hạ capacity dưới số SV đang ở | PUT `/api/v1/admin/rooms/{id}` với `capacity < currentOccupied` | HTTP 400: "New capacity cannot be lower than current occupied beds" |
| TC-02 | Chuyển phòng sang MAINTENANCE khi có SV | PATCH `/{roomId}/status?status=MAINTENANCE` khi room có OCCUPIED assignment | HTTP 400: "Cannot put room into maintenance while it contains active assignments" |
| TC-03 | Hai SV cùng chọn 1 giường cuối | Gửi đồng thời 2 request vào cùng 1 bed AVAILABLE | 1 thành công, 1 nhận `ObjectOptimisticLockingFailureException` → HTTP 409 |
| TC-04 | Auto-cancel sau 72h không thanh toán | Tạo assignment RESERVED → Chờ scheduler chạy | Bed trả về AVAILABLE, Assignment bị CANCELLED |
| TC-05 | Check-in với CCCD không tồn tại | GET `/api/v1/admin/check-in/search?cccd=INVALID` | HTTP 404: Không tìm thấy SV |
| TC-06 | Sinh giường vượt capacity | POST `/beds/room/{id}/auto-generate` khi đã đủ beds | HTTP 400: "Would exceed room capacity limit" |

### 4.2. Xử lý trường hợp ngoại lệ
- **DataIntegrityViolationException**: Bắt tại `GlobalExceptionHandler`, trả về HTTP 409 với message có ý nghĩa (không để lộ SQL stack trace).
- **ObjectOptimisticLockingFailureException**: Bắt tại interceptor, trả về HTTP 409 "Resource was modified by another request. Please retry."
- **AppException**: Custom exception với HttpStatus code rõ ràng.

---

## PHẦN ĐẶC BIỆT: API PERMISSION MATRIX (Bắt buộc theo THESIS_DEPTH_RULE §3.3)

### BuildingController (`/api/v1/admin/buildings`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| POST | `/` | `hasRole('ADMIN')` | ✅ Tạo tòa nhà |
| GET | `/` | `hasRole('ADMIN')` | ✅ Danh sách tất cả tòa nhà |
| GET | `/{id}` | `hasRole('ADMIN')` | ✅ Chi tiết tòa nhà |
| PUT | `/{id}` | `hasRole('ADMIN')` | ✅ Cập nhật tòa nhà |
| PATCH | `/{id}/status` | `hasRole('ADMIN')` | ✅ Đổi trạng thái |

### FloorController (`/api/v1/admin/floors`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| POST | `/` | `hasRole('ADMIN')` | ✅ Tạo tầng |
| GET | `/{floorId}` | `hasRole('ADMIN')` | ✅ Chi tiết tầng |
| GET | `/building/{buildingId}` | `hasRole('ADMIN')` | ✅ Danh sách tầng theo tòa nhà |
| PUT | `/{floorId}` | `hasRole('ADMIN')` | ✅ Cập nhật tầng |

### RoomController (`/api/v1/admin/rooms`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| POST | `/` | `hasRole('ADMIN')` | ✅ Tạo phòng |
| GET | `/{roomId}` | `hasRole('ADMIN')` | ✅ Chi tiết phòng |
| GET | `/floor/{floorId}` | `hasRole('ADMIN')` | ✅ Danh sách theo tầng |
| GET | `/` | `hasRole('ADMIN')` | ✅ Tìm kiếm/lọc có phân trang |
| PUT | `/{roomId}` | `hasRole('ADMIN')` | ✅ Cập nhật phòng |
| PATCH | `/{roomId}/status` | `hasRole('ADMIN')` | ✅ Đổi trạng thái |
| GET | `/analytics/occupancy` | `hasRole('ADMIN')` | ✅ Thống kê lấp đầy |
| GET | `/analytics/emergency-relocation` | `hasRole('ADMIN')` | ✅ Gợi ý phòng điều chuyển |
| GET | `/analytics/revenue-at-risk` | `hasRole('ADMIN')` | ✅ Thống kê tài chính |
| GET | `/analytics/maintenance-report` | `hasRole('ADMIN')` | ✅ Báo cáo bảo trì |

### BedController (`/api/v1/admin/beds`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| POST | `/` | `hasRole('ADMIN')` | ✅ Tạo giường |
| GET | `/room/{roomId}` | `hasRole('ADMIN')` | ✅ Danh sách giường theo phòng |
| POST | `/room/{roomId}/auto-generate` | `hasRole('ADMIN')` | ✅ Sinh giường tự động |
| PATCH | `/{bedId}/status` | `hasRole('ADMIN')` | ✅ Đổi trạng thái giường |

### RoomPinController (`/api/v1/room-pins`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| GET | `/{roomId}` | `hasRole('ADMIN')` | ✅ Lấy mã PIN của phòng |
| POST | `/{roomId}/reset` | `hasRole('ADMIN')` | ✅ Reset mã PIN một phòng |
| POST | `/bulk-generate` | `hasRole('ADMIN')` | ✅ Tạo mã PIN hàng loạt |
| POST | `/bulk-reset` | `hasRole('ADMIN')` | ✅ Reset toàn bộ mã PIN hệ thống |

### HousingAssignmentAdminController (`/api/v1/admin/housing-assignments`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| GET | `/active/bed/{bedId}` | `hasRole('ADMIN')` (Class-level) | ✅ Tra cứu SV tại giường |

### CheckInController (`/api/v1/admin/check-in`)
| Method | Endpoint | PreAuthorize | Mô tả | ⚠️ Vấn đề |
|--------|----------|-------------|-------|-----------|
| GET | `/search` | ❌ **KHÔNG CÓ** | Tìm SV theo CCCD | 🔴 **THIẾU @PreAuthorize** |
| POST | `/{assignmentId}` | ❌ **KHÔNG CÓ** | Xác nhận check-in | 🔴 **THIẾU @PreAuthorize** |

### StudentRoomController (`/api/v1/student/room`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| GET | `/current` | `hasRole('STUDENT')` (Class-level) | ✅ Xem phòng hiện tại |

### StudentAssignmentCountdownController (`/api/v1/student/assignments`)
| Method | Endpoint | PreAuthorize | Mô tả | ⚠️ Vấn đề |
|--------|----------|-------------|-------|-----------|
| GET | `/countdown` | ❌ **KHÔNG CÓ** | Đếm ngược hạn TT | 🔴 **THIẾU @PreAuthorize** |

### PublicRoomController (`/api/v1/public/room`)
| Method | Endpoint | PreAuthorize | Mô tả | Ghi chú |
|--------|----------|-------------|-------|---------|
| GET | `/assignment/{applicationId}` | ❌ **Không có** | Tra cứu assignment theo applicationId | ⚠️ Public endpoint – có chủ ý hay không? Cần xác nhận |

### RoomDashboardController (`/api/v1/dashboard`)
| Method | Endpoint | PreAuthorize | Mô tả |
|--------|----------|-------------|-------|
| GET | `/stats` | `hasAnyRole('ADMIN', 'STAFF')` | ✅ Thống kê Dashboard |

---

## PHẦN ĐẶC BIỆT: SIDE-EFFECTS KHI THAO TÁC (CRUD Safety Analysis)

| Thao tác | Side-effect | Xử lý hiện tại |
|---|---|---|
| **Đổi Building → MAINTENANCE** | IoT devices mất context | BuildingValidator chặn khi có RESERVED/OCCUPIED | 
| **Đổi Building → CLOSED** | Tương tự MAINTENANCE | BuildingValidator chặn |
| **Đổi Room → MAINTENANCE** | SV trong phòng bị kẹt | RoomValidator chặn khi có active assignments |
| **Đổi Room → CLOSED** | Tương tự | RoomValidator chặn |
| **Hạ capacity Room** | Không thể chứa SV đang ở | RoomValidator `validateCapacity()` |
| **Đổi Bed → MAINTENANCE** | BedValidator (chỉ từ AVAILABLE) | BedValidator |
| **Checkout SV** | Bed phải trả về AVAILABLE | HousingAssignmentService xử lý |
| **Cancel Assignment** | Bed phải trả về AVAILABLE, Payment cancel | Event-driven |

---

## Chương 5: Kết luận

### 5.1. Kết quả đối chiếu mục tiêu
| Tiêu chí | Kết quả | Ghi chú |
|---|---|---|
| CRUD an toàn | ✅ Đạt | Validator đa lớp + Soft delete |
| Chống overbooking | ✅ Đạt | @Version Optimistic Lock |
| Auto-generate beds | ✅ Đạt | Naming convention chuẩn |
| Dashboard analytics | ✅ Đạt | 4 analytics endpoints |
| Phân quyền API | ⚠️ Chưa đủ | 3 endpoint thiếu @PreAuthorize |
| Audit trail đầy đủ | ⚠️ Chưa đủ | Thiếu created_by/updated_by |

### 5.2. Vấn đề còn tồn đọng (Technical Debt)
1. **[BUG-SECURITY-01]** `CheckInController` thiếu `@PreAuthorize` → Bất kỳ ai cũng gọi được API Check-in
2. **[BUG-SECURITY-02]** `StudentAssignmentCountdownController` thiếu `@PreAuthorize`
3. **[BUG-SECURITY-03]** Mã hóa UTF-8 bị lỗi trong `StudentAssignmentCountdownController` (dòng 42-45)
4. **[GAP-AUDIT]** BaseEntity chưa có `created_by` / `updated_by` → Audit trail chưa đầy đủ
5. **[GAP-DEACTIVATE]** Building và Floor chưa có API Soft Delete (chỉ có status change)
6. **[GAP-PUBLIC]** `PublicRoomController` không có auth – cần xác nhận có chủ ý không

### 5.3. Mở rộng
- Bổ sung luồng "Điều chuyển khẩn cấp" khi phòng vào MAINTENANCE
- Thêm Maintenance Ticket system (lý do bảo trì, ngày dự kiến hoàn thành)
- Thêm Room Transfer workflow (SV xin chuyển phòng)
