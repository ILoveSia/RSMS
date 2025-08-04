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

    /**
     * 부서장 내부통제 항목 ID로 메뉴얼 조회
     */
    List<InternalControlManual> findByHodIcItemId(Long hodIcItemId);

    /**
     * 상태별 메뉴얼 조회
     */
    List<InternalControlManual> findByStatus(InternalControlManual.ManualStatus status);

    /**
     * 작성자별 메뉴얼 조회
     */
    List<InternalControlManual> findByAuthorEmpNo(String authorEmpNo);

    /**
     * 부서장별 메뉴얼 조회
     */
    List<InternalControlManual> findByHodEmpNo(String hodEmpNo);

    /**
     * 메뉴얼 분류별 조회
     */
    List<InternalControlManual> findByManualCategory(String manualCategory);

    /**
     * 부서와 상태로 최신 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd AND icm.status = :status " +
           "ORDER BY icm.createdAt DESC")
    List<InternalControlManual> findByDeptCdAndStatusOrderByCreatedAtDesc(@Param("deptCd") String deptCd,
                                                                         @Param("status") InternalControlManual.ManualStatus status);

    /**
     * 부서의 최신 발행 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd AND icm.status = 'PUBLISHED' " +
           "ORDER BY icm.effectiveDate DESC")
    List<InternalControlManual> findLatestPublishedByDeptCd(@Param("deptCd") String deptCd);

    /**
     * 메뉴얼 제목과 버전으로 조회
     */
    Optional<InternalControlManual> findByManualTitleAndManualVersion(String manualTitle, String manualVersion);

    /**
     * 유효한 메뉴얼 조회 (현재 날짜 기준)
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.status = 'PUBLISHED' " +
           "AND (icm.effectiveDate IS NULL OR icm.effectiveDate <= :currentDate) " +
           "AND (icm.expiryDate IS NULL OR icm.expiryDate > :currentDate)")
    List<InternalControlManual> findValidManuals(@Param("currentDate") LocalDate currentDate);

    /**
     * 만료 예정 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.status = 'PUBLISHED' " +
           "AND icm.expiryDate BETWEEN :startDate AND :endDate")
    List<InternalControlManual> findExpiringManuals(@Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    /**
     * 검토 필요 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.status = 'PUBLISHED' " +
           "AND icm.nextReviewDate <= :currentDate")
    List<InternalControlManual> findManualsNeedingReview(@Param("currentDate") LocalDate currentDate);

    /**
     * 승인 대기중인 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.status IN ('REVIEW', 'APPROVED') " +
           "ORDER BY icm.createdAt ASC")
    List<InternalControlManual> findPendingApprovalManuals();

    /**
     * 부서장 승인 대기중인 메뉴얼 조회
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.status = 'REVIEW' AND icm.hodEmpNo = :hodEmpNo " +
           "ORDER BY icm.createdAt ASC")
    List<InternalControlManual> findPendingApprovalByHod(@Param("hodEmpNo") String hodEmpNo);

    /**
     * 복합 조건 검색
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE " +
           "(:deptCd IS NULL OR icm.deptCd = :deptCd) AND " +
           "(:status IS NULL OR icm.status = :status) AND " +
           "(:manualCategory IS NULL OR icm.manualCategory = :manualCategory) AND " +
           "(:authorEmpNo IS NULL OR icm.authorEmpNo LIKE %:authorEmpNo%) AND " +
           "(:manualTitle IS NULL OR icm.manualTitle LIKE %:manualTitle%)")
    Page<InternalControlManual> findBySearchCriteria(@Param("deptCd") String deptCd,
                                                     @Param("status") InternalControlManual.ManualStatus status,
                                                     @Param("manualCategory") String manualCategory,
                                                     @Param("authorEmpNo") String authorEmpNo,
                                                     @Param("manualTitle") String manualTitle,
                                                     Pageable pageable);

    /**
     * 상태별 메뉴얼 통계
     */
    @Query("SELECT icm.status, COUNT(icm) FROM InternalControlManual icm GROUP BY icm.status")
    List<Object[]> getManualStatistics();

    /**
     * 부서별 메뉴얼 통계
     */
    @Query("SELECT icm.deptCd, COUNT(icm) FROM InternalControlManual icm GROUP BY icm.deptCd")
    List<Object[]> getManualStatisticsByDept();

    /**
     * 분류별 메뉴얼 통계
     */
    @Query("SELECT icm.manualCategory, COUNT(icm) FROM InternalControlManual icm " +
           "WHERE icm.manualCategory IS NOT NULL GROUP BY icm.manualCategory")
    List<Object[]> getManualStatisticsByCategory();

    /**
     * 월별 메뉴얼 생성 통계
     */
    @Query("SELECT YEAR(icm.createdAt), MONTH(icm.createdAt), COUNT(icm) " +
           "FROM InternalControlManual icm " +
           "GROUP BY YEAR(icm.createdAt), MONTH(icm.createdAt) " +
           "ORDER BY YEAR(icm.createdAt) DESC, MONTH(icm.createdAt) DESC")
    List<Object[]> getMonthlyCreationStatistics();

    /**
     * 중복 메뉴얼 체크 (같은 부서, 같은 제목, 다른 ID)
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd " +
           "AND icm.manualTitle = :manualTitle AND icm.manualId != :excludeId")
    List<InternalControlManual> findDuplicateManuals(@Param("deptCd") String deptCd,
                                                     @Param("manualTitle") String manualTitle,
                                                     @Param("excludeId") Long excludeId);

    /**
     * 부서코드, 부서장 내부통제 항목 ID, 상태로 조회 (ServiceImpl에서 사용)
     */
    List<InternalControlManual> findByDeptCdAndHodIcItemIdAndStatus(String deptCd, Long hodIcItemId, InternalControlManual.ManualStatus status);

    /**
     * 부서별 최신 발행 메뉴얼 조회 (ServiceImpl에서 사용)
     */
    @Query("SELECT icm FROM InternalControlManual icm WHERE icm.deptCd = :deptCd AND icm.status = 'PUBLISHED' " +
           "ORDER BY icm.effectiveDate DESC")
    List<InternalControlManual> findLatestPublishedByDepartment(@Param("deptCd") String deptCd);
}