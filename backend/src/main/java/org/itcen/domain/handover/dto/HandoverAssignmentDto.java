package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.HandoverAssignment;

import java.time.LocalDate;

/**
 * 인수인계 지정 DTO
 * 인수인계 지정 정보 전송을 위한 데이터 전송 객체입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 데이터 전송만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: HandoverAssignmentDto 인터페이스 구현
 * - Interface Segregation: 필요한 데이터만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverAssignmentDto {
    
    private Long assignmentId;
    private Long positionId;
    private String positionName;
    private HandoverAssignment.HandoverType handoverType;
    private String handoverFromEmpNo;
    private String handoverFromName;
    private String handoverFromDept;
    private String handoverToEmpNo;
    private String handoverToName;
    private String handoverToDept;
    private LocalDate plannedStartDate;
    private LocalDate plannedEndDate;
    private HandoverAssignment.HandoverStatus status;
    private Integer progressRate;
    private String notes;
    
    // 계산된 필드들
    private boolean isDelayed;
    private boolean isOnSchedule;
    private int daysRemaining;
    
    // 추가 정보 필드들
    private LocalDate actualStartDate;
    private LocalDate actualEndDate;
    private String createdByName;
    private String updatedByName;
    private LocalDate createdAt;
    private LocalDate updatedAt;
}