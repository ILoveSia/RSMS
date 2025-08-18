package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 워크플로우 단계 DTO
 * 개별 워크플로우 단계 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStepDto {
    
    /**
     * 단계 제목
     */
    private String title;
    
    /**
     * 단계 설명
     */
    private String description;
    
    /**
     * 단계 상태 (completed, active, pending, error)
     */
    private String status;
    
    /**
     * 담당자 (선택적)
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
}