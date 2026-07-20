import os
import shutil
from datetime import datetime

def backup_thesis(target_file="thesis.docx", backup_dir="backup"):
    print(f"[*] Đang thực hiện sao lưu file {target_file}...")
    
    if not os.path.exists(target_file):
        print(f"[!] Lỗi: Không tìm thấy file {target_file} để sao lưu.")
        return False
        
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"[*] Đã tạo thư mục sao lưu: {backup_dir}")
        
    # Tạo tên file backup với timestamp
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    base_name = os.path.basename(target_file)
    name, ext = os.path.splitext(base_name)
    backup_filename = f"{name}_{timestamp}{ext}"
    backup_path = os.path.join(backup_dir, backup_filename)
    
    # Copy file
    shutil.copy2(target_file, backup_path)
    print(f"[OK] Đã sao lưu thành công vào: {backup_path}")
    return True

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Script sao lưu file Word luận văn")
    parser.add_argument("--target", default="thesis.docx", help="Đường dẫn file Word cần sao lưu")
    parser.add_argument("--dir", default="backup", help="Thư mục chứa file sao lưu")
    
    args = parser.parse_args()
    backup_thesis(args.target, args.dir)
