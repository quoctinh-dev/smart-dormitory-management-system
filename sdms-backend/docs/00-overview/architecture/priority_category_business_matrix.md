# SDMS Priority Category Business Matrix (v1.0)

Bản tài liệu này chuẩn hóa ma trận đối tượng ưu tiên (Priority Category Matrix) của hệ thống SDMS, được trích xuất chính xác từ **Mục III. ĐỐI TƯỢNG ƯU TIÊN** trên Phiếu đăng ký lưu trú Ký túc xá thực tế của Trường Đại học Công nghệ Sài Gòn (STU).

---

## MA TRẬN NHÓM ƯU TIÊN CHÍNH THỨC (STU OFFICIAL PRIORITY MATRIX)

| Mã nhóm ưu tiên | Nội dung / Tên nhóm ưu tiên | Giấy tờ minh chứng yêu cầu (Priority Documents) | Điều kiện xác nhận & Quy tắc duyệt (Verification Rules) |
| :--- | :--- | :--- | :--- |
| **PRIORITY_01** | Con liệt sĩ, con thương binh, bệnh binh, con của người hưởng chính sách như thương binh. | 1. Thẻ thương binh/bệnh binh của cha/mẹ.<br>2. Giấy chứng nhận gia đình liệt sĩ.<br>3. Giấy khai sinh của sinh viên (để chứng minh quan hệ). | Thông tin họ tên người đứng tên trên thẻ thương binh/liệt sĩ phải khớp với tên Cha hoặc Mẹ khai báo trong hồ sơ gia đình của sinh viên. |
| **PRIORITY_02** | Con đẻ của người hoạt động kháng chiến bị nhiễm chất độc hóa học. | 1. Quyết định/Giấy chứng nhận người hoạt động kháng chiến bị nhiễm chất độc hóa học.<br>2. Giấy khai sinh của sinh viên. | Thông tin người nhiễm chất độc hóa học phải khớp với Cha hoặc Mẹ khai báo trong hồ sơ gia đình của sinh viên. |
| **PRIORITY_03** | Sinh viên là người dân tộc thiểu số. | 1. Bản sao Giấy khai sinh hợp lệ.<br>2. Hoặc Căn cước công dân thể hiện rõ thành phần dân tộc khác dân tộc Kinh. | Thành phần dân tộc được ghi trên CCCD hoặc Giấy khai sinh của sinh viên không phải là dân tộc "Kinh". |
| **PRIORITY_04** | Sinh viên có hộ khẩu thường trú và sinh sống tại xã khó khăn, vùng sâu vùng xa, biên giới, hải đảo; Sinh viên thuộc diện xóa đói giảm nghèo (hộ nghèo, cận nghèo). | 1. Sổ hộ nghèo/cận nghèo còn hiệu lực của năm hiện tại.<br>2. Hoặc Giấy xác nhận thông tin cư trú (CT08) thể hiện địa chỉ thường trú tại xã khó khăn/vùng đặc biệt khó khăn theo quy định hiện hành. | Sổ hộ nghèo phải được cấp bởi chính quyền địa phương cấp Phường/Xã/Thị trấn và còn hạn dùng cho năm xét duyệt lưu trú. |
| **PRIORITY_05** | Sinh viên khuyết tật; Sinh viên mồ côi cả cha lẫn mẹ không nơi nương tựa. | 1. Giấy xác nhận khuyết tật do Ủy ban nhân dân cấp xã cấp.<br>2. Hoặc Giấy chứng tử của cả cha và mẹ; hoặc quyết định tuyên bố mất tích/tòa án xác nhận không người đỡ đầu. | Giấy xác nhận khuyết tật phải khớp với tên sinh viên. Giấy chứng tử của cả cha và mẹ phải khớp với tên cha mẹ khai trong hồ sơ. |
| **PRIORITY_06** | Sinh viên là Đảng viên Đảng Cộng sản Việt Nam, bộ đội, công an đã hoàn tất nghĩa vụ xuất ngũ. | 1. Quyết định kết nạp Đảng viên / Thẻ Đảng viên.<br>2. Hoặc Quyết định xuất ngũ đối với bộ đội, công an nghĩa vụ. | Thông tin trên quyết định hoặc thẻ phải khớp với thông tin cá nhân của sinh viên nộp đơn. |
| **PRIORITY_07** | Sinh viên tham gia hoạt động công tác xã hội (Cán bộ đoàn, hội, đội trưởng hoặc thành viên tích cực khác...). | 1. Quyết định bổ nhiệm chức vụ (Bí thư, Lớp trưởng, Đội trưởng...).<br>2. Hoặc Giấy khen, Giấy xác nhận đóng góp tích cực do Đoàn trường / Hội sinh viên trường cấp. | Thời gian công tác hoặc thành tích đóng góp phải nằm trong năm học gần nhất hoặc học kỳ trước đó. |

---

## CHÍNH SÁCH ĐIỂM ƯU TIÊN VÀ XẾP HÀNG (PRIORITY SCORING SYSTEM)

1.  **Multiple Priorities:** Sinh viên được phép chọn nhiều đối tượng ưu tiên khác nhau khi nộp hồ sơ trực tuyến.
2.  **Verification Rule:** Mỗi đối tượng ưu tiên yêu cầu một tài liệu minh chứng riêng biệt (được lưu trong `PriorityDocument`). Điểm số ưu tiên chỉ được cộng sau khi tài liệu minh chứng tương ứng được Người duyệt (Staff/Admin) cập nhật trạng thái là `VALID`.
3.  **Database Mapping:** Các đối tượng ưu tiên của sinh viên được lưu dưới dạng danh sách liên kết $1:N$ trong bảng `application_priorities` trỏ đến `dormitory_applications`.
4.  **Priority Calculation:** Điểm ưu tiên của hồ sơ được tính toán bằng giá trị lớn nhất của đối tượng ưu tiên được duyệt hợp lệ. Điểm số của từng đối tượng tuân thủ theo thang điểm của Quy chế lưu trú KTX Trường Đại học Công nghệ Sài Gòn (STU).
