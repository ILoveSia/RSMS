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
    private String deptName; // 조회용
    private Integer inspectionYear;
    private Integer inspectionQuarter;
    private String inspectionTitle;
    private BusinessPlanInspection.InspectionType inspectionType;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private String inspectionScope;
    private String inspectionCriteria;
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private BusinessPlanInspection.InspectionStatus status;
    private String inspectorEmpNo;
    private String inspectorName; // 조회용
    
    // 계산된 필드들
    private boolean isOnSchedule;
    private boolean isDelayed;
    private int daysRemaining;
    private String statusDescription;
}