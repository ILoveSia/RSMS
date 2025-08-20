package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 부서별 개선계획등록 현황 DTO
 * 
 * 단일 책임 원칙(SRP): 부서별 개선계획등록 현황 데이터 전송만 담당
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeptImprovementPlanStatusDto {

    /**
     * 부서코드
     */
    private String deptCd;

    /**
     * 부서명
     */
    private String deptName;

    /**
     * 미흡사항 건수 (INS03)
     */
    private Long inadequateCount;

    /**
     * 개선계획작성 건수 (INS03 and PLI01)
     */
    private Long planCreatedCount;

    /**
     * 이행결과작성 건수 (INS03 and PLI02)
     */
    private Long resultWrittenCount;

    /**
     * 이행결과결재완료 건수 (INS03 and PLI03)
     */
    private Long resultApprovedCount;

    /**
     * 이행완료율 (이행결과결재완료 / 미흡사항 * 100)
     */
    private Double completionRate;

    /**
     * 점검계획관리 ID (audit_prog_mngt 테이블의 audit_prog_mngt_id)
     */
    private Long auditProgMngtId;

    /**
     * 점검결과보고서 ID (audit_result_report 테이블의 audit_result_report_id)
     */
    private Long auditResultReportId;

}