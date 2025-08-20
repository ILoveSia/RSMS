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

    /**
     * 점검계획관리 ID (audit_prog_mngt 테이블의 audit_prog_mngt_id)
     */
    private Long auditProgMngtId;

    /**
     * 점검결과보고서 ID (audit_result_report 테이블의 audit_result_report_id)
     */
    private Long auditResultReportId;

    /**
     * 결재 ID (approval 테이블의 approval_id)
     */
    private Long approvalId;

    /**
     * 결재 상태 코드 (approval 테이블의 appr_stat_cd)
     */
    private String approvalStatusCd;

    /**
     * 결재 상태명
     */
    private String approvalStatusName;

}