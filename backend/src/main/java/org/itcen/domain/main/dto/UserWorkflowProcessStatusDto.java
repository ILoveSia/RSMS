package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 사용자 워크플로우 프로세스 현황 DTO
 * 사용자별 워크플로우 프로세스의 상세 현황을 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserWorkflowProcessStatusDto {
    
    /**
     * 프로세스 타입 (approval, audit, management)
     */
    private String processType;
    
    /**
     * 프로세스명
     */
    private String processName;
    
    /**
     * 현재 단계 (0부터 시작)
     */
    private Integer currentStep;
    
    /**
     * 전체 단계 수
     */
    private Integer totalSteps;
    
    /**
     * 진행률 (0-100%)
     */
    private Integer progress;
    
    /**
     * 현재 활성 단계 제목
     */
    private String activeStepTitle;
    
    /**
     * 현재 활성 단계 설명
     */
    private String activeStepDescription;
    
    /**
     * 현재 담당자
     */
    private String assignee;
    
    /**
     * 마감일 (선택적)
     */
    private String dueDate;
    
    /**
     * 예상 소요시간 (선택적)
     */
    private String estimatedTime;
    
    /**
     * 전체 단계 정보 리스트
     */
    private List<WorkflowStepDto> steps;
}