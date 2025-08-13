package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 부서장 원장차수 SelectBox용 DTO
 * value: ledgerOrdersHodId, label: "ledgerOrdersHodTitle(상태)"
 */
@Data
@AllArgsConstructor
public class LedgerOrdersHodSelectDto {
    private String value; // ledgerOrdersHodId
    private String label; // 예: 2025-002-01(진행중)
    private Long ledgerOrdersHodId; // 부서장 원장차수 ID
    private String ledgerOrdersHodStatusCd; // 부서장 원장차수 상태코드
}