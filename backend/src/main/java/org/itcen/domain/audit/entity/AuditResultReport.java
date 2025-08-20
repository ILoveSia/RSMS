package org.itcen.domain.audit.entity;

import org.itcen.common.entity.BaseTimeEntity;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

/**
 * 점검결과보고 Entity
 * 
 * 단일 책임 원칙(SRP): 점검결과보고 데이터만 담당
 */
@Entity
@Table(name = "audit_result_report")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditResultReport extends BaseTimeEntity {

    /**
     * 점검결과보고ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_result_report_id")
    private Long auditResultReportId;

    /**
     * 점검계획관리ID
     */
    @Column(name = "audit_prog_mngt_id", nullable = false)
    private Long auditProgMngtId;

    /**
     * 결과보고 작성 부서코드
     */
    @Column(name = "dept_cd", length = 100, nullable = false)
    private String deptCd;

    /**
     * 결과보고 작성 부서장 사번
     */
    @Column(name = "emp_no", length = 100, nullable = false)
    private String empNo;

    /**
     * 부서장 종합의견
     */
    @Column(name = "audit_result_content", columnDefinition = "TEXT")
    private String auditResultContent;

    /**
     * 1차 승인자 사번
     */
    @Column(name = "emp_no_01", length = 100)
    private String empNo01;

    /**
     * 1차 승인자 종합의견
     */
    @Column(name = "audit_result_content_01", columnDefinition = "TEXT")
    private String auditResultContent01;

    /**
     * 2차 승인자 사번
     */
    @Column(name = "emp_no_02", length = 100)
    private String empNo02;

    /**
     * 2차 승인자 종합의견
     */
    @Column(name = "audit_result_content_02", columnDefinition = "TEXT")
    private String auditResultContent02;

    /**
     * 점검항목 요구사항
     */
    @Column(name = "req_memo", columnDefinition = "TEXT")
    private String reqMemo;

    /**
     * 데이터 수정을 위한 메서드들
     */
    public void updateAuditResultContent(String auditResultContent) {
        this.auditResultContent = auditResultContent;
    }

    public void updateReqMemo(String reqMemo) {
        this.reqMemo = reqMemo;
    }

    public void updateApprover01(String empNo01, String auditResultContent01) {
        this.empNo01 = empNo01;
        this.auditResultContent01 = auditResultContent01;
    }

    public void updateApprover02(String empNo02, String auditResultContent02) {
        this.empNo02 = empNo02;
        this.auditResultContent02 = auditResultContent02;
    }
}