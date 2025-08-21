package org.itcen.domain.main.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 원장 상태 워크플로우 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerOrdersStatusDto {
    
    private Long ledgerOrdersId;
    private String ledgerOrdersTitle;
    private String ledgerOrdersStatusCd;
    private String ledgerOrdersStatusName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}