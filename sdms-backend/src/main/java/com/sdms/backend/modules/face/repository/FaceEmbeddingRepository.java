package com.sdms.backend.modules.face.repository;

import com.sdms.backend.modules.face.entity.FaceEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

/**
 * Repository cho {@link FaceEmbedding}.
 *
 * <p>Quyền sở hữu: Chỉ thuộc Module Face.
 * Vector thô không bao giờ được phơi bày ra ngoài module này.
 * Smart Access tiêu thụ {@code FaceSyncReadyEvent} — không phải vector trực tiếp.
 *
 * <p><b>Ràng buộc quản trị ngưỡng:</b> Repository này KHÔNG chứa logic ngưỡng.
 * Ngưỡng cosine similarity (ví dụ: 0.8) là trách nhiệm độc quyền
 * của Service Layer ({@code FaceVerificationService}), không phải repository này.
 */
@Repository
public interface FaceEmbeddingRepository extends JpaRepository<FaceEmbedding, UUID> {

    /**
     * Tìm kiếm vector cho một hồ sơ cụ thể.
     * Được sử dụng bởi {@code FaceAiOrchestrator} để kiểm tra xem quá trình trích xuất đã xảy ra chưa.
     */
    Optional<FaceEmbedding> findByProfileId(UUID profileId);

    /**
     * Xóa vector cho một hồ sơ cụ thể.
     * Được sử dụng bởi FaceProfileService trong quá trình thay thế Atomic Swap.
     * Sử dụng truy vấn @Modifying để bỏ qua entity fetching (thất bại do lỗi mapping pgvector).
     */
    @Modifying
    @Query("DELETE FROM FaceEmbedding e WHERE e.profileId = :profileId")
    void deleteByProfileId(@Param("profileId") UUID profileId);

    /**
     * Thực thi tìm kiếm nearest-neighbor cosine similarity của pgvector với tất cả
     * các vector khuôn mặt ĐÃ DUYỆT và trả về ID hồ sơ của khớp nối gần nhất.
     *
     * <p><b>Ràng buộc quản trị ngưỡng:</b> Truy vấn này cố ý trả về một
     * khớp gần nhất MÀ KHÔNG áp dụng bộ lọc ngưỡng. Service Layer gọi tới
     * ({@code FaceVerificationService}) chịu trách nhiệm duy nhất cho việc đánh giá
     * liệu khoảng cách trả về có thỏa mãn ngưỡng chấp nhận hay không.
     *
     * <p><b>Định dạng Vector:</b> {@code queryVector} phải là chuỗi literal vector PostgreSQL
     * ví dụ: {@code "[0.1,0.2,...,0.5]"}, được cast qua {@code ::vector} trong truy vấn.
     *
     * <p><b>Chỉ mục:</b> Yêu cầu chỉ mục HNSW ({@code idx_face_embeddings_vector})
     * trên cột {@code vector}, được tạo bởi Flyway migration.
     *
     * @param queryVector chuỗi vector 512 chiều từ AI Engine
     * @return profile_id và khoảng cách cosine của vector gần nhất, hoặc empty nếu không tìm thấy
     */
    @Query(value = """
            SELECT fe.profile_id AS profileId,
                   (fe.vector <=> CAST(:queryVector AS vector)) AS distance
            FROM face_embeddings fe
            JOIN face_profiles fp ON fe.profile_id = fp.profile_id
            WHERE fp.status = 'APPROVED'
            ORDER BY fe.vector <=> CAST(:queryVector AS vector) ASC
            LIMIT 1
            """,
            nativeQuery = true)
    Optional<VectorMatchResult> findNearestMatch(@Param("queryVector") String queryVector);

    /**
     * Giao diện Projection cho kết quả truy vấn độ tương đồng vector.
     * Tách biệt kết quả truy vấn thô khỏi entity {@link FaceEmbedding}.
     *
     * <p>Service Layer đọc {@code getDistance()} và áp dụng ngưỡng riêng của nó.
     */
    interface VectorMatchResult {
        UUID getProfileId();
        Double getDistance();
    }
}
