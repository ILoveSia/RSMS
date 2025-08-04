package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.BusinessPlanInspection;
import org.itcen.domain.handover.entity.InternalControlManual;
import org.itcen.domain.handover.entity.ResponsibilityDocument;

import java.time.LocalDate;

/**
 * 검색 관련 DTO 클래스들
 * 다양한 검색 조건을 위한 데이터 전송 객체들입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 각 도메인별 검색 조건만 담당
 * - Open/Closed: 새로운 검색 조건 추가 시 확장 가능
 * - Liskov Substitution: 각 검색 DTO 인터페이스 구현
 * - Interface Segregation: 필요한 검색 조건만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
public class SearchDto {

    /**
     * 책무기술서 검색 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentSearch {
        private Long positionId;
        private ResponsibilityDocument.DocumentStatus status;
        private String authorEmpNo;
        private String documentTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        
        // 추가 검색 조건들
        private String keyword;
        private String documentVersion;
        private String reviewerEmpNo;
        private String approverEmpNo;
        private Boolean isValid;
        private Boolean isExpiring;
        private Integer daysUntilExpiry;
    }

    /**
     * 내부통제 메뉴얼 검색 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManualSearch {
        private String deptCd;
        private InternalControlManual.ManualStatus status;
        private String manualCategory;
        private String authorEmpNo;
        private String manualTitle;
        private LocalDate startDate;
        private LocalDate endDate;
        
        // 추가 검색 조건들
        private String keyword;
        private Long hodIcItemId;
        private String icTaskCategory;
        private String hodEmpNo;
        private String manualVersion;
        private Boolean isValid;
        private Boolean isExpiring;
        private Boolean needsReview;
        private Integer reviewCycleMonths;
    }

    /**
     * 사업계획 점검 검색 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InspectionSearch {
        private String deptCd;
        private Integer inspectionYear;
        private Integer inspectionQuarter;
        private BusinessPlanInspection.InspectionType inspectionType;
        private BusinessPlanInspection.InspectionStatus status;
        private BusinessPlanInspection.InspectionGrade overallGrade;
        private String inspectorEmpNo;
        private LocalDate startDate;
        private LocalDate endDate;
        
        // 추가 검색 조건들
        private String keyword;
        private String inspecteeEmpNo;
        private BusinessPlanInspection.ImprovementStatus improvementStatus;
        private Boolean isDelayed;
        private Boolean isOnSchedule;
        private Boolean hasImprovements;
        private Boolean isImprovementOverdue;
        private String riskLevel;
        private String complianceLevel;
    }

    /**
     * 공통 검색 조건 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommonSearch {
        private String keyword;
        private LocalDate startDate;
        private LocalDate endDate;
        private String deptCd;
        private String empNo;
        private String createdBy;
        private String updatedBy;
        
        // 페이징 및 정렬
        private Integer page;
        private Integer size;
        private String sortBy;
        private String sortDirection;
    }

    /**
     * 고급 검색 조건 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdvancedSearch {
        private String globalKeyword;
        private String[] includeKeywords;
        private String[] excludeKeywords;
        private String[] deptCodes;
        private String[] empNos;
        private LocalDate createdAfter;
        private LocalDate createdBefore;
        private LocalDate updatedAfter;
        private LocalDate updatedBefore;
        
        // 상태 조건들
        private Boolean includeActive;
        private Boolean includeCompleted;
        private Boolean includeDelayed;
        private Boolean includeExpired;
        
        // 범위 조건들
        private Integer minProgress;
        private Integer maxProgress;
        private Integer minDaysRemaining;
        private Integer maxDaysRemaining;
    }
}