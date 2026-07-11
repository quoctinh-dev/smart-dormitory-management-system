# Ma trận Tính điểm Ưu tiên
**Phiên bản:** 1.0 · **Ngày:** 2026-06-25

Tài liệu này định nghĩa các hạng mục ưu tiên, điểm số tương ứng, và các quy tắc xác minh giấy tờ cần thiết. Điểm ưu tiên là một trong những tiêu chí cốt lõi để xét duyệt đơn đăng ký và xếp hạng sinh viên trong danh sách chờ.

---

| Hạng mục | Điểm | Loại giấy tờ yêu cầu (`VerificationDocumentType`) | Quy tắc xác minh |
| :--- | :---: | :--- | :--- |
| **Con liệt sĩ** | **100** | `MARTYR_CERTIFICATE` | Giấy tờ phải trùng khớp với tên cha/mẹ của người nộp đơn. |
| **Con thương binh, bệnh binh** | **95** | `WOUNDED_SOLDIER_CERTIFICATE` | Phải xác minh được tình trạng hợp lệ của thẻ thương binh/bệnh binh của cha/mẹ. |
| **Sinh viên khuyết tật** | **90** | `DISABILITY_CERTIFICATE` | Giấy chứng nhận do Ủy ban Nhân dân cấp xã/phường cấp. |
| **Mồ côi cả cha lẫn mẹ** | **85** | `ORPHAN_CERTIFICATE` / Giấy chứng tử | Cần xác nhận cả cha và mẹ đều đã qua đời. |
| **Hộ nghèo / Hộ cận nghèo** | **80** | `POVERTY_CERTIFICATE` | Sổ hộ nghèo/cận nghèo phải có giá trị trong năm hiện tại. |
| **Dân tộc thiểu số** | **70** | `ETHNIC_CERTIFICATE` | Giấy khai sinh xác nhận dân tộc. |
| **Vùng sâu, vùng xa, biên giới, hải đảo** | **60** | `REMOTE_AREA_CERTIFICATE` | Giấy tờ (ví dụ: CT08) xác nhận hộ khẩu thường trú tại khu vực đặc biệt khó khăn. |
| **Đảng viên Đảng Cộng sản Việt Nam** | **50** | `PARTY_MEMBER_CERTIFICATE` | Thẻ Đảng viên hoặc giấy xác nhận của chi bộ. |

### Ghi chú về Nghiệp vụ:
*   **Đa hạng mục:** Một sinh viên có thể thuộc nhiều hạng mục ưu tiên. Tổng điểm ưu tiên sẽ là tổng điểm của tất cả các hạng mục đã được xác minh là hợp lệ.
*   **Xác minh:** Điểm chỉ được tính khi giấy tờ minh chứng (`VerificationDocument`) tương ứng được Admin xác nhận là `VALID` (Hợp lệ).
*   **Sử dụng:** Điểm ưu tiên được dùng để:
    1.  Sắp xếp thứ tự trong hàng đợi xét duyệt.
    2.  Sắp xếp thứ tự trong `WAITING_LIST` (Danh sách chờ) khi hết phòng. Những người có điểm cao hơn và nộp đơn sớm hơn sẽ được ưu tiên khi có phòng trống.
