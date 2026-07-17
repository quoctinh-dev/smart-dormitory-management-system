package com.sdms.backend.modules.face.entity;

import com.sdms.backend.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Lưu trữ vector sinh trắc học 512 chiều cho FaceProfile ĐÃ DUYỆT.
 *
 * <p>Quyền sở hữu: Chỉ thuộc Module Face.
 * Dữ liệu vector KHÔNG ĐƯỢC phơi bày ra ngoài module này.
 * Smart Access tiêu thụ {@code FaceSyncReadyEvent}, chứ không phải vector thô.
 *
 * <p>Thư viện Vector: {@code org.hibernate.orm:hibernate-vector} (6.6.49.Final).
 * Hibernate 6 map {@code float[]} trực tiếp với PostgreSQL {@code vector(512)}.
 * Không cần thêm annotation {@code @Type}.
 *
 * <p><b>float[] vs double[]:</b> {@code float[]} (32-bit) được sử dụng một cách có chủ ý.
 * Một {@code double[]} 512 chiều sẽ tốn 4 KB mỗi dòng so với 2 KB của {@code float[]}.
 * Các mô hình AI (ArcFace, MobileFaceNet) xuất ra float 32-bit — không bị mất độ chính xác.
 *
 * <p>Tìm kiếm tương đồng được thực thi qua native SQL trong {@code FaceEmbeddingRepository}:
 * {@code ORDER BY embedding_vector <=> ?::vector LIMIT 1}
 *
 * <p>Chỉ mục HNSW ({@code vector_cosine_ops}) được tạo bởi Flyway DDL —
 * JPA {@code @Index} không hỗ trợ các loại chỉ mục không phải BTree.
 */
@Entity
@Table(name = "face_embeddings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FaceEmbedding extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "embedding_id", updatable = false, nullable = false)
    private UUID embeddingId;

    /**
     * Khóa ngoại 1:1 tới root aggregate FaceProfile.
     * Ràng buộc UNIQUE đảm bảo mỗi hồ sơ chỉ có một vector.
     */
    @Column(name = "profile_id", nullable = false, unique = true)
    private UUID profileId;

    /**
     * Vector sinh trắc học 512 chiều.
     * float[] (32-bit) map trực tiếp với PostgreSQL vector(512) qua hibernate-vector.
     */
    @Column(name = "vector", nullable = false, columnDefinition = "vector(512)")
    private float[] embeddingVector;
}
