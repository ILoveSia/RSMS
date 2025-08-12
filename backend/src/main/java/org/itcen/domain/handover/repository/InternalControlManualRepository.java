package org.itcen.domain.handover.repository;

import org.itcen.domain.handover.entity.InternalControlManual;
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
 * 내부통제 업무메뉴얼 Repository
 * 내부통제 업무메뉴얼 데이터 접근을 담당
 * 
 * SOLID 원칙:
 * - Single Responsibility: 내부통제 메뉴얼 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 */
@Repository
public interface InternalControlManualRepository extends JpaRepository<InternalControlManual, Long> {

    /**
     * 부서코드로 메뉴얼 조회
     */
    List<InternalControlManual> findByDeptCd(String deptCd);

    // status 컬럼 삭제로 인해 제거됨

    /**
     * 작성자별 메뉴얼 조회
     */
    List<InternalControlManual> findByAuthorEmpNo(String authorEmpNo);

    /**
     * 부서별 최신 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd " +
           "ORDER BY icm.createdAt DESC")
    List<InternalControlManual> findByDeptCdOrderByCreatedAtDesc(@Param("deptCd") String deptCd);

    /**
     * 부서의 최신 메뉴얼 조회 (효력일 기준)
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd " +
           "ORDER BY icm.effectiveDate DESC")
    List<InternalControlManual> findLatestByDept(@Param("deptCd") String deptCd);

    /**
     * 메뉴얼 제목과 버전으로 조회
     */
    Optional<InternalControlManual> findByManualTitleAndManualVersion(String manualTitle, String manualVersion);

    /**
     * 유효한 메뉴얼 조회 (현재 날짜 기준)
     */
    @Query("SELECT icm FROM InternalControlManual icm " +
           "WHERE (icm.effectiveDate IS NULL OR icm.effectiveDate <= :currentDate) " +
           "AND (icm.expiryDate IS NULL OR icm.expiryDate > :currentDate)")
    List<InternalControlManual> findValidManuals(@Param("currentDate") LocalDate currentDate);

    /**
     * 만료 예정 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm " +
           "WHERE icm.expiryDate <= :targetDate")
    List<InternalControlManual> findExpiringManuals(@Param("targetDate") LocalDate targetDate);

    /**
     * 최근 메뉴얼 조회 (결재 대기용)
     */
    @Query("SELECT icm FROM InternalControlManual icm " +
           "ORDER BY icm.createdAt ASC")
    List<InternalControlManual> findPendingApprovalManuals();

    /**
     * 복합 조건 검색
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE " +
           "(:deptCd IS NULL OR icm.deptCd = :deptCd) AND " +
           "(:authorEmpNo IS NULL OR icm.authorEmpNo LIKE %:authorEmpNo%) AND " +
           "(:manualTitle IS NULL OR icm.manualTitle LIKE %:manualTitle%) AND " +
           "(:manualVersion IS NULL OR icm.manualVersion = :manualVersion) AND " +
           "(:effectiveDate IS NULL OR icm.effectiveDate = :effectiveDate) AND " +
           "(:expiryDate IS NULL OR icm.expiryDate = :expiryDate)")
    Page<InternalControlManual> searchManuals(@Param("deptCd") String deptCd,
                                             @Param("manualTitle") String manualTitle,
                                             @Param("authorEmpNo") String authorEmpNo,
                                             @Param("manualVersion") String manualVersion,
                                             @Param("effectiveDate") LocalDate effectiveDate,
                                             @Param("expiryDate") LocalDate expiryDate,
                                             Pageable pageable);

    /**
     * 전체 메뉴얼 통계
     */
    @Query("SELECT COUNT(icm) FROM InternalControlManual icm")
    Long getTotalManualCount();

    /**
     * 부서별 메뉴얼 통계
     */
    @Query("SELECT icm.deptCd, COUNT(icm) FROM InternalControlManual icm GROUP BY icm.deptCd")
    List<Object[]> getManualStatisticsByDept();

    /**
     * 중복 메뉴얼 체크 (같은 부서, 같은 제목, 다른 ID)
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd " +
           "AND icm.manualTitle = :manualTitle AND icm.manualId != :excludeId")
    List<InternalControlManual> findDuplicateManuals(@Param("deptCd") String deptCd,
                                                     @Param("manualTitle") String manualTitle,
                                                     @Param("excludeId") Long excludeId);

    /**
     * 복합 조건 검색 (결재정보 포함) - Native Query 사용
     */
    @Query(value = "SELECT icm.manual_id, icm.dept_cd, d.department_name as dept_name, icm.manual_title, icm.manual_version, " +
           "icm.manual_content, icm.effective_date, icm.expiry_date, " +
           "icm.author_emp_no, e.emp_name as author_name, " +
           "icm.created_at, icm.updated_at, icm.created_id, icm.updated_id, " +
           "COALESCE(ap.appr_stat_cd, 'NONE') as approval_status, " +
           "ap.approval_id, ap.requester_id, ap.approver_id, ap.approval_datetime, " +
           "COALESCE(att_count.attachment_count, 0) as attachment_count " +
           "FROM internal_control_manuals icm " +
           "LEFT JOIN employee e ON icm.author_emp_no = e.emp_no " +
           "LEFT JOIN departments d ON icm.dept_cd = d.department_id " +
           "LEFT JOIN approval ap ON icm.manual_id = ap.task_id AND ap.task_type_cd = 'internal_control_manuals' " +
           "LEFT JOIN (SELECT entity_id, COUNT(*) as attachment_count FROM attachments WHERE entity_type = 'internal_control_manuals' GROUP BY entity_id) att_count " +
           "ON icm.manual_id = att_count.entity_id " +
           "WHERE (COALESCE(:deptCd, '') = '' OR icm.dept_cd = :deptCd) AND " +
           "(COALESCE(:authorEmpNo, '') = '' OR icm.author_emp_no LIKE CONCAT('%', :authorEmpNo, '%')) AND " +
           "(COALESCE(:manualTitle, '') = '' OR icm.manual_title LIKE CONCAT('%', :manualTitle, '%')) " +
           "ORDER BY icm.created_at DESC",
           countQuery = "SELECT COUNT(*) FROM internal_control_manuals icm " +
                       "WHERE (COALESCE(:deptCd, '') = '' OR icm.dept_cd = :deptCd) AND " +
                       "(COALESCE(:authorEmpNo, '') = '' OR icm.author_emp_no LIKE CONCAT('%', :authorEmpNo, '%')) AND " +
                       "(COALESCE(:manualTitle, '') = '' OR icm.manual_title LIKE CONCAT('%', :manualTitle, '%'))",
           nativeQuery = true)
    Page<Object[]> findBySearchCriteriaWithApproval(@Param("deptCd") String deptCd,
                                                    @Param("authorEmpNo") String authorEmpNo,
                                                    @Param("manualTitle") String manualTitle,
                                                    Pageable pageable);
}