package org.itcen.domain.audit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 점검결과보고 DTO
 * 
 * 단일 책임 원칙(SRP): 점검결과보고 데이터 전송만 담당
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditResultReportDto {

    /**
     * 점검결과보고ID
     */
    private Long auditResultReportId;

    /**
     * 점검계획관리ID
     */
    private Long auditProgMngtId;

    /**
     * 결과보고 작성 부서코드
     */
    private String deptCd;

    /**
     * 결과보고 작성 부서명 (조회용)
     */
    private String deptName;

    /**
     * 결과보고 작성 부서장 사번
     */
    private String empNo;

    /**
     * 결과보고 작성 부서장명 (조회용)
     */
    private String empName;

    /**
     * 부서장 종합의견
     */
    private String auditResultContent;

    /**
     * 1차 승인자 사번
     */
    private String empNo01;

    /**
     * 1차 승인자명 (조회용)
     */
    private String empName01;

    /**
     * 1차 승인자 종합의견
     */
    private String auditResultContent01;

    /**
     * 2차 승인자 사번
     */
    private String empNo02;

    /**
     * 2차 승인자명 (조회용)
     */
    private String empName02;

    /**
     * 2차 승인자 종합의견
     */
    private String auditResultContent02;

    /**
     * 점검항목 요구사항
     */
    private String reqMemo;

    /**
     * 점검계획명 (조회용)
     */
    private String auditTitle;

    /**
     * 생성일시 (조회용)
     */
    private String createdAt;

    /**
     * 수정일시 (조회용)
     */
    private String updatedAt;

    /**
     * 생성자 ID
     */
    private String createdId;

    /**
     * 수정자 ID
     */
    private String updatedId;
}