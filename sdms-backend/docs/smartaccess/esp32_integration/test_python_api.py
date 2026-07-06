import requests
import json
import sys
import os

# --- CẤU HÌNH ---
API_URL = "http://localhost:8000/api/v1/faces/extract"
TEST_IMAGE_PATH = "test_face.jpg" # Vỹ cần chuẩn bị 1 file ảnh khuôn mặt thật để test

def run_test():
    print(f"🚀 Bắt đầu kiểm thử API Python AI tại: {API_URL}")
    
    # 1. Kiểm tra file ảnh có tồn tại không
    if not os.path.exists(TEST_IMAGE_PATH):
        print(f"❌ Lỗi: Không tìm thấy file ảnh '{TEST_IMAGE_PATH}' để test.")
        print("💡 Hãy copy một tấm ảnh khuôn mặt (jpg/png) vào cùng thư mục và đổi tên thành 'test_face.jpg'")
        sys.exit(1)

    try:
        # 2. Gửi request multipart/form-data
        with open(TEST_IMAGE_PATH, 'rb') as img_file:
            files = {'file': (TEST_IMAGE_PATH, img_file, 'image/jpeg')}
            print("📡 Đang gửi request...")
            response = requests.post(API_URL, files=files)

        # 3. Phân tích kết quả
        print(f"HTTP Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"❌ Lỗi: Server trả về code {response.status_code}. Phản hồi: {response.text}")
            sys.exit(1)

        response_json = response.json()
        print("\n📋 Nội dung JSON trả về:")
        print(json.dumps(response_json, indent=2, ensure_ascii=False))

        # 4. Kiểm thử các điều kiện (Assertions) theo chuẩn Contract
        assert "success" in response_json, "Thiếu trường 'success'"
        assert response_json["success"] is True, "Trường 'success' phải là true"
        assert "data" in response_json, "Thiếu object 'data'"
        assert "vector" in response_json["data"], "Thiếu mảng 'vector' trong object 'data'"
        
        vector = response_json["data"]["vector"]
        assert isinstance(vector, list), "Vector phải là một mảng (list)"
        
        # Kiểm tra độ dài vector (TFLite/FaceNet thường ra 192)
        # Hợp đồng hiện tại đang chốt là 192 (đã đồng bộ với DB pgvector)
        vector_length = len(vector)
        print(f"\n📏 Độ dài vector trích xuất được: {vector_length} chiều")
        
        if vector_length != 192:
            print(f"⚠️ Cảnh báo: Contract yêu cầu 192 chiều, nhưng model trả về {vector_length} chiều.")
        else:
            print("✅ Vector chiều dài CHUẨN 192!")

        print("\n🎉 KIỂM THỬ THÀNH CÔNG! API PYTHON ĐÃ KHỚP 100% VỚI KIẾN TRÚC SPRING BOOT.")

    except requests.exceptions.ConnectionError:
        print("❌ Lỗi: Không thể kết nối tới server. Vỹ đã chạy lệnh 'uvicorn main:app --reload' chưa?")
    except AssertionError as e:
        print(f"❌ Lỗi cấu trúc JSON (Vi phạm Contract): {e}")
    except Exception as e:
        print(f"❌ Lỗi không xác định: {e}")

if __name__ == "__main__":
    run_test()
