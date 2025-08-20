package org.itcen.domain.handover.service;

import org.itcen.domain.handover.entity.BusinessPlanInspection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 사업계획 점검 서비스 인터페이스
 * 사업계획 점검 관련 비즈니스 로직을 정의합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 비즈니스 로직만 담당
 * - Open/Closed: 새로운 점검 관리 기능 추가 시 확장 가능
 * - Liskov Substitution: 구현체 간 호환성 보장
 * - Interface Segregation: 사업계획 점검 관련 메서드만 정의
 * - Dependency Inversion: 구현체가 아닌 인터페이스에 의존
 */
public interface BusinessPlanInspectionService {

    // 기본 CRUD 작업

    /**
     * 사업계획 점검 생성
     */
    BusinessPlanInspection createInspection(BusinessPlanInspection inspection);

    /**
     * 사업계획 점검 수정
     */
    BusinessPlanInspection updateInspection(Long inspectionId, BusinessPlanInspection inspection);

    /**
     * 사업계획 점검 조회
     */
    Optional<BusinessPlanInspection> getInspection(Long inspectionId);

    /**
     * 사업계획 점검 삭제
     */
    void deleteInspection(Long inspectionId);

    /**
     * 모든 사업계획 점검 조회 (페이징)
     */
    Page<BusinessPlanInspection> getAllInspections(Pageable pageable);

    // 비즈니스 로직

    /**
     * 점검 시작
     */
    void startInspection(Long inspectionId, String inspectorEmpNo, String actorEmpNo);

    /**
     * 점검 완료
     */
    void completeInspection(Long inspectionId, BusinessPlanInspection.InspectionGrade grade, String actorEmpNo);

    /**
     * 점검 취소
     */
    void cancelInspection(Long inspectionId, String actorEmpNo, String reason);

    // 조회 기능

    /**
     * 부서별 사업계획 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByDepartment(String deptCd);

    /**
     * 점검 연도별 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByYear(Integer inspectionYear);

    /**
     * 점검 연도와 분기별 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByYearAndQuarter(Integer inspectionYear, Integer inspectionQuarter);

    /**
     * 점검 유형별 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByType(BusinessPlanInspection.InspectionType inspectionType);

    /**
     * 상태별 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByStatus(BusinessPlanInspection.InspectionStatus status);

    /**
     * 등급별 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByGrade(BusinessPlanInspection.InspectionGrade grade);

    /**
     * 개선 상태별 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByImprovementStatus(BusinessPlanInspection.ImprovementStatus improvementStatus);

    /**
     * 점검자별 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByInspector(String inspectorEmpNo);



    /**
     * 부서와 연도별 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByDepartmentAndYear(String deptCd, Integer year);

    /**
     * 특정 부서의 최신 점검 조회
     */
    List<BusinessPlanInspectionDto> getLatestInspectionsByDepartment(String deptCd, int limit);

    /**
     * 특정 기간 내 계획된 점검 조회
     */
    List<BusinessPlanInspectionDto> getInspectionsByDateRange(LocalDate startDate, LocalDate endDate);

    /**
     * 지연된 점검 조회
     */
    List<BusinessPlanInspectionDto> getDelayedInspections();

    /**
     * 개선사항 기한 임박 점검 조회
     */
    List<BusinessPlanInspectionDto> getImprovementsDueSoon(int daysFromNow);

    /**
     * 개선사항 지연 점검 조회
     */
    List<BusinessPlanInspectionDto> getOverdueImprovements();

    /**
     * 진행중인 점검 조회
     */
    List<BusinessPlanInspectionDto> getActiveInspections();

    /**
     * 복합 조건 검색
     */
    Page<BusinessPlanInspectionDto> searchInspections(InspectionSearchDto searchDto, Pageable pageable);

    // DTO 인터페이스들

    interface BusinessPlanInspectionDto {
        Long getInspectionId();
        String getDeptCd();
        String getDeptName();
        Integer getInspectionYear();
        Integer getInspectionQuarter();
        String getInspectionTitle();
        BusinessPlanInspection.InspectionType getInspectionType();
        LocalDate getPlannedStartDate();
        LocalDate getPlannedEndDate();
        String getInspectionScope();
        String getInspectionCriteria();
        LocalDate getActualStartDate();
        LocalDate getActualEndDate();
        BusinessPlanInspection.InspectionStatus getStatus();
        String getInspectorEmpNo();
        boolean isOnSchedule();
    }

    interface InspectionSearchDto {
        String getDeptCd();
        Integer getInspectionYear();
        Integer getInspectionQuarter();
        BusinessPlanInspection.InspectionType getInspectionType();
        BusinessPlanInspection.InspectionStatus getStatus();
        String getInspectorEmpNo();
        LocalDate getStartDate();
        LocalDate getEndDate();
    }

    interface InspectionStatisticsDto {
        Long getTotalInspections();
        Long getCompletedInspections();
        Long getInProgressInspections();
        Long getDelayedInspections();
        Double getCompletionRate();
        Double getOnTimeRate();
    }

    interface DepartmentInspectionStatisticsDto {
        String getDeptCd();
        String getDeptName();
        Long getInspectionCount();
        Long getCompletedCount();
        Double getCompletionRate();
    }

    interface GradeStatisticsDto {
        BusinessPlanInspection.InspectionGrade getGrade();
        Long getCount();
        Double getPercentage();
    }

    interface YearlyStatisticsDto {
        Integer getYear();
        Long getInspectionCount();
        Long getCompletedCount();
    }

    interface MonthlyStatisticsDto {
        Integer getYear();
        Integer getMonth();
        Long getCompletedCount();
    }

    interface YearlyInspectionStatusDto {
        String getDeptCd();
        String getDeptName();
        Integer getInspectionYear();
        Integer getInspectionQuarter();
        BusinessPlanInspection.InspectionStatus getStatus();
    }
}