package org.itcen.domain.handover.repository;

import org.itcen.domain.handover.entity.BusinessPlanInspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
/**
 * 사업계획 점검 Repository
 * 사업계획 점검 데이터 접근을 담당
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 데이터 접근만 담당
 * - Interface Segregation: 필요한 메서드만 정의
 */
@Repository
public interface BusinessPlanInspectionRepository extends JpaRepository<BusinessPlanInspection, Long> {

    /**
     * 부서코드로 점검 조회
     */
    List<BusinessPlanInspection> findByDeptCd(String deptCd);

    /**
     * 점검 연도로 조회
     */
    List<BusinessPlanInspection> findByInspectionYear(Integer inspectionYear);

    /**
     * 점검 연도와 분기로 조회
     */
    List<BusinessPlanInspection> findByInspectionYearAndInspectionQuarter(Integer inspectionYear, Integer inspectionQuarter);

    /**
     * 점검 유형별 조회
     */
    List<BusinessPlanInspection> findByInspectionType(BusinessPlanInspection.InspectionType inspectionType);

    /**
     * 상태별 점검 조회
     */
    List<BusinessPlanInspection> findByStatus(BusinessPlanInspection.InspectionStatus status);

    /**
     * 점검자별 점검 조회
     */
    List<BusinessPlanInspection> findByInspectorEmpNo(String inspectorEmpNo);

    

    /**
     * 종합 등급별 점검 조회
     */
    List<BusinessPlanInspection> findByOverallGrade(BusinessPlanInspection.InspectionGrade overallGrade);

    /**
     * 개선 상태별 점검 조회
     */
    List<BusinessPlanInspection> findByImprovementStatus(BusinessPlanInspection.ImprovementStatus improvementStatus);

    /**
     * 부서와 연도별 점검 조회
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.deptCd = :deptCd AND bpi.inspectionYear = :year " +
           "ORDER BY bpi.inspectionQuarter ASC, bpi.createdAt DESC")
    List<BusinessPlanInspection> findByDeptCdAndYear(@Param("deptCd") String deptCd, @Param("year") Integer year);

    /**
     * 특정 부서의 최신 점검 조회
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.deptCd = :deptCd " +
           "ORDER BY bpi.inspectionYear DESC, bpi.inspectionQuarter DESC, bpi.createdAt DESC")
    List<BusinessPlanInspection> findLatestInspectionsByDepartment(@Param("deptCd") String deptCd, Pageable pageable);

    /**
     * 특정 기간 내 계획된 점검 조회
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.plannedStartDate BETWEEN :startDate AND :endDate")
    List<BusinessPlanInspection> findInspectionsByDateRange(@Param("startDate") LocalDate startDate,
                                                        @Param("endDate") LocalDate endDate);

    /**
     * 지연된 점검 조회 (예정일 지남)
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.status = 'IN_PROGRESS' " +
           "AND bpi.plannedEndDate < :currentDate")
    List<BusinessPlanInspection> findDelayedInspections(@Param("currentDate") LocalDate currentDate);

    /**
     * 개선사항 기한 임박 점검 조회
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.improvementStatus IN ('PENDING', 'IN_PROGRESS') " +
           "AND bpi.improvementDueDate BETWEEN :startDate AND :endDate")
    List<BusinessPlanInspection> findImprovementsDueSoon(@Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    /**
     * 개선사항 지연 점검 조회
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.improvementStatus IN ('PENDING', 'IN_PROGRESS') " +
           "AND bpi.improvementDueDate < :currentDate")
    List<BusinessPlanInspection> findOverdueImprovements(@Param("currentDate") LocalDate currentDate);

    /**
     * 진행중인 점검 조회
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.status IN ('PLANNED', 'IN_PROGRESS')")
    List<BusinessPlanInspection> findActiveInspections();

    /**
     * 복합 조건 검색
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE " +
           "(:deptCd IS NULL OR bpi.deptCd = :deptCd) AND " +
           "(:inspectionYear IS NULL OR bpi.inspectionYear = :inspectionYear) AND " +
           "(:inspectionQuarter IS NULL OR bpi.inspectionQuarter = :inspectionQuarter) AND " +
           "(:inspectionType IS NULL OR bpi.inspectionType = :inspectionType) AND " +
           "(:status IS NULL OR bpi.status = :status) AND " +
           "(:inspectorEmpNo IS NULL OR bpi.inspectorEmpNo LIKE %:inspectorEmpNo%)")
    Page<BusinessPlanInspection> findBySearchCriteria(@Param("deptCd") String deptCd,
                                                      @Param("inspectionYear") Integer inspectionYear,
                                                      @Param("inspectionQuarter") Integer inspectionQuarter,
                                                      @Param("inspectionType") BusinessPlanInspection.InspectionType inspectionType,
                                                      @Param("status") BusinessPlanInspection.InspectionStatus status,
                                                      @Param("inspectorEmpNo") String inspectorEmpNo,
                                                      Pageable pageable);

    /**
     * 중복 점검 체크 (같은 부서, 같은 연도, 같은 분기, 다른 ID)
     */
    @Query("SELECT bpi FROM BusinessPlanInspection bpi WHERE bpi.deptCd = :deptCd " +
           "AND bpi.inspectionYear = :year AND bpi.inspectionQuarter = :quarter " +
           "AND bpi.inspectionId != :excludeId")
    List<BusinessPlanInspection> findDuplicateInspections(@Param("deptCd") String deptCd,
                                                          @Param("year") Integer year,
                                                          @Param("quarter") Integer quarter,
                                                          @Param("excludeId") Long excludeId);



    /**
     * 부서코드, 점검연도, 점검분기로 조회 (ServiceImpl에서 사용)
     */
    List<BusinessPlanInspection> findByDeptCdAndInspectionYearAndInspectionQuarter(String deptCd, Integer inspectionYear, Integer inspectionQuarter);

    /**
     * 부서코드와 점검연도로 조회 (ServiceImpl에서 사용)
     */
    List<BusinessPlanInspection> findByDeptCdAndInspectionYear(String deptCd, Integer inspectionYear);

    
}