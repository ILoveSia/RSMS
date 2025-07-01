package org.itcen.domain.qna.repository;

import org.itcen.domain.qna.entity.QnaAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Q&A 첨부파일 Repository 인터페이스
 * 
 * Q&A 첨부파일 엔티티에 대한 데이터 접근을 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A 첨부파일 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
@Repository
public interface QnaAttachmentRepository extends JpaRepository<QnaAttachment, Long> {

    /**
     * Q&A ID로 첨부파일 목록 조회
     * 
     * @param qnaId Q&A ID
     * @return 첨부파일 목록
     */
    @Query("SELECT a FROM QnaAttachment a WHERE a.qna.id = :qnaId ORDER BY a.createdAt")
    List<QnaAttachment> findByQnaId(@Param("qnaId") Long qnaId);

    /**
     * 업로드한 사용자별 첨부파일 목록 조회
     * 
     * @param uploadedBy 업로드한 사용자 ID
     * @return 첨부파일 목록
     */
    @Query("SELECT a FROM QnaAttachment a WHERE a.uploadedBy = :uploadedBy ORDER BY a.createdAt DESC")
    List<QnaAttachment> findByUploadedBy(@Param("uploadedBy") String uploadedBy);

    /**
     * 저장된 파일명으로 첨부파일 조회
     * 
     * @param storedFilename 저장된 파일명
     * @return 첨부파일
     */
    Optional<QnaAttachment> findByStoredFilename(String storedFilename);

    /**
     * Q&A ID와 첨부파일 ID로 첨부파일 조회
     * 
     * @param qnaId Q&A ID
     * @param attachmentId 첨부파일 ID
     * @return 첨부파일
     */
    @Query("SELECT a FROM QnaAttachment a WHERE a.qna.id = :qnaId AND a.id = :attachmentId")
    Optional<QnaAttachment> findByQnaIdAndId(@Param("qnaId") Long qnaId, @Param("attachmentId") Long attachmentId);

    /**
     * 특정 Q&A의 첨부파일 개수 조회
     * 
     * @param qnaId Q&A ID
     * @return 첨부파일 개수
     */
    @Query("SELECT COUNT(a) FROM QnaAttachment a WHERE a.qna.id = :qnaId")
    Long countByQnaId(@Param("qnaId") Long qnaId);

    /**
     * 특정 사용자가 업로드한 첨부파일 개수 조회
     * 
     * @param uploadedBy 업로드한 사용자 ID
     * @return 첨부파일 개수
     */
    @Query("SELECT COUNT(a) FROM QnaAttachment a WHERE a.uploadedBy = :uploadedBy")
    Long countByUploadedBy(@Param("uploadedBy") String uploadedBy);

    /**
     * 특정 Q&A의 총 파일 크기 조회
     * 
     * @param qnaId Q&A ID
     * @return 총 파일 크기 (bytes)
     */
    @Query("SELECT COALESCE(SUM(a.fileSize), 0) FROM QnaAttachment a WHERE a.qna.id = :qnaId")
    Long getTotalFileSizeByQnaId(@Param("qnaId") Long qnaId);

    /**
     * 특정 사용자가 업로드한 총 파일 크기 조회
     * 
     * @param uploadedBy 업로드한 사용자 ID
     * @return 총 파일 크기 (bytes)
     */
    @Query("SELECT COALESCE(SUM(a.fileSize), 0) FROM QnaAttachment a WHERE a.uploadedBy = :uploadedBy")
    Long getTotalFileSizeByUploadedBy(@Param("uploadedBy") String uploadedBy);

    /**
     * 특정 파일 타입의 첨부파일 목록 조회
     * 
     * @param contentType 파일 타입
     * @return 첨부파일 목록
     */
    List<QnaAttachment> findByContentTypeContaining(String contentType);

    /**
     * 특정 크기 이상의 첨부파일 목록 조회
     * 
     * @param fileSize 파일 크기 (bytes)
     * @return 첨부파일 목록
     */
    @Query("SELECT a FROM QnaAttachment a WHERE a.fileSize >= :fileSize ORDER BY a.fileSize DESC")
    List<QnaAttachment> findByFileSizeGreaterThanEqual(@Param("fileSize") Long fileSize);

    /**
     * Q&A ID 목록으로 첨부파일 목록 조회
     * 
     * @param qnaIds Q&A ID 목록
     * @return 첨부파일 목록
     */
    @Query("SELECT a FROM QnaAttachment a WHERE a.qna.id IN :qnaIds ORDER BY a.qna.id, a.createdAt")
    List<QnaAttachment> findByQnaIdIn(@Param("qnaIds") List<Long> qnaIds);

    /**
     * Q&A ID로 첨부파일 삭제
     * 
     * @param qnaId Q&A ID
     */
    void deleteByQnaId(Long qnaId);
}