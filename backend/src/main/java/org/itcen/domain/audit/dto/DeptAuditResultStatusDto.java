package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 부서별 점검결과 현황 DTO
 * 
 * 단일 책임 원칙(SRP): 부서별 점검결과 현황 데이터 전송만 담당
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeptAuditResultStatusDto {

    /**
     * 부서코드
     */
    private String deptCd;

    /**
     * 부서명
     */
    private String deptName;

    /**
     * 전체 건수
     */
    private Long totalCount;

    /**
     * 적정 건수 (INS02)
     */
    private Long appropriateCount;

    /**
     * 미흡 건수 (INS03)
     */
    private Long inadequateCount;

    /**
     * 점검제외 건수 (INS04)
     */
    private Long excludedCount;

    /**
     * 적정 수행율 (적정 건수 / 전체 건수 * 100)
     */
    private Double appropriateRate;

}