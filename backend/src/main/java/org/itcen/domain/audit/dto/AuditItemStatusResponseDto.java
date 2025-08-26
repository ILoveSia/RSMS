package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 점검 현황(항목별) 조회 응답 DTO
 * 
 * 단일 책임 원칙(SRP): 점검 현황 항목별 데이터 전송만 담당
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditItemStatusResponseDto {

    /**
     * 부서장 내부통제 항목 ID
     */
    private Long hodIcItemId;

    /**
     * 점검 계획관리 상세ID
     */
    private Long auditProgMngtDetailId;

    /**
     * 책무 내용
     */
    private String responsibilityContent;

    /**
     * 책무상세 내용
     */
    private String responsibilityDetailContent;

    /**
     * 직책명
     */
    private String positionsNm;

    /**
     * 부서 코드
     */
    private String deptCd;

    /**
     * 부서명
     */
    private String deptName;

    /**
     * 항목 구분 코드
     */
    private String fieldTypeCd;

    /**
     * 직무 구분 코드
     */
    private String roleTypeCd;

    /**
     * 내부통제업무
     */
    private String icTask;

    /**
     * 점검자 ID
     */
    private String auditMenId;

    /**
     * 점검 결과 상태 코드
     */
    private String auditResultStatusCd;

    /**
     * 책무 개요 (RoleRespStatus에서 가져옴)
     */
    private String roleSumm;

    /**
     * 원장차수 (조회조건용)
     */
    private Long ledgerOrdersHod;

    /**
     * 점검결과 (조회조건용)
     */
    private String auditResult;

    /**
     * 이행완료 예정일자
     */
    private String auditDoneDt;

    /**
     * 점검 세부내용
     */
    private String auditDetailContent;

    /**
     * 점검상태코드 (audit_prog_mngt 테이블에서)
     */
    private String auditStatusCd;

    /**
     * 책무 ID (audit_prog_mngt_detail 테이블에서)
     */
    private Long responsibilityId;

    /**
     * 점검회차명 (audit_prog_mngt 테이블에서)
     */
    private String auditTitle;

    /**
     * 점검 계획진행상태 (audit_prog_mngt 테이블에서)
     */
    private String auditStatusCdFromProgMngt;

    /**
     * 개선계획상태코드 (audit_prog_mngt_detail 테이블에서)
     */
    private String impPlStatusCd;

    /**
     * 이행결과보고 (audit_prog_mngt_detail 테이블에서)
     */
    private String auditDoneContent;

    /**
     * 결재 ID (approval 테이블에서)
     */
    private Long approvalId;

    /**
     * 결재상태코드 (approval 테이블에서)
     */
    private String approvalStatusCd;

    /**
     * 점검최종결과여부 (audit_prog_mngt_detail 테이블에서)
     */
    private String auditFinalResultYn;

}