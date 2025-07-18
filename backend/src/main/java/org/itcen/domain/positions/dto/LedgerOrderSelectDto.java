package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * 원장차수+진행상태 SelectBox용 DTO
 * value: ledgerOrdersTitle, label: "ledgerOrdersTitle(진행상태)"
 */
@Data
@AllArgsConstructor
public class LedgerOrderSelectDto {
    private String value; // ledgerOrdersTitle
    private String label; // 예: 2025-001(진행중)
}
