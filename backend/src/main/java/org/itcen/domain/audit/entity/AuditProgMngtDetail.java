package org.itcen.domain.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

import java.time.LocalDate;

/**
 * 점검계획관리상세 Entity
 * 
 * 단일 책임 원칙(SRP): 점검계획관리상세 데이터 관리만 담당
 * 개방-폐쇄 원칙(OCP): BaseTimeEntity를 확장하여 감사 필드 재사용
 */
@Entity
@Table(name = "audit_prog_mngt_detail")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngtDetail extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_prog_mngt_detail_id")
    private Long auditProgMngtDetailId;

    @Column(name = "audit_prog_mngt_id", nullable = false)
    private Long auditProgMngtId;

    @Column(name = "audit_prog_mngt_cd", length = 100, nullable = false)
    private String auditProgMngtCd;

    @Column(name = "hod_ic_item_id", nullable = false)
    private Long hodIcItemId;

    @Column(name = "responsibility_id")
    private Long responsibilityId;

    @Column(name = "responsibility_detail_id")
    private Long responsibilityDetailId;

    @Column(name = "audit_men_id", length = 100)
    private String auditMenId;

    @Column(name = "audit_result", length = 500)
    private String auditResult;

    @Column(name = "audit_result_status_cd", length = 30)
    private String auditResultStatusCd;

    @Column(name = "before_audit_yn", length = 1)
    @Builder.Default
    private String beforeAuditYn = "N";

    @Column(name = "audit_detail_content", length = 1000)
    private String auditDetailContent;

    @Column(name = "imp_pl_status_cd", length = 10)
    private String impPlStatusCd;

    @Column(name = "audit_done_dt")
    private LocalDate auditDoneDt;

    @Column(name = "audit_done_content")
    private String auditDoneContent;

    // AuditProgMngt와의 연관관계 설정
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "audit_prog_mngt_id", insertable = false, updatable = false)
    private AuditProgMngt auditProgMngt;

    /**
     * 부모 엔티티 설정 (양방향 관계)
     */
    public void setAuditProgMngt(AuditProgMngt auditProgMngt) {
        this.auditProgMngt = auditProgMngt;
    }

    /**
     * 이행결과 내용 설정
     */
    public void setAuditDoneContent(String auditDoneContent) {
        this.auditDoneContent = auditDoneContent;
    }

    /**
     * 이행완료 예정일자 설정
     */
    public void setAuditDoneDt(LocalDate auditDoneDt) {
        this.auditDoneDt = auditDoneDt;
    }

    /**
     * 개선계획상태코드 설정
     */
    public void setImpPlStatusCd(String impPlStatusCd) {
        this.impPlStatusCd = impPlStatusCd;
    }

    /**
     * 점검자 ID 설정
     */
    public void setAuditMenId(String auditMenId) {
        this.auditMenId = auditMenId;
    }

    /**
     * 점검결과상태코드 설정
     */
    public void setAuditResultStatusCd(String auditResultStatusCd) {
        this.auditResultStatusCd = auditResultStatusCd;
    }

    /**
     * 점검자 지정
     * 점검자 지정 시 상태코드도 함께 업데이트
     */
    public void assignAuditor(String auditMenId) {
        this.auditMenId = auditMenId;
        this.auditResultStatusCd = "INS01"; // 점검 진행 중으로 상태 변경
    }

    /**
     * 점검결과 업데이트
     * 점검결과작성 팝업에서 사용
     */
    public void updateAuditResult(
            String auditResultStatusCd, 
            String auditResult, 
            String beforeAuditYn, 
            String auditDetailContent, 
            LocalDate auditDoneDt) {
        this.auditResultStatusCd = auditResultStatusCd;
        this.auditResult = auditResult;
        this.beforeAuditYn = beforeAuditYn;
        this.auditDetailContent = auditDetailContent;
        this.auditDoneDt = auditDoneDt;
    }

    // HodIcItem과의 연관관계 설정 (임시 주석처리 - 삭제 문제 해결 후 복원)
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "hod_ic_item_id", insertable = false, updatable = false)
    // private HodIcItem hodIcItem;
}