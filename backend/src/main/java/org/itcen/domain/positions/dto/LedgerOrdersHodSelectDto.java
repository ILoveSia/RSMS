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
    private String label; // 예: 2025-HOD-001(진행중)
}