package org.itcen.domain.handover.repository;

import org.itcen.domain.handover.entity.ResponsibilityDocument;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 책무기술서 Repository
 * 책무기술서 데이터 접근을 담당
 *
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 */
@Repository
public interface ResponsibilityDocumentRepository extends JpaRepository<ResponsibilityDocument, Long> {

    

    /**
     * 상태별 책무기술서 조회 (JOIN 포함)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "LEFT JOIN FETCH rd.author " +
           "LEFT JOIN FETCH rd.reviewer " +
           "LEFT JOIN FETCH rd.approver " +
           "WHERE rd.status = :status")
    List<ResponsibilityDocument> findByStatusWithJoin(@Param("status") ResponsibilityDocument.DocumentStatus status);

    /**
     * 상태별 책무기술서 조회
     */
    List<ResponsibilityDocument> findByStatus(ResponsibilityDocument.DocumentStatus status);

    /**
     * 작성자별 책무기술서 조회 (JOIN 포함)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "LEFT JOIN FETCH rd.author " +
           "LEFT JOIN FETCH rd.reviewer " +
           "LEFT JOIN FETCH rd.approver " +
           "WHERE rd.authorEmpNo = :authorEmpNo")
    List<ResponsibilityDocument> findByAuthorEmpNoWithJoin(@Param("authorEmpNo") String authorEmpNo);

    /**
     * 작성자별 책무기술서 조회
     */
    List<ResponsibilityDocument> findByAuthorEmpNo(String authorEmpNo);

    /**
     * 직책과 상태로 최신 문서 조회
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE rd.status = :status " +
           "ORDER BY rd.createdAt DESC")
    List<ResponsibilityDocument> findByPositionIdAndStatusOrderByCreatedAtDesc(@Param("status") ResponsibilityDocument.DocumentStatus status);

    /**
     * 직책의 최신 발행 문서 조회
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE rd.status = 'PUBLISHED' " +
           "ORDER BY rd.effectiveDate DESC")
    Optional<ResponsibilityDocument> findLatestPublishedByPositionId();

    /**
     * 문서 제목과 버전으로 조회
     */
    Optional<ResponsibilityDocument> findByDocumentTitleAndDocumentVersion(String documentTitle, String documentVersion);

    /**
     * 유효한 문서 조회 (현재 날짜 기준)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE rd.status = 'PUBLISHED' " +
           "AND (rd.effectiveDate IS NULL OR rd.effectiveDate <= :currentDate) " +
           "AND (rd.expiryDate IS NULL OR rd.expiryDate > :currentDate)")
    List<ResponsibilityDocument> findValidDocuments(@Param("currentDate") LocalDate currentDate);

    /**
     * 만료 예정 문서 조회
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE rd.status = 'PUBLISHED' " +
           "AND rd.expiryDate BETWEEN :startDate AND :endDate")
    List<ResponsibilityDocument> findExpiringDocuments(@Param("startDate") LocalDate startDate,
                                                       @Param("endDate") LocalDate endDate);

    /**
     * 승인 대기중인 문서 조회
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE rd.status IN ('REVIEW', 'APPROVED') " +
           "ORDER BY rd.createdAt ASC")
    List<ResponsibilityDocument> findPendingApprovalDocuments();

    /**
     * 복합 조건 검색 (JOIN 포함)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "LEFT JOIN FETCH rd.author a " +
           "LEFT JOIN FETCH rd.reviewer r " +
           "LEFT JOIN FETCH rd.approver ap " +
           "WHERE (:status IS NULL OR rd.status = :status) AND " +
           "(:authorEmpNo IS NULL OR rd.authorEmpNo LIKE %:authorEmpNo%) AND " +
           "(:documentTitle IS NULL OR rd.documentTitle LIKE %:documentTitle%)")
    Page<ResponsibilityDocument> findBySearchCriteriaWithJoin(@Param("status") ResponsibilityDocument.DocumentStatus status,
                                                              @Param("authorEmpNo") String authorEmpNo,
                                                              @Param("documentTitle") String documentTitle,
                                                              Pageable pageable);

    /**
     * 복합 조건 검색 (기존 버전 유지)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE " +
           "(:status IS NULL OR rd.status = :status) AND " +
           "(:authorEmpNo IS NULL OR rd.authorEmpNo LIKE %:authorEmpNo%) AND " +
           "(:documentTitle IS NULL OR rd.documentTitle LIKE %:documentTitle%)")
    Page<ResponsibilityDocument> findBySearchCriteria(@Param("status") ResponsibilityDocument.DocumentStatus status,
                                                      @Param("authorEmpNo") String authorEmpNo,
                                                      @Param("documentTitle") String documentTitle,
                                                      Pageable pageable);

    /**
     * 상태별 문서 통계
     */
    @Query("SELECT rd.status, COUNT(rd) FROM ResponsibilityDocument rd GROUP BY rd.status")
    List<Object[]> getDocumentStatistics();

    /**
     * 월별 문서 생성 통계
     */
    @Query("SELECT YEAR(rd.createdAt), MONTH(rd.createdAt), COUNT(rd) " +
           "FROM ResponsibilityDocument rd " +
           "GROUP BY YEAR(rd.createdAt), MONTH(rd.createdAt) " +
           "ORDER BY YEAR(rd.createdAt) DESC, MONTH(rd.createdAt) DESC")
    List<Object[]> getMonthlyCreationStatistics();

    /**
     * 작성자별 문서 수 조회
     */
    @Query("SELECT rd.authorEmpNo, COUNT(rd) FROM ResponsibilityDocument rd " +
           "WHERE rd.authorEmpNo IS NOT NULL GROUP BY rd.authorEmpNo")
    List<Object[]> countByAuthor();

    /**
     * 중복 문서 체크 (같은 직책, 같은 제목, 다른 ID)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE " +
           "rd.documentTitle = :documentTitle AND rd.documentId != :excludeId")
    List<ResponsibilityDocument> findDuplicateDocuments(@Param("documentTitle") String documentTitle,
                                                        @Param("excludeId") Long excludeId);

}