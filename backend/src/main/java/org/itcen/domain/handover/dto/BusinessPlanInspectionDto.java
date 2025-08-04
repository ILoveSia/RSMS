package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.BusinessPlanInspection;

import java.time.LocalDate;

/**
 * 사업계획 점검 DTO
 * 사업계획 점검 정보 전송을 위한 데이터 전송 객체입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 사업계획 점검 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BusinessPlanInspectionDto 인터페이스 구현
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessPlanInspectionDto {
    
    private Long inspectionId;
    private String deptCd;
    private String deptName;
    private Integer inspectionYear;
    private Integer inspectionQuarter;
    private String inspectionTitle;
    private BusinessPlanInspection.InspectionType inspectionType;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private String inspectionScope;
    private String inspectionCriteria;
    private String inspectionResults;
    private BusinessPlanInspection.InspectionStatus status;
    private BusinessPlanInspection.InspectionGrade overallGrade;
    private String inspectorEmpNo;
    private String inspectorName;
    private String inspecteeEmpNo;
    private String inspecteeName;
    private String improvementItems;
    private LocalDate improvementDueDate;
    private BusinessPlanInspection.ImprovementStatus improvementStatus;
    
    // 계산된 필드들
    private boolean isOnSchedule;
    private boolean isImprovementOnTime;
    private boolean isDelayed;
    private int daysRemaining;
    private int improvementDaysRemaining;
    private String statusDescription;
    
    // 추가 정보 필드들
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private LocalDate improvementStartDate; 
    private LocalDate improvementCompletedDate;
    private LocalDate createdAt;
    private LocalDate updatedAt;
    private String createdByName;
    private String updatedByName;
    
    // 점검 세부 정보
    private String riskLevel;
    private String complianceLevel;
    private String recommendedActions;
    private String followUpRequired;
    
    // 첨부파일 정보
    private Long attachmentCount;
    private String attachmentFileNames;
    
    // 관련 문서 정보
    private Long relatedDocumentCount;
    private String relatedDocumentTitles;
}