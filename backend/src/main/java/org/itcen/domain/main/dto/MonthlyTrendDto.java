package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 월별 트렌드 DTO
 * 월별 업무 처리 트렌드 정보를 전달합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyTrendDto {
    
    /**
     * 월 (예: "2024-12")
     */
    private String month;
    
    /**
     * 완료된 업무 수
     */
    private Integer completed;
    
    /**
     * 대기 중인 업무 수
     */
    private Integer pending;
    
    /**
     * 전체 업무 수
     */
    private Integer total;
}