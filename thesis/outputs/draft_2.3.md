2.3 PHÂN TÍCH YÊU CẦU

Để xây dựng hệ thống quản lý phù hợp với thực tế tại Ký túc xá (KTX) Trường Đại học Công nghệ Sài Gòn (STU), việc khảo sát hiện trạng và phân tích các quy trình nghiệp vụ đang được áp dụng là bước quan trọng nhằm xác định những hạn chế của phương pháp quản lý hiện tại cũng như nhu cầu cần được hỗ trợ bởi hệ thống. Trên cơ sở đó, đề tài đề xuất các quy trình nghiệp vụ mới và mô hình hóa bằng các lưu đồ nhằm phục vụ cho quá trình phân tích và thiết kế hệ thống.

2.3.1 Các quy trình, nghiệp vụ

**a) Khảo sát hiện trạng quy trình thực tế tại KTX STU**

Theo kết quả khảo sát thực tế và các quy chế vận hành Ký túc xá STU (chi tiết xem tại Phụ lục D), hoạt động quản lý tại ký túc xá hiện nay chủ yếu được thực hiện bằng hồ sơ giấy kết hợp với bảng tính Excel. Một số quy trình nghiệp vụ chính như sau:

**Quy trình đăng ký và xét duyệt lưu trú**
Hằng năm, Ban Quản lý Ký túc xá tổ chức tiếp nhận hồ sơ đăng ký lưu trú của sinh viên. Sinh viên chuẩn bị hồ sơ theo quy định và nộp trực tiếp tại văn phòng. Sau khi tiếp nhận, Ban Quản lý kiểm tra tính hợp lệ của hồ sơ, đối chiếu các đối tượng ưu tiên và nhập thông tin vào bảng tính để quản lý.
Quy trình này đòi hỏi nhiều thao tác thủ công, mất nhiều thời gian xử lý, đồng thời việc lưu trữ hồ sơ giấy gây khó khăn trong quá trình tra cứu và thống kê dữ liệu.

**Quy trình thu phí và quản lý điện nước**
Các khoản phí lưu trú được thông báo theo từng đợt và sinh viên thực hiện thanh toán bằng tiền mặt hoặc chuyển khoản theo quy định của Nhà trường. Sau khi thanh toán, Ban Quản lý tiến hành đối chiếu chứng từ và cập nhật trạng thái thanh toán bằng phương pháp thủ công.
Đối với tiền điện, nhân viên ghi nhận chỉ số công tơ của từng phòng để tính toán chi phí sử dụng. Việc tổng hợp và theo dõi số liệu bằng bảng tính có thể phát sinh sai sót và làm tăng thời gian đối soát.

**Quy trình quản lý phòng ở và an ninh**
Ban Quản lý theo dõi tình trạng lưu trú của sinh viên thông qua Trưởng phòng. Việc điểm danh, ghi nhận sinh viên vắng mặt và báo cáo hằng ngày vẫn được thực hiện thủ công.
Bên cạnh đó, công tác kiểm soát người ra vào ký túc xá chủ yếu dựa vào lực lượng bảo vệ, chưa có hệ thống hỗ trợ xác thực và lưu trữ lịch sử ra vào một cách tự động.

**b) Đề xuất giải pháp và các quy trình hệ thống (SDMS)**

Từ kết quả khảo sát hiện trạng, có thể nhận thấy nhiều quy trình quản lý vẫn được thực hiện thủ công, dẫn đến thời gian xử lý kéo dài, khó quản lý dữ liệu tập trung và hạn chế khả năng tra cứu thông tin. Vì vậy, đề tài đề xuất xây dựng Hệ thống Quản lý Ký túc xá Thông minh (SDMS) nhằm hỗ trợ số hóa các nghiệp vụ quản lý trong phạm vi nghiên cứu của luận văn.

Theo giới hạn của đề tài đã trình bày tại Mục 1.3.3, hệ thống tập trung xây dựng các chức năng phục vụ các nghiệp vụ chính như đăng ký lưu trú, gia hạn lưu trú, chuyển phòng, thanh toán phí, trả phòng và kiểm soát ra vào. Các nghiệp vụ khác như quản lý kỷ luật, quản lý tài sản và các hoạt động hành chính nội bộ không thuộc phạm vi phát triển của hệ thống.

**Phân loại nhóm người dùng (Actors)**
Hệ thống gồm các nhóm người sử dụng sau:
- **Sinh viên:** Thực hiện đăng ký lưu trú, gia hạn lưu trú, thanh toán các khoản phí, theo dõi kết quả xét duyệt, xem thông tin phòng ở và sử dụng các chức năng được cấp quyền.
- **Khách:** Truy cập cổng thông tin để xem các thông báo, nội quy, biểu phí và các hướng dẫn liên quan đến ký túc xá.
- **Ban Quản lý:** Quản lý hồ sơ sinh viên, xét duyệt đăng ký, bố trí phòng ở, theo dõi tình trạng lưu trú, quản lý thanh toán và quản trị hệ thống.
- **Thiết bị kiểm soát ra vào:** Thực hiện xác thực sinh viên khi ra vào ký túc xá và ghi nhận lịch sử ra vào phục vụ công tác quản lý.
- **Hệ thống SePay:** Tiếp nhận thông tin giao dịch chuyển khoản ngân hàng và đồng bộ trạng thái thanh toán với hệ thống.

**Lưu đồ các quy trình nghiệp vụ**
Dựa trên các yêu cầu nghiệp vụ đã phân tích, hệ thống được mô hình hóa bằng các lưu đồ nhằm mô tả trình tự xử lý của từng nghiệp vụ. Các lưu đồ là cơ sở cho việc phân tích và thiết kế các chức năng của hệ thống.

1. Sơ đồ quy trình đăng ký và xét duyệt lưu trú.
*(Chèn sơ đồ Flowchart)*

2. Sơ đồ quy trình gia hạn lưu trú.
*(Chèn sơ đồ Flowchart)*

3. Sơ đồ quy trình chuyển phòng.
*(Chèn sơ đồ Flowchart)*

4. Sơ đồ quy trình thanh toán phí lưu trú.
*(Chèn sơ đồ Flowchart)*

5. Sơ đồ quy trình trả phòng.
*(Chèn sơ đồ Flowchart)*

6. Sơ đồ quy trình kiểm soát ra vào ký túc xá.
*(Chèn sơ đồ Flowchart)*

2.3.2 Sơ đồ chức năng
Sơ đồ chức năng mô tả các nhóm chức năng chính của hệ thống và mối quan hệ giữa các phân hệ. Đây là cơ sở để xác định phạm vi chức năng của hệ thống trước khi tiến hành thiết kế chi tiết.
*(Chèn Hình: functional_diagram.xml)*

2.3.3 Sơ đồ Use Case tổng quát
Sơ đồ Use Case tổng quát mô tả mối quan hệ giữa các nhóm người sử dụng và các chức năng chính của hệ thống. Thông qua sơ đồ này có thể xác định phạm vi tương tác của từng tác nhân đối với hệ thống.
*(Chèn Hình 2.4 – Sơ đồ Use Case tổng quát)*
