package org.itcen.domain.common.repository;

import org.itcen.domain.common.entity.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 첨부파일 레포지토리 인터페이스
 * 
 * 첨부파일 데이터 액세스를 담당하는 레포지토리입니다.
 * JpaRepository를 확장하여 기본 CRUD 기능을 제공하고,
 * 첨부파일 특화된 쿼리 메서드를 추가로 정의합니다.
 * 
 * 설계 원칙:
 * - Interface Segregation: 첨부파일 관련 데이터 액세스만 담당
 * - Dependency Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 */
@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {

    /**
     * 엔티티 타입과 엔티티 ID로 첨부파일 목록 조회
     * 
     * @param entityType 엔티티 타입 (예: 'submission')
     * @param entityId 엔티티 ID
     * @return 해당 엔티티의 첨부파일 목록 (생성일시 기준 정렬)
     */
    @Query("SELECT a FROM Attachment a WHERE a.entityType = :entityType AND a.entityId = :entityId AND (a.deletedYn IS NULL OR a.deletedYn = 'N') ORDER BY a.createdAt ASC")
    List<Attachment> findByEntityTypeAndEntityIdOrderByCreatedAtAsc(
            @Param("entityType") String entityType, 
            @Param("entityId") Long entityId);

    /**
     * 엔티티 타입과 엔티티 ID로 첨부파일 개수 조회
     * 
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 첨부파일 개수
     */
    @Query("SELECT COUNT(a) FROM Attachment a WHERE a.entityType = :entityType AND a.entityId = :entityId AND (a.deletedYn IS NULL OR a.deletedYn = 'N')")
    long countByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    /**
     * 저장된 파일명으로 첨부파일 조회
     * 
     * @param storedName 저장된 파일명
     * @return 첨부파일 (있으면)
     */
    Optional<Attachment> findByStoredName(String storedName);

    /**
     * 엔티티 타입과 엔티티 ID로 첨부파일 존재 여부 확인
     * 
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     * @return 존재 여부
     */
    boolean existsByEntityTypeAndEntityId(String entityType, Long entityId);

    /**
     * 업로드자로 첨부파일 목록 조회
     * 
     * @param uploadedBy 업로드자 ID
     * @return 업로드자의 첨부파일 목록 (생성일시 기준 역순 정렬)
     */
    @Query("SELECT a FROM Attachment a WHERE a.uploadedBy = :uploadedBy AND (a.deletedYn IS NULL OR a.deletedYn = 'N') ORDER BY a.createdAt DESC")
    List<Attachment> findByUploadedByOrderByCreatedAtDesc(@Param("uploadedBy") String uploadedBy);

    /**
     * 특정 엔티티의 첨부파일 일괄 삭제
     * 
     * @param entityType 엔티티 타입
     * @param entityId 엔티티 ID
     */
    @Query("DELETE FROM Attachment a WHERE a.entityType = :entityType AND a.entityId = :entityId")
    void deleteByEntityTypeAndEntityId(@Param("entityType") String entityType, @Param("entityId") Long entityId);

    /**
     * 여러 첨부파일 ID로 일괄 삭제
     * 
     * @param attachIds 첨부파일 ID 목록
     */
    @Query("DELETE FROM Attachment a WHERE a.attachId IN :attachIds")
    void deleteByAttachIdIn(@Param("attachIds") List<Long> attachIds);

    /**
     * 파일 경로로 첨부파일 목록 조회 (파일 정리용)
     * 
     * @param filePath 파일 경로
     * @return 해당 경로의 첨부파일 목록
     */
    @Query("SELECT a FROM Attachment a WHERE a.filePath = :filePath")
    List<Attachment> findByFilePath(@Param("filePath") String filePath);

    /**
     * 특정 기간 이전의 첨부파일 조회 (정리용)
     * 
     * @param beforeDate 기준 날짜
     * @return 기준 날짜 이전의 첨부파일 목록
     */
    @Query("SELECT a FROM Attachment a WHERE a.createdAt < :beforeDate ORDER BY a.createdAt ASC")
    List<Attachment> findByCreatedAtBefore(@Param("beforeDate") java.time.LocalDateTime beforeDate);

}