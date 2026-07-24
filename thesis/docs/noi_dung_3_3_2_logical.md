## Cấu trúc 3.3.2 cho SDMS

### Phần 1 — 3.3.2.1 Lược đồ quan hệ

system_configs(<u>config_key</u>, config_value, description, group_name, created_at, updated_at)
user_accounts(<u>account_id</u>, username, email, password, role, status, last_login, refresh_token, refresh_token_expiry, reset_password_token, reset_password_expiry, failed_login_attempts, lock_time, *student_id*, created_at, updated_at)
students(<u>student_id</u>, *source_application_id*, student_code, full_name, cccd, email, phone, father_name, father_phone, mother_name, mother_phone, contact_address, permanent_address, faculty, academic_year, avatar_url, face_image_url, is_face_registered, rfid_code, status, created_at, updated_at)
buildings(<u>building_id</u>, code, name, description, status, gender, created_at, updated_at)
floors(<u>floor_id</u>, floor_number, gender, *building_id*, created_at, updated_at)
rooms(<u>room_id</u>, room_code, capacity, occupied_beds, status, room_pin_code, version, *floor_id*, created_at, updated_at)
beds(<u>bed_id</u>, bed_code, status, note, version, *room_id*, created_at, updated_at)
registration_periods(<u>period_id</u>, period_name, start_date, end_date, stay_start_date, stay_end_date, is_active, registration_type, created_at, updated_at)
registration_eligibilities(<u>eligibility_id</u>, *period_id*, cccd, full_name, email, student_code, target, created_at, updated_at)
dormitory_applications(<u>application_id</u>, version, *period_id*, full_name, student_code, dob, gender, cccd, issue_date, issue_place, email, phone, permanent_address, pob, ethnic, religion, faculty, cohort, contact_address, father_name, father_yob, father_job, father_phone, mother_name, mother_yob, mother_job, mother_phone, status, priority_score, application_code, registration_form_pdf_url, commitment_form_pdf_url, reviewed_by_user_id, review_note, commitment_accepted, commitment_accepted_at, commitment_version, client_ip_address, waiting_list_used, payment_deadline, revision_deadline, approved_at, submitted_at, created_at, updated_at)
application_priorities(<u>priority_id</u>, *application_id*, priority_type, description, created_at, updated_at)
verification_documents(<u>document_id</u>, *application_id*, document_type, file_url, status, created_at, updated_at)
dormitory_application_status_history(<u>history_id</u>, *application_id*, from_status, to_status, changed_by_user_id, changed_at, note)
student_housing_assignments(<u>assignment_id</u>, *application_id*, *student_id*, *bed_id*, status, room_role, reserved_at, check_in_at, check_out_at, expected_check_out_at, created_at, updated_at)
stay_extensions(<u>extension_id</u>, *student_id*, reason, status, *registration_period_id*, *current_bed_id*, contract_pdf_url, commitment_pdf_url, description, reject_reason, old_expected_check_out_at, new_expected_check_out_at, created_at, updated_at)
checkout_requests(<u>request_id</u>, *student_id*, *assignment_id*, intended_checkout_date, reason, bank_account_number, bank_name, status, reject_reason, created_at, updated_at)
change_room_requests(<u>id</u>, *student_id*, *current_assignment_id*, *target_room_id*, reason, admin_note, status, reviewed_by_user_id, created_at, updated_at)
curfew_requests(<u>request_id</u>, *student_id*, reason, expected_arrival_time, request_type, start_date, status, *resolved_by*, admin_note, created_at, updated_at)
utility_usages(<u>id</u>, *room_id*, utility_type, month, year, old_reading, new_reading, total_usage, is_settled, version, created_at, updated_at)
bills(<u>bill_id</u>, bill_type, amount, paid_amount, status, due_date, description, *assignment_id*, *application_id*, *room_id*, *student_id*, version, created_at, updated_at)
payments(<u>payment_id</u>, *bill_id*, amount, method, status, transaction_code, gateway_transaction_id, description, gateway_metadata, paid_at, created_at, updated_at)
gates(<u>gate_id</u>, name, gate_type, *building_id*, *room_id*, mac_address, is_active, created_at, updated_at)
curfew_policies(<u>id</u>, *building_id*, resident_type, start_time, end_time, type, priority, is_active, created_at, updated_at)
time_window_policies(<u>id</u>, *building_id*, resident_type, start_time, end_time, is_active, created_at, updated_at)
access_history(<u>id</u>, *student_id*, *gate_id*, *building_id*, operator_id, event_timestamp, decision, denial_reason, method, direction, snapshot_url, created_at)
face_profiles(<u>profile_id</u>, *student_id*, face_image_url, pending_face_image_url, replacement_requested_at, status, rejection_reason, approved_by, approved_at, created_at, updated_at)
face_embeddings(<u>embedding_id</u>, *profile_id*, vector, created_at, updated_at)
face_verification_attempts(<u>attempt_id</u>, gate_device_id, *profile_id*, confidence_score, status, attempted_at)
notifications(<u>id</u>, *user_id*, title, message, action_url, notification_type, is_read, read_at, recipient, channel, status, error_message, event_id, sent_at, created_at, updated_at)

──────
### Phần 2 — 3.3.2.2 Mô tả các bảng dữ liệu

Bảng system_configs
 Thuộc tính    | Kiểu          | K | U | M | Diễn giải
---------------|---------------|---|---|---|-------------------------------------
 config_key    | Varchar(100)  | x | x | x | Tên cấu hình, khóa chính
 config_value  | Text          |   |   |   | Giá trị cấu hình
 description   | Text          |   |   |   | Mô tả chi tiết
 group_name    | Varchar(50)   |   |   |   | Nhóm cấu hình phân loại
 created_at    | Timestamp     |   |   | x | Thời gian tạo
 updated_at    | Timestamp     |   |   | x | Thời gian cập nhật

Bảng user_accounts
 Thuộc tính             | Kiểu         | K | U | M | Diễn giải
------------------------|--------------|---|---|---|---------------------------------------
 account_id             | UUID         | x | x | x | Khóa chính
 username               | Varchar(50)  |   | x | x | Tên đăng nhập
 email                  | Varchar(100) |   | x | x | Email để khôi phục mật khẩu
 password               | Varchar(255) |   |   | x | Mật khẩu mã hóa BCrypt
 role                   | Enum         |   |   | x | Vai trò (ADMIN/STAFF/STUDENT)
 status                 | Enum         |   |   | x | Trạng thái (ACTIVE/LOCKED/PENDING)
 last_login             | Timestamp    |   |   |   | Lần đăng nhập cuối
 refresh_token          | Varchar(255) |   |   |   | Token duy trì phiên
 refresh_token_expiry   | Timestamp    |   |   |   | Hạn của refresh token
 reset_password_token   | Varchar(255) |   |   |   | Token đặt lại mật khẩu
 reset_password_expiry  | Timestamp    |   |   |   | Hạn của reset token
 failed_login_attempts  | Integer      |   |   | x | Số lần đăng nhập sai (Mặc định 0)
 lock_time              | Timestamp    |   |   |   | Thời điểm bị khóa tài khoản
 student_id             | UUID         |   | x |   | FK → students (Nullable cho Admin/Staff)
 created_at             | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at             | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng students
 Thuộc tính             | Kiểu         | K | U | M | Diễn giải
------------------------|--------------|---|---|---|-------------------------------------
 student_id             | UUID         | x | x | x | Khóa chính
 source_application_id  | UUID         |   | x | x | FK → dormitory_applications
 student_code           | Varchar(50)  |   | x |   | Mã số sinh viên (MSSV)
 full_name              | Varchar(100) |   |   | x | Họ và tên
 cccd                   | Varchar(20)  |   | x | x | Căn cước công dân
 email                  | Varchar(100) |   |   |   | Email liên hệ
 phone                  | Varchar(20)  |   |   |   | Số điện thoại
 father_name            | Varchar(100) |   |   |   | Họ tên cha
 father_phone           | Varchar(20)  |   |   |   | Điện thoại cha
 mother_name            | Varchar(100) |   |   |   | Họ tên mẹ
 mother_phone           | Varchar(20)  |   |   |   | Điện thoại mẹ
 contact_address        | Text         |   |   |   | Địa chỉ liên lạc
 permanent_address      | Text         |   |   |   | Địa chỉ thường trú
 faculty                | Varchar(100) |   |   |   | Khoa đang theo học
 academic_year          | Varchar(20)  |   |   |   | Khóa học / Năm học
 avatar_url             | Text         |   |   |   | Ảnh đại diện thường
 face_image_url         | Text         |   |   |   | Ảnh nhận diện khuôn mặt AI
 is_face_registered     | Boolean      |   |   | x | Trạng thái đăng ký Face ID
 rfid_code              | Varchar(50)  |   | x |   | Mã thẻ từ RFID
 status                 | Enum         |   |   | x | Trạng thái lưu trú
 created_at             | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at             | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng buildings
 Thuộc tính   | Kiểu         | K | U | M | Diễn giải
--------------|--------------|---|---|---|---------------------------------------
 building_id  | UUID         | x | x | x | Khóa chính
 code         | Varchar(20)  |   | x | x | Mã tòa nhà (Vd: KTX-A)
 name         | Varchar(100) |   |   | x | Tên tòa nhà
 description  | Text         |   |   |   | Mô tả chi tiết
 status       | Enum         |   |   | x | Trạng thái (ACTIVE/MAINTENANCE)
 gender       | Enum         |   |   | x | Giới tính tòa nhà (MALE/FEMALE/MIXED)
 created_at   | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at   | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng floors
 Thuộc tính   | Kiểu         | K | U | M | Diễn giải
--------------|--------------|---|---|---|-------------------------------------
 floor_id     | UUID         | x | x | x | Khóa chính
 floor_number | Integer      |   |   | x | Số hiệu tầng
 gender       | Enum         |   |   | x | Phân bổ giới tính theo tầng
 building_id  | UUID         |   |   | x | FK → buildings
 created_at   | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at   | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng rooms
 Thuộc tính    | Kiểu         | K | U | M | Diễn giải
---------------|--------------|---|---|---|-------------------------------------
 room_id       | UUID         | x | x | x | Khóa chính
 room_code     | Varchar(30)  |   |   | x | Mã phòng (Unique kết hợp floor_id)
 capacity      | Integer      |   |   | x | Sức chứa (Số giường)
 occupied_beds | Integer      |   |   | x | Số giường đã có người
 status        | Enum         |   |   | x | Trạng thái phòng
 room_pin_code | Varchar(10)  |   |   |   | Mã PIN của cửa phòng thông minh
 floor_id      | UUID         |   |   | x | FK → floors
 version       | Integer      |   |   |   | Khóa lạc quan (Optimistic Locking)
 created_at    | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at    | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng beds
 Thuộc tính  | Kiểu         | K | U | M | Diễn giải
-------------|--------------|---|---|---|-------------------------------------
 bed_id      | UUID         | x | x | x | Khóa chính
 bed_code    | Varchar(30)  |   |   | x | Mã giường (Unique kết hợp room_id)
 status      | Enum         |   |   | x | Trạng thái (AVAILABLE/OCCUPIED...)
 note        | Text         |   |   |   | Ghi chú về giường
 room_id     | UUID         |   |   | x | FK → rooms
 version     | Integer      |   |   |   | Khóa lạc quan (Optimistic Locking)
 created_at  | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at  | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng registration_periods
 Thuộc tính        | Kiểu         | K | U | M | Diễn giải
-------------------|--------------|---|---|---|-------------------------------------
 period_id         | UUID         | x | x | x | Khóa chính
 period_name       | Varchar(100) |   |   | x | Tên đợt đăng ký
 start_date        | Timestamp    |   |   | x | Thời gian bắt đầu mở form
 end_date          | Timestamp    |   |   | x | Thời gian kết thúc đóng form
 stay_start_date   | Timestamp    |   |   | x | Ngày bắt đầu tính lưu trú
 stay_end_date     | Timestamp    |   |   | x | Ngày kết thúc tính lưu trú
 is_active         | Boolean      |   |   | x | Trạng thái kích hoạt (Active)
 registration_type | Enum         |   |   | x | Loại đợt (Tân sinh viên/Sinh viên cũ)
 created_at        | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at        | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng registration_eligibilities
 Thuộc tính     | Kiểu         | K | U | M | Diễn giải
----------------|--------------|---|---|---|-------------------------------------
 eligibility_id | UUID         | x | x | x | Khóa chính
 period_id      | UUID         |   |   | x | FK → registration_periods
 cccd           | Varchar(20)  |   |   |   | Số CCCD đủ điều kiện
 full_name      | Varchar(100) |   |   |   | Họ tên
 email          | Varchar(100) |   |   | x | Email được phép đăng ký (Unique kết hợp period_id)
 student_code   | Varchar(50)  |   |   | x | MSSV (Unique kết hợp period_id)
 target         | Enum         |   |   |   | Đối tượng (Năm 1, Năm 2, ...)
 created_at     | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at     | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng dormitory_applications
 Thuộc tính              | Kiểu         | K | U | M | Diễn giải
-------------------------|--------------|---|---|---|-------------------------------------
 application_id          | UUID         | x | x | x | Khóa chính
 version                 | BigInt       |   |   | x | Khóa lạc quan phiên bản hồ sơ
 period_id               | UUID         |   |   | x | FK → registration_periods
 full_name               | Varchar(100) |   |   | x | Họ và tên ứng viên
 student_code            | Varchar(20)  |   |   |   | MSSV
 dob                     | Date         |   |   | x | Ngày sinh
 gender                  | Enum         |   |   | x | Giới tính
 cccd                    | Varchar(20)  |   |   | x | Số CCCD (Unique kết hợp period_id)
 issue_date              | Date         |   |   |   | Ngày cấp CCCD
 issue_place             | Varchar(100) |   |   |   | Nơi cấp
 email                   | Varchar(100) |   |   |   | Email liên hệ
 phone                   | Varchar(20)  |   |   |   | Số điện thoại cá nhân
 permanent_address       | Text         |   |   |   | Địa chỉ thường trú
 pob                     | Varchar(100) |   |   |   | Nơi sinh
 ethnic                  | Varchar(50)  |   |   |   | Dân tộc
 religion                | Varchar(50)  |   |   |   | Tôn giáo
 faculty                 | Varchar(100) |   |   |   | Khoa dự định học
 cohort                  | Varchar(20)  |   |   |   | Khóa học
 contact_address         | Text         |   |   |   | Địa chỉ liên hệ
 father_name             | Varchar(100) |   |   |   | Tên cha
 father_yob              | Integer      |   |   |   | Năm sinh cha
 father_job              | Varchar(100) |   |   |   | Nghề nghiệp cha
 father_phone            | Varchar(20)  |   |   |   | Số điện thoại cha
 mother_name             | Varchar(100) |   |   |   | Tên mẹ
 mother_yob              | Integer      |   |   |   | Năm sinh mẹ
 mother_job              | Varchar(100) |   |   |   | Nghề nghiệp mẹ
 mother_phone            | Varchar(20)  |   |   |   | Số điện thoại mẹ
 status                  | Enum         |   |   | x | Trạng thái xử lý hồ sơ
 priority_score          | Integer      |   |   |   | Tổng điểm ưu tiên
 application_code        | Varchar(50)  |   | x | x | Mã hồ sơ tự sinh
 registration_form_pdf_url | Text       |   |   |   | Link lưu file PDF đơn đăng ký
 commitment_form_pdf_url | Text         |   |   |   | Link file PDF bản cam kết
 reviewed_by_user_id     | UUID         |   |   |   | UUID của người duyệt
 review_note             | Text         |   |   |   | Ghi chú lúc duyệt
 commitment_accepted     | Boolean      |   |   |   | Đã đồng ý điện tử với bản cam kết
 commitment_accepted_at  | Timestamp    |   |   |   | Thời điểm đồng ý
 commitment_version      | Varchar(10)  |   |   |   | Phiên bản điều khoản ký kết
 client_ip_address       | Varchar(45)  |   |   |   | Địa chỉ IP khi nộp
 waiting_list_used       | Boolean      |   |   | x | Cờ sử dụng danh sách chờ
 payment_deadline        | Timestamp    |   |   |   | Hạn chót nộp tiền
 revision_deadline       | Timestamp    |   |   |   | Hạn chót bổ sung giấy tờ
 approved_at             | Timestamp    |   |   |   | Ngày phê duyệt
 submitted_at            | Timestamp    |   |   |   | Ngày nộp hồ sơ
 created_at              | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at              | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng application_priorities
 Thuộc tính      | Kiểu         | K | U | M | Diễn giải
-----------------|--------------|---|---|---|-------------------------------------
 priority_id     | UUID         | x | x | x | Khóa chính
 application_id  | UUID         |   |   | x | FK → dormitory_applications
 priority_type   | Enum         |   |   | x | Loại diện ưu tiên
 description     | Text         |   |   |   | Ghi chú về diện ưu tiên
 created_at      | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at      | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng verification_documents
 Thuộc tính      | Kiểu         | K | U | M | Diễn giải
-----------------|--------------|---|---|---|-------------------------------------
 document_id     | UUID         | x | x | x | Khóa chính
 application_id  | UUID         |   |   | x | FK → dormitory_applications
 document_type   | Enum         |   |   | x | Loại minh chứng (CCCD/Giấy tờ ưu tiên)
 file_url        | Text         |   |   | x | Đường dẫn lưu trữ (Cloud/Local)
 status          | Enum         |   |   | x | Trạng thái thẩm định tài liệu
 created_at      | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at      | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng dormitory_application_status_history
 Thuộc tính          | Kiểu         | K | U | M | Diễn giải
---------------------|--------------|---|---|---|-------------------------------------
 history_id          | UUID         | x | x | x | Khóa chính
 application_id      | UUID         |   |   | x | FK → dormitory_applications
 from_status         | Enum         |   |   |   | Trạng thái trước đó
 to_status           | Enum         |   |   | x | Trạng thái chuyển đổi thành
 changed_by_user_id  | UUID         |   |   |   | Người thực hiện đổi trạng thái
 changed_at          | Timestamp    |   |   | x | Thời điểm thay đổi
 note                | Text         |   |   |   | Ghi chú lý do chuyển trạng thái

Bảng student_housing_assignments
 Thuộc tính            | Kiểu         | K | U | M | Diễn giải
-----------------------|--------------|---|---|---|-------------------------------------
 assignment_id         | UUID         | x | x | x | Khóa chính phân bổ chỗ ở
 application_id        | UUID         |   |   | x | FK → dormitory_applications
 student_id            | UUID         |   |   |   | FK → students (Null khi chờ thanh toán)
 bed_id                | UUID         |   |   | x | FK → beds
 status                | Enum         |   |   | x | RESERVED/OCCUPIED/CHECKED_OUT
 room_role             | Enum         |   |   |   | Vai trò trong phòng (MEMBER/LEADER)
 reserved_at           | Timestamp    |   |   |   | Thời gian bắt đầu giữ chỗ
 check_in_at           | Timestamp    |   |   |   | Thời gian Check-in vật lý
 check_out_at          | Timestamp    |   |   |   | Thời gian Check-out vật lý
 expected_check_out_at | Timestamp    |   |   |   | Ngày dự kiến kết thúc hợp đồng
 created_at            | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at            | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng stay_extensions
 Thuộc tính              | Kiểu         | K | U | M | Diễn giải
-------------------------|--------------|---|---|---|-------------------------------------
 extension_id            | UUID         | x | x | x | Khóa chính
 student_id              | UUID         |   |   | x | FK → students
 reason                  | Text         |   |   | x | Lý do gia hạn
 status                  | Enum         |   |   | x | Trạng thái gia hạn
 registration_period_id  | UUID         |   |   | x | FK → registration_periods (Đợt gia hạn)
 current_bed_id          | UUID         |   |   | x | FK → beds (Giường hiện tại)
 contract_pdf_url        | Text         |   |   |   | Bản hợp đồng gia hạn PDF
 commitment_pdf_url      | Text         |   |   |   | Bản cam kết gia hạn PDF
 description             | Text         |   |   |   | Ghi chú phụ
 reject_reason           | Text         |   |   |   | Lý do nếu bị từ chối
 old_expected_check_out_at| Timestamp   |   |   |   | Hạn cũ
 new_expected_check_out_at| Timestamp   |   |   |   | Hạn mới (nếu thành công)
 created_at              | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at              | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng checkout_requests
 Thuộc tính             | Kiểu         | K | U | M | Diễn giải
------------------------|--------------|---|---|---|-------------------------------------
 request_id             | UUID         | x | x | x | Khóa chính
 student_id             | UUID         |   |   | x | FK → students
 assignment_id          | UUID         |   |   | x | FK → student_housing_assignments
 intended_checkout_date | Timestamp    |   |   | x | Ngày dự kiến trả phòng
 reason                 | Text         |   |   |   | Lý do trả phòng
 bank_account_number    | Varchar(50)  |   |   |   | Số tài khoản hoàn cọc
 bank_name              | Varchar(100) |   |   |   | Tên ngân hàng hoàn cọc
 status                 | Enum         |   |   | x | Trạng thái yêu cầu
 reject_reason          | Text         |   |   |   | Lý do bị từ chối duyệt
 created_at             | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at             | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng change_room_requests
 Thuộc tính             | Kiểu         | K | U | M | Diễn giải
------------------------|--------------|---|---|---|-------------------------------------
 id                     | BigInt       | x | x | x | Khóa chính
 student_id             | UUID         |   |   | x | FK → students
 current_assignment_id  | UUID         |   |   | x | FK → student_housing_assignments
 target_room_id         | UUID         |   |   |   | FK → rooms (Phòng muốn chuyển tới)
 reason                 | Text         |   |   | x | Lý do xin chuyển phòng
 admin_note             | Text         |   |   |   | Ghi chú của BQL khi xử lý
 status                 | Enum         |   |   | x | Trạng thái (PENDING/APPROVED/REJECTED)
 reviewed_by_user_id    | UUID         |   |   |   | Người xử lý đơn
 created_at             | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at             | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng curfew_requests
 Thuộc tính            | Kiểu         | K | U | M | Diễn giải
-----------------------|--------------|---|---|---|-------------------------------------
 request_id            | UUID         | x | x | x | Khóa chính đơn xin vắng/về trễ
 student_id            | UUID         |   |   | x | FK → students
 reason                | Text         |   |   | x | Lý do xin vắng
 expected_arrival_time | Timestamp    |   |   |   | Giờ dự kiến về đến (Nếu xin về trễ)
 request_type          | Enum         |   |   | x | Loại (LATE_RETURN / OVERNIGHT_ABSENCE)
 start_date            | Timestamp    |   |   |   | Ngày bắt đầu vắng mặt
 status                | Enum         |   |   | x | Trạng thái duyệt
 resolved_by           | UUID         |   |   |   | UUID người duyệt đơn
 admin_note            | Text         |   |   |   | Ghi chú của cán bộ
 created_at            | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at            | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng utility_usages
 Thuộc tính    | Kiểu         | K | U | M | Diễn giải
---------------|--------------|---|---|---|-------------------------------------
 id            | UUID         | x | x | x | Khóa chính
 room_id       | UUID         |   |   | x | FK → rooms (Phòng tiêu thụ)
 utility_type  | Enum         |   |   | x | Loại (ELECTRICITY/WATER)
 month         | Integer      |   |   |   | Tháng chốt số
 year          | Integer      |   |   |   | Năm chốt số
 old_reading   | Integer      |   |   |   | Chỉ số cũ đầu kì
 new_reading   | Integer      |   |   |   | Chỉ số mới cuối kì
 total_usage   | Integer      |   |   |   | Tổng lượng tiêu thụ
 is_settled    | Boolean      |   |   | x | Cờ đã tạo hóa đơn / tất toán (Mặc định false)
 version       | Integer      |   |   |   | Khóa lạc quan (Chống cập nhật đụng độ)
 created_at    | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at    | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng bills
 Thuộc tính      | Kiểu         | K | U | M | Diễn giải
-----------------|--------------|---|---|---|-------------------------------------
 bill_id         | UUID         | x | x | x | Khóa chính
 bill_type       | Enum         |   |   | x | Loại phí (ROOM_FEE/UTILITY/OTHER)
 amount          | Decimal      |   |   | x | Tổng số tiền phải trả
 paid_amount     | Decimal      |   |   | x | Số tiền đã thanh toán
 status          | Enum         |   |   | x | Trạng thái (UNPAID/PAID/OVERDUE)
 due_date        | Date         |   |   |   | Hạn chót thanh toán
 description     | Text         |   |   |   | Ghi chú nội dung thu tiền
 assignment_id   | UUID         |   |   |   | FK (Khóa ngoại lỏng lẻo) tham chiếu nơi ở
 application_id  | UUID         |   |   |   | FK tham chiếu hồ sơ (đối với tiền cọc)
 room_id         | UUID         |   |   |   | FK tham chiếu phòng (Tiền điện nước)
 student_id      | UUID         |   |   |   | FK tham chiếu người chịu trách nhiệm trả
 version         | BigInt       |   |   |   | Chống thanh toán đúp
 created_at      | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at      | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng payments
 Thuộc tính             | Kiểu         | K | U | M | Diễn giải
------------------------|--------------|---|---|---|-------------------------------------
 payment_id             | UUID         | x | x | x | Khóa chính giao dịch
 bill_id                | UUID         |   |   | x | FK → bills
 amount                 | Decimal      |   |   | x | Số tiền chuyển
 method                 | Enum         |   |   | x | Hình thức (BANK_TRANSFER/CASH)
 status                 | Enum         |   |   | x | Trạng thái giao dịch
 transaction_code       | Varchar(100) |   | x | x | Mã đối soát tự sinh (VD: Thanh toán SDMS 123)
 gateway_transaction_id | Varchar(100) |   |   |   | Mã tham chiếu trả về từ SePay/Ngân hàng
 description            | Text         |   |   |   | Ghi chú thêm
 gateway_metadata       | Text         |   |   |   | JSON payload gốc lưu log
 paid_at                | Timestamp    |   |   |   | Thời gian hoàn tất nộp tiền
 created_at             | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at             | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng gates
 Thuộc tính    | Kiểu         | K | U | M | Diễn giải
---------------|--------------|---|---|---|-------------------------------------
 gate_id       | UUID         | x | x | x | Khóa chính
 name          | Varchar(100) |   |   | x | Tên thiết bị cổng
 gate_type     | Enum         |   |   | x | ENTRY_GATE / ROOM_LOCK
 building_id   | UUID         |   |   |   | Nằm ở tòa nhà nào
 room_id       | UUID         |   |   |   | Nằm ở phòng nào (nếu là khóa phòng)
 mac_address   | Varchar(30)  |   |   |   | Địa chỉ MAC nhận diện IoT
 is_active     | Boolean      |   |   | x | Hoạt động không
 created_at    | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at    | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng curfew_policies
 Thuộc tính    | Kiểu         | K | U | M | Diễn giải
---------------|--------------|---|---|---|-------------------------------------
 id            | UUID         | x | x | x | Khóa chính
 building_id   | UUID         |   |   | x | FK → buildings (Áp dụng cho tòa nào)
 resident_type | Enum         |   |   | x | Áp dụng cho loại (ALL/FRESHMAN...)
 start_time    | Time         |   |   | x | Giờ bắt đầu lệnh giới nghiêm
 end_time      | Time         |   |   | x | Giờ kết thúc
 type          | Enum         |   |   | x | Loại giới nghiêm (SOFT/HARD)
 priority      | Integer      |   |   | x | Độ ưu tiên nếu có nhiều chính sách
 is_active     | Boolean      |   |   | x | Kích hoạt
 created_at    | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at    | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng time_window_policies
 Thuộc tính    | Kiểu         | K | U | M | Diễn giải
---------------|--------------|---|---|---|-------------------------------------
 id            | UUID         | x | x | x | Khóa chính
 building_id   | UUID         |   |   | x | FK → buildings
 resident_type | Enum         |   |   | x | Đối tượng (MALE/FEMALE)
 start_time    | Time         |   |   | x | Giờ mở cửa tự do
 end_time      | Time         |   |   | x | Giờ đóng cửa tự do
 is_active     | Boolean      |   |   | x | Kích hoạt
 created_at    | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at    | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng access_history
 Thuộc tính       | Kiểu         | K | U | M | Diễn giải
------------------|--------------|---|---|---|-------------------------------------
 id               | UUID         | x | x | x | Khóa chính
 student_id       | UUID         |   |   | x | Người cố gắng mở cửa
 gate_id          | UUID         |   |   | x | Mở cửa ở đâu
 building_id      | UUID         |   |   | x | Tại tòa nhà nào
 operator_id      | UUID         |   |   |   | Ai can thiệp thủ công (Nếu có)
 event_timestamp  | Timestamp    |   |   | x | Thời điểm quẹt thẻ/nhận diện
 decision         | Enum         |   |   | x | GRANTED / DENIED
 denial_reason    | Varchar(255) |   |   |   | Lý do từ chối (Quá giờ, Sai thẻ...)
 method           | Enum         |   |   | x | Phương thức (FACE / RFID / PIN)
 direction        | Enum         |   |   |   | Hướng (IN / OUT / UNKNOWN)
 snapshot_url     | Text         |   |   |   | URL ảnh chụp camera tại lúc truy cập
 created_at       | Timestamp    |   |   | x | Bất biến, chỉ thêm log

Bảng face_profiles
 Thuộc tính               | Kiểu         | K | U | M | Diễn giải
--------------------------|--------------|---|---|---|-------------------------------------
 profile_id               | UUID         | x | x | x | Khóa chính
 student_id               | UUID         |   | x | x | Đảm bảo 1 Sinh viên - 1 Face Profile
 face_image_url           | Varchar(500) |   |   |   | URL hình hợp lệ cuối cùng
 pending_face_image_url   | Varchar(500) |   |   |   | URL hình mới đang chờ xét duyệt
 replacement_requested_at | Timestamp    |   |   |   | Thời gian nộp xin đổi ảnh
 status                   | Enum         |   |   | x | Trạng thái (PENDING/APPROVED/REJECTED)
 rejection_reason         | Text         |   |   |   | Lý do quản trị viên từ chối
 approved_by              | UUID         |   |   |   | Người phê duyệt
 approved_at              | Timestamp    |   |   |   | Thời gian phê duyệt
 created_at               | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at               | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng face_embeddings
 Thuộc tính    | Kiểu         | K | U | M | Diễn giải
---------------|--------------|---|---|---|-------------------------------------
 embedding_id  | UUID         | x | x | x | Khóa chính
 profile_id    | UUID         |   | x | x | FK → face_profiles
 vector        | vector(512)  |   |   | x | Dữ liệu Vector PostgreSQL sinh trắc học
 created_at    | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at    | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

Bảng face_verification_attempts
 Thuộc tính       | Kiểu         | K | U | M | Diễn giải
------------------|--------------|---|---|---|-------------------------------------
 attempt_id       | UUID         | x | x | x | Khóa chính ghi log
 gate_device_id   | Varchar(100) |   |   | x | Định danh thiết bị IoT gửi yêu cầu
 profile_id       | UUID         |   |   |   | Hồ sơ nghi ngờ khớp
 confidence_score | Decimal      |   |   |   | Điểm Cosine Similarity (Chỉ để log/audit)
 status           | Enum         |   |   | x | SUCCESS / FAIL / TIMEOUT
 attempted_at     | Timestamp    |   |   | x | Thời gian xử lý nhận diện AI

Bảng notifications
 Thuộc tính        | Kiểu         | K | U | M | Diễn giải
-------------------|--------------|---|---|---|-------------------------------------
 id                | BigInt       | x | x | x | Khóa chính
 user_id           | UUID         |   |   |   | User nhận trong app
 title             | Varchar(255) |   |   | x | Tiêu đề chuông báo
 message           | Text         |   |   | x | Nội dung
 action_url        | Varchar(255) |   |   |   | Nơi chuyển hướng khi nhấn
 notification_type | Enum         |   |   | x | INFO / WARNING / SYSTEM
 is_read           | Boolean      |   |   | x | Đã đọc chưa
 read_at           | Timestamp    |   |   |   | Đọc lúc nào
 recipient         | Varchar(100) |   |   |   | SDT/Email gửi ngoài
 channel           | Enum         |   |   |   | IN_APP / EMAIL / SMS
 status            | Enum         |   |   |   | PENDING / SENT / FAILED
 error_message     | Text         |   |   |   | Lỗi từ dịch vụ ngoài
 event_id          | Varchar(100) |   |   |   | Định danh gửi từ Webhook
 sent_at           | Timestamp    |   |   |   | Thời gian đã gửi thành công
 created_at        | Timestamp    |   |   | x | Thời gian tạo bản ghi
 updated_at        | Timestamp    |   |   | x | Thời gian cập nhật bản ghi

──────
``### Phần 3 — 3.3.2.3 Ràng buộc dữ liệu (RBTK)

[RBTK-01] Cột `student_code` (MSSV) và cột `cccd` trong bảng `students` phải là duy nhất. 
[RBTK-02] Cấu trúc phân cấp tòa nhà: Cột `floor_number` trong bảng `floors` kết hợp với `building_id` phải là duy nhất. Tương tự, `room_code` kết hợp với `floor_id` trong `rooms` phải là duy nhất, `bed_code` kết hợp với `room_id` trong `beds` phải là duy nhất để tránh tạo vật chất sai lệch định danh.
[RBTK-03] Cơ chế Optimistic Locking (Khóa lạc quan): Tại bảng `beds` và `rooms` bắt buộc phải có thuộc tính `version`. Thuộc tính này sẽ tăng lên sau mỗi transaction, đảm bảo khi xảy ra nhiều yêu cầu chiếm giường (Race Condition) trong giờ đăng ký cao điểm, hệ thống ngăn chặn tuyệt đối tình trạng Overbooking.
[RBTK-04] Cột trạng thái `status` trong `student_housing_assignments` chỉ nhận một trong ba giá trị: `RESERVED`, `OCCUPIED`, `CHECKED_OUT`.
[RBTK-05] Cột `student_id` trong `student_housing_assignments` cho phép `NULL` khi `status = RESERVED` (do sinh viên có thể chưa xác thực thanh toán), nhưng bắt buộc phải là `NOT NULL` khi trạng thái là `OCCUPIED`.
[RBTK-06] Tại bảng `dormitory_applications`, cặp thuộc tính `(period_id, cccd)` tạo thành một `UniqueConstraint` ở CSDL để đảm bảo một người không thể tạo hai hồ sơ trong cùng một đợt tuyển sinh.
[RBTK-07] Bảng thanh toán `payments`: Cột `transaction_code` phải `UNIQUE`. Giúp ngăn chặn xử lý cộng tiền hai lần (Idempotency) từ Webhook của SePay.
[RBTK-08] Ở bảng Sinh trắc học: Cột `student_id` trong `face_profiles` phải là duy nhất để bảo đảm quyền sở hữu 1-1. Tương tự, cột `profile_id` trong `face_embeddings` cũng phải là duy nhất để mapping 1-1 qua vector.
[RBTK-09] Tính bất biến của Log dữ liệu: Bảng `access_history` và `face_verification_attempts` được định nghĩa là dữ liệu sổ cái IoT, không cung cấp cơ chế cập nhật (Chỉ có thể `INSERT`, không thể `UPDATE` hay `DELETE`).
[RBTK-10] Cột `role` trong `user_accounts` chỉ nhận: `ADMIN`, `STAFF`, `STUDENT`.
[RBTK-11] Cột `building_id` trong `curfew_policies` và `time_window_policies` bắt buộc tồn tại và tham chiếu đến `buildings`.
[RBTK-12] Cột `status` trong `bills` chỉ nhận các giá trị: `UNPAID`, `PARTIAL`, `PAID`, `OVERDUE`, `CANCELLED`.
[RBTK-13] Trong bảng `registration_eligibilities`, phải duy trì 2 unique index để kiểm duyệt đầu vào: `(period_id, student_code)` và `(period_id, email)`.
[RBTK-14] Tại bảng `checkout_requests`, `intended_checkout_date` luôn phải được thiết lập (`NOT NULL`).
[RBTK-15] Bảng `stay_extensions` buộc giá trị `registration_period_id` và `current_bed_id` không được phép để trống. Lấy làm cơ sở check đụng độ kỳ mới.
``