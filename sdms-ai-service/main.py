import io
import logging
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional
from PIL import Image
import torch
from facenet_pytorch import MTCNN, InceptionResnetV1

# ---------------------------------------------------------
# 1. SETUP LOGGING & APP
# ---------------------------------------------------------
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("AI-Face-Engine")

app = FastAPI(
    title="SDMS Face Extraction API (512-D)",
    description="Microservice trích xuất vector khuôn mặt 512 chiều sử dụng Facenet (InceptionResnetV1) và MTCNN.",
    version="3.0.0",
)

# ---------------------------------------------------------
# 2. INITIALIZE AI MODELS
# ---------------------------------------------------------
device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
logger.info(f"Khởi tạo AI Model trên thiết bị: {device}")

try:
    # MTCNN để phát hiện khuôn mặt và cắt (Face Detection & Alignment)
    # margin=20 để lấy thêm phần rìa khuôn mặt, keep_all=False để chỉ lấy mặt bự nhất
    mtcnn = MTCNN(
        image_size=160, margin=20, keep_all=False, 
        min_face_size=60, thresholds=[0.6, 0.7, 0.7], device=device
    )
    
    # InceptionResnetV1 để trích xuất đặc trưng (Feature Extraction -> 512 dimensions)
    resnet = InceptionResnetV1(pretrained='vggface2').eval().to(device)
    logger.info("Load model Facenet (512 dimensions) và MTCNN thành công!")
except Exception as e:
    logger.error(f"Lỗi khởi tạo mô hình: {e}")
    raise RuntimeError(f"Model initialization failed: {e}")

# ---------------------------------------------------------
# 3. SCHEMAS
# ---------------------------------------------------------
class VectorData(BaseModel):
    vector: List[float]

class AiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[VectorData] = None

# ---------------------------------------------------------
# 4. API ENDPOINTS
# ---------------------------------------------------------
@app.get("/")
def health_check():
    return {"status": "ok", "service": "SDMS Face AI Engine", "model": "Facenet-512"}

@app.post("/api/v1/faces/extract", response_model=AiResponse)
async def extract_face(file: UploadFile = File(...)):
    """
    Nhận file ảnh, detect khuôn mặt, align và trích xuất vector 512 chiều.
    """
    logger.info(f"Nhận request trích xuất ảnh: {file.filename}")
    
    if not file.content_type.startswith("image/"):
        return JSONResponse(status_code=400, content={"success": False, "message": "File không phải định dạng ảnh", "data": None})
    
    try:
        # 1. Đọc file vào bộ nhớ
        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # 2. Phát hiện và căn chỉnh khuôn mặt (Face Detection & Alignment)
        face_tensor = mtcnn(image)
        
        if face_tensor is None:
            logger.warning("Không tìm thấy khuôn mặt trong ảnh (No face detected).")
            # Trả về 400 Bad Request theo chuẩn của Backend
            return JSONResponse(
                status_code=400, 
                content={
                    "success": False, 
                    "message": "No face detected in the image. Khuôn mặt quá nhỏ, bị che khuất hoặc không có thật.", 
                    "data": None
                }
            )
            
        # 3. Trích xuất Vector 512 chiều (Feature Extraction)
        # face_tensor có shape [3, 160, 160]. Cần thêm batch dimension -> [1, 3, 160, 160]
        face_tensor = face_tensor.unsqueeze(0).to(device)
        
        with torch.no_grad():
            embeddings = resnet(face_tensor)
            
        # Normalize L2 để tiện tính Cosine Similarity (Chuẩn hóa vector)
        embeddings = torch.nn.functional.normalize(embeddings, p=2, dim=1)
        
        # Chuyển tensor thành Python list
        vector_list = embeddings[0].cpu().numpy().tolist()
        
        # Kiểm tra độ dài
        if len(vector_list) != 512:
            logger.error(f"Lỗi hệ thống: Vector trích ra không phải 512 chiều (thực tế: {len(vector_list)})")
            return JSONResponse(status_code=500, content={"success": False, "message": "Internal Model Error: Vector dimension mismatch", "data": None})
            
        logger.info("Trích xuất thành công vector 512 chiều!")
        
        return AiResponse(
            success=True,
            message="Face extracted successfully",
            data=VectorData(vector=vector_list)
        )
        
    except Exception as e:
        logger.error(f"Lỗi trong quá trình xử lý ảnh: {str(e)}")
        return JSONResponse(
            status_code=500, 
            content={"success": False, "message": f"Processing error: {str(e)}", "data": None}
        )
