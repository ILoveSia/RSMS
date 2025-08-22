package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 부서장 내부통제 워크플로우 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerOrdersHodStatusDto {
    
    private Long ledgerOrdersId;
    private Long ledgerOrdersHodId;
    private String ledgerOrdersHodTitle;
    private String ledgerOrdersHodStatusCd;
    private String ledgerOrdersHodStatusName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}