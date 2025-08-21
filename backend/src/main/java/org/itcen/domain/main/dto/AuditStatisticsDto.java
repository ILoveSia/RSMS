package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 점검 통계 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditStatisticsDto {
    
    private Integer totalCount;
    private Integer appropriateCount;
    private Integer inadequateCount;
    private Integer excludedCount;
    private Double appropriateRate;
    private Double completionRate;
    private LocalDateTime lastUpdated;
}