package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.BusinessPlanInspection;
import org.itcen.domain.handover.entity.HandoverAssignment;
import org.itcen.domain.handover.entity.ResponsibilityDocument;

/**
 * 통계 관련 DTO 클래스들
 * 다양한 통계 정보 전송을 위한 데이터 전송 객체들입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 각 통계별 데이터 전송만 담당
 * - Open/Closed: 새로운 통계 필드 추가 시 확장 가능
 * - Liskov Substitution: 각 통계 DTO 인터페이스 구현
 * - Interface Segregation: 필요한 통계 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
public class StatisticsDto {

    /**
     * 인수인계 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HandoverStatistics {
        private Long totalHandovers;
        private Long completedHandovers;
        private Long inProgressHandovers;
        private Long delayedHandovers;
        private Double averageProgress;
        private Double completionRate;
        private Double onTimeRate;
        private Long plannedHandovers;
        private Long cancelledHandovers;
    }

    /**
     * 문서 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentStatistics {
        private Long totalDocuments;
        private Long draftDocuments;
        private Long publishedDocuments;
        private Long expiringDocuments;
        private Double approvalRate;
        private Long reviewDocuments;
        private Long approvedDocuments;
        private Double publishingRate;
    }

    /**
     * 메뉴얼 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ManualStatistics {
        private Long totalManuals;
        private Long draftManuals;
        private Long publishedManuals;
        private Long expiringManuals;
        private Long manualsNeedingReview;
        private Double approvalRate;
        private Long hodReviewManuals;
        private Long hodApprovedManuals;
    }

    /**
     * 점검 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InspectionStatistics {
        private Long totalInspections;
        private Long completedInspections;
        private Long inProgressInspections;
        private Long delayedInspections;
        private Long overdueImprovements;
        private Double completionRate;
        private Double onTimeRate;
        private Long plannedInspections;
        private Long cancelledInspections;
    }

    /**
     * 월별 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStatistics {
        private Integer year;
        private Integer month;
        private Long completedCount;
        private Long createdCount;
        private Long totalCount;
        private Double completionRate;
    }

    /**
     * 상태별 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusStatistics {
        private HandoverAssignment.HandoverStatus handoverStatus;
        private ResponsibilityDocument.DocumentStatus documentStatus;
        private BusinessPlanInspection.InspectionStatus inspectionStatus;
        private Long count;
        private Double percentage;
        private String statusName;
        private String statusDescription;
    }

    /**
     * 부서별 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentStatistics {
        private String deptCd;
        private String deptName;
        private Long totalCount;
        private Long completedCount;
        private Long inProgressCount;
        private Double completionRate;
        private Double performanceScore;
    }

    /**
     * 부서별 점검 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentInspectionStatistics {
        private String deptCd;
        private String deptName;
        private Long inspectionCount;
        private Long completedCount;
        private Double completionRate;
        private Long delayedCount;
        private Double onTimeRate;
    }

    /**
     * 등급별 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GradeStatistics {
        private BusinessPlanInspection.InspectionGrade grade;
        private Long count;
        private Double percentage;
        private String gradeName;
        private String gradeDescription;
    }

    /**
     * 연도별 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyStatistics {
        private Integer year;
        private Long inspectionCount;
        private Long completedCount;
        private Long totalCount;
        private Double completionRate;
        private Double yearOverYearGrowth;
    }

    /**
     * 분류별 통계 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStatistics {
        private String category;
        private String categoryName;
        private Long manualCount;
        private Long publishedCount;
        private Double publishRate;
    }

    /**
     * 연도별 점검 현황 DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class YearlyInspectionStatus {
        private String deptCd;
        private String deptName;
        private Integer inspectionYear;
        private Integer inspectionQuarter;
        private BusinessPlanInspection.InspectionStatus status;
        private BusinessPlanInspection.InspectionGrade overallGrade;
        private String statusName;
        private String gradeName;
    }
}