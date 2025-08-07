package org.itcen.domain.handover.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.itcen.domain.handover.entity.HandoverAssignment;

import java.time.LocalDate;

/**
 * 인수인계 지정 검색 DTO
 * 인수인계 지정 검색 조건을 위한 데이터 전송 객체입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 검색 조건만 담당
 * - Open/Closed: 새로운 검색 조건 추가 시 확장 가능
 * - Liskov Substitution: HandoverAssignmentSearchDto 인터페이스 구현
 * - Interface Segregation: 검색에 필요한 조건만 포함
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HandoverAssignmentSearchDto {
    
    private Long positionId;
    private HandoverAssignment.HandoverType handoverType;
    private HandoverAssignment.HandoverStatus status;
    private String handoverFromEmpNo;
    private String handoverToEmpNo;
    private LocalDate startDate;
    private LocalDate endDate;
    
    // 추가 검색 조건들
    private String deptCd;
    private String keyword; // 제목이나 내용 검색용
    private Boolean isDelayed;
    private String createdBy;
    private String updatedBy;
}