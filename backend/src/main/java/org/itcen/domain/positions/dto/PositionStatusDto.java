package org.itcen.domain.positions.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 직책 현황 목록 조회용 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionStatusDto {
    private Long positionsId;
    private String positionsNm;
    private String writeDeptNm;
    private String ownerDeptNms;
    private Long adminCount;
    private String ledgerOrdersTitle; // 책무번호 제목
    private String ledgerOrdersStatusCd; // 진행상태 코드
} 