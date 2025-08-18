package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 업무 통계 DTO
 * 메인 대시보드의 업무 현황 통계 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkStatsDto {
    
    /**
     * 총 업무 수
     */
    private Integer totalTasks;
    
    /**
     * 완료 업무 수
     */
    private Integer completedTasks;
    
    /**
     * 대기 업무 수
     */
    private Integer pendingTasks;
    
    /**
     * 지연 업무 수
     */
    private Integer overdueTasks;
    
    /**
     * 결재 대기 수
     */
    private Integer approvalPending;
    
    /**
     * 점검 업무 수
     */
    private Integer auditTasks;
}