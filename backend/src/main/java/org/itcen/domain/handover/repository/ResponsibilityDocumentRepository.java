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
     * 작성자별 책무기술서 조회 (JOIN 포함)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "LEFT JOIN FETCH rd.author " +
           "WHERE rd.authorEmpNo = :authorEmpNo")
    List<ResponsibilityDocument> findByAuthorEmpNoWithJoin(@Param("authorEmpNo") String authorEmpNo);

    /**
     * 작성자별 책무기술서 조회
     */
    List<ResponsibilityDocument> findByAuthorEmpNo(String authorEmpNo);

    /**
     * 최신 문서 조회
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "ORDER BY rd.createdAt DESC")
    List<ResponsibilityDocument> findByPositionIdOrderByCreatedAtDesc();

    /**
     * 최신 문서 조회 (효력일 기준)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "ORDER BY rd.effectiveDate DESC")
    Optional<ResponsibilityDocument> findLatestByPositionId();

    /**
     * 문서 제목과 버전으로 조회
     */
    Optional<ResponsibilityDocument> findByDocumentTitleAndDocumentVersion(String documentTitle, String documentVersion);

    /**
     * 유효한 문서 조회 (현재 날짜 기준)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "WHERE (rd.effectiveDate IS NULL OR rd.effectiveDate <= :currentDate) " +
           "AND (rd.expiryDate IS NULL OR rd.expiryDate > :currentDate)")
    List<ResponsibilityDocument> findValidDocuments(@Param("currentDate") LocalDate currentDate);

    /**
     * 만료 예정 문서 조회
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "WHERE rd.expiryDate BETWEEN :startDate AND :endDate")
    List<ResponsibilityDocument> findExpiringDocuments(@Param("startDate") LocalDate startDate,
                                                       @Param("endDate") LocalDate endDate);

    /**
     * 최근 문서 조회 (결재 대기용)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "ORDER BY rd.createdAt ASC")
    List<ResponsibilityDocument> findPendingApprovalDocuments();

    /**
     * 복합 조건 검색 (JOIN 포함 - 첨부파일, 작성자, 결재정보 포함)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd " +
           "LEFT JOIN FETCH rd.author a " +
           "LEFT JOIN FETCH rd.attachments att " +
           "WHERE (:authorEmpNo IS NULL OR rd.authorEmpNo LIKE %:authorEmpNo%) AND " +
           "(:documentTitle IS NULL OR rd.documentTitle LIKE %:documentTitle%)")
    Page<ResponsibilityDocument> findBySearchCriteriaWithJoin(@Param("authorEmpNo") String authorEmpNo,
                                                              @Param("documentTitle") String documentTitle,
                                                              Pageable pageable);

    /**
     * 복합 조건 검색 (결재정보 포함) - Native Query 사용
     */
    @Query(value = "SELECT rd.document_id, rd.document_title, rd.document_version, " +
           "rd.document_content, rd.effective_date, rd.expiry_date, " +
           "rd.author_emp_no, e.emp_name as author_name, " +
           "rd.created_at, rd.updated_at, rd.created_id, rd.updated_id, " +
           "COALESCE(ap.appr_stat_cd, 'NONE') as approval_status, " +
           "ap.approval_id, ap.requester_id, ap.approver_id, ap.approval_datetime, " +
           "COALESCE(att_count.attachment_count, 0) as attachment_count " +
           "FROM responsibility_documents rd " +
           "LEFT JOIN employee e ON rd.author_emp_no = e.emp_no " +
           "LEFT JOIN approval ap ON rd.document_id = ap.task_id AND ap.task_type_cd = 'responsibility_documents' " +
           "LEFT JOIN (SELECT entity_id, COUNT(*) as attachment_count FROM attachments WHERE entity_type = 'responsibility_documents' GROUP BY entity_id) att_count " +
           "ON rd.document_id = att_count.entity_id " +
           "WHERE (COALESCE(:authorEmpNo, '') = '' OR rd.author_emp_no LIKE CONCAT('%', :authorEmpNo, '%') OR e.emp_name LIKE CONCAT('%', :authorEmpNo, '%')) AND " +
           "(COALESCE(:documentTitle, '') = '' OR rd.document_title LIKE CONCAT('%', :documentTitle, '%')) " +
           "ORDER BY rd.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM responsibility_documents rd " +
                       "LEFT JOIN employee e ON rd.author_emp_no = e.emp_no " +
                       "WHERE (COALESCE(:authorEmpNo, '') = '' OR rd.author_emp_no LIKE CONCAT('%', :authorEmpNo, '%') OR e.emp_name LIKE CONCAT('%', :authorEmpNo, '%')) AND " +
                       "(COALESCE(:documentTitle, '') = '' OR rd.document_title LIKE CONCAT('%', :documentTitle, '%'))",
           nativeQuery = true)
    Page<Object[]> findBySearchCriteriaWithApproval(@Param("authorEmpNo") String authorEmpNo,
                                                    @Param("documentTitle") String documentTitle,
                                                    Pageable pageable);

    /**
     * 복합 조건 검색 (기존 버전 유지)
     */
    @Query("SELECT rd FROM ResponsibilityDocument rd WHERE " +
           "(:authorEmpNo IS NULL OR rd.authorEmpNo LIKE %:authorEmpNo%) AND " +
           "(:documentTitle IS NULL OR rd.documentTitle LIKE %:documentTitle%)")
    Page<ResponsibilityDocument> findBySearchCriteria(@Param("authorEmpNo") String authorEmpNo,
                                                      @Param("documentTitle") String documentTitle,
                                                      Pageable pageable);

    /**
     * 전체 문서 통계
     */
    @Query("SELECT COUNT(rd) FROM ResponsibilityDocument rd")
    Long getTotalDocumentCount();

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