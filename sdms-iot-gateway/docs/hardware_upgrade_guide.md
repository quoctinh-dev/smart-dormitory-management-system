# HƯỚNG DẪN NÂNG CẤP PHẦN CỨNG: KHÓA TỪ (MAGNETIC LOCK) CHUẨN FAIL-SAFE

Tài liệu này hướng dẫn cách nâng cấp sa bàn đồ án từ việc sử dụng Động cơ Servo cơ học (chuẩn Fail-Secure - nguy hiểm khi cháy nổ) sang sử dụng Khóa nam châm điện (chuẩn Fail-Safe - mất điện cửa tự mở). Áp dụng cho cả **Cổng Tòa nhà** và **Cửa Phòng ngủ**.

---

## 1. DANH SÁCH MUA SẮM (SHOPPING LIST)

Bạn có thể tìm mua các món này trên Shopee, Lazada hoặc các tiệm linh kiện điện tử (như Nhật Tảo).
*(Giá bên dưới là ước tính để tham khảo)*

### 1. Khóa Nam Châm Điện Mini 12V (Lực hút 60kg)
- **Tên tìm kiếm:** Khóa hút nam châm điện mini 12V 60kg (Magnetic Lock 60kg).
- **Mô tả:** Khóa gồm 2 cục sắt. Cục lớn có dây điện (là nam châm), cục nhỏ mỏng hơn để dính vào cánh cửa. Cấp điện 12V thì nó hút cực mạnh. Ngắt điện thì nó rớt ra.
- **Số lượng:** 2 bộ (1 cho cổng chính, 1 cho cửa phòng).
- **Giá:** ~150.000 VNĐ / bộ.

### 2. Cục Nguồn Adapter 12V - 2A (hoặc 5A)
- **Tên tìm kiếm:** Nguồn Adapter 12V 2A hoặc 12V 5A chân tròn.
- **Mô tả:** Nó y hệt cục sạc Laptop hoặc cục nguồn cắm cục phát WiFi nhà bạn. Bạn cắm 1 đầu vào ổ điện 220V trên tường, đầu kia nó ra điện 12V an toàn. **(Tuyệt đối không lấy nguồn 12V từ cổng USB của ESP32, sẽ làm cháy chip).**
- **Số lượng:** 1 cục (loại 5A có thể chia điện ra kéo 2 khóa cùng lúc, hoặc mua 2 cục 2A riêng).
- **Cần thêm:** Jack DC cái nối dây (Jack DC female 5.5x2.1mm) vặn ốc để dễ đấu dây điện từ cục nguồn ra ngoài.

### 3. Module Relay 1 Kênh 5V (Có Opto Cách Ly)
- **Tên tìm kiếm:** Module Relay 1 kênh 5V kích mức cao/thấp.
- **Mô tả:** Là một cái bo mạch nhỏ màu đỏ/xanh, bên trên có cục hình chữ nhật (rơ-le). Nó đóng vai trò làm "công tắc điện" chịu tải nặng thay cho con chip ESP32 yếu đuối. Đầu ra của nó luôn có 3 lỗ vặn ốc (COM, NO, NC).
- **Số lượng:** 2 cái.
- **Giá:** ~15.000 VNĐ / cái.

---

## 2. HƯỚNG DẪN LẮP RÁP CƠ KHÍ (LÊN SA BÀN)

1. **Khung đứng yên (Vách / Tường):** Dùng ốc vít (hoặc keo dán sắt/băng keo xốp 2 mặt siêu dính) để cố định **Cục Nam Châm Điện (cục có dây)**.
2. **Cánh cửa di chuyển:** Cố định **Miếng sắt (Bản lề)** lên cánh cửa.
3. **Căn chỉnh:** Đóng cửa lại, vuốt cho bề mặt miếng sắt ốp sát phẳng lỳ vào mặt nam châm. (Nếu hở 1 ly thì lực hút sẽ giảm rất nhiều).

---

## 3. SƠ ĐỒ ĐẤU NỐI ĐIỆN (WIRING DIAGRAM - CHUẨN FAIL-SAFE)

**Khái niệm cực kỳ quan trọng:** Đấu Fail-Safe bắt buộc phải dùng cổng **NC (Normally Closed - Thường đóng)** trên Relay.

### Bước 3.1: Nối Mạch Relay vào Mạch ESP32 (Tín hiệu điều khiển)
Trên Module Relay có 3 chân cắm nhỏ (VCC, GND, IN):
- Nối chân **VCC** của Relay -> Cắm vào chân **VIN (hoặc 5V)** của ESP32.
- Nối chân **GND** của Relay -> Cắm vào chân **GND** của ESP32.
- Nối chân **IN** (hoặc SIG) của Relay -> Cắm vào chân tín hiệu xuất lệnh của ESP32 (Chân mà bạn đang cắm dây màu vàng của Servo cũ).

### Bước 3.2: Nối Điện 12V cho Khóa Từ thông qua Relay
Cắt đôi sợi dây của cục Nguồn Adapter 12V (hoặc dùng Jack DC cái vặn ốc) để có 2 đầu dây: Dương (+) màu đỏ, và Âm (-) màu đen.

- **Dây ÂM (-):** Nối dây Âm của cục Nguồn 12V vào thẳng dây Âm của Khóa Nam Châm. (Quấn băng keo điện lại).
- **Dây DƯƠNG (+):** 
  1. Lấy dây Dương của cục Nguồn 12V nhét vào lỗ **COM** trên Relay, vặn chặt ốc.
  2. Lấy dây Dương của Khóa Nam Châm nhét vào lỗ **NC** trên Relay, vặn chặt ốc.

### 4. NGUYÊN LÝ HOẠT ĐỘNG
- **Bình thường (Đang khóa):** Chip ESP32 xuất tín hiệu `LOW`. Relay nằm im, dòng điện 12V chảy qua cổng NC vào khóa -> Cửa bị hít chặt.
- **Có người quẹt thẻ đúng:** Chip ESP32 xuất tín hiệu `HIGH`. Relay kêu "Cạch" một tiếng, ngắt điện ở cổng NC (chuyển sang NO) -> Khóa bị cắt điện, rớt từ tính -> Cửa mở.
- **Có hỏa hoạn, mất điện toàn bộ:** Relay mất điện, cục Adapter mất điện -> Khóa mất điện -> Cửa bung ra cho người chạy thoát.

---

## 5. THAY ĐỔI CODE (SAU KHI LẮP XONG)
Khi phần cứng hoàn thiện, hãy báo cho AI Developer (Agent) để tiến hành gỡ bỏ các đoạn code cồng kềnh của thư viện Servo, và đổi hàm mở cửa thành:

```cpp
void openDoor() {
    digitalWrite(RELAY_PIN, HIGH); // Ngắt rơ-le mở cửa
    // ...
}
```
