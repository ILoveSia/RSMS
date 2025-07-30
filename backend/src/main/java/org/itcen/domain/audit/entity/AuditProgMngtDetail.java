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

    @Column(name = "audit_detail_coantent", length = 1000)
    private String auditDetailContent;

    @Column(name = "audit_done_dt")
    private LocalDate auditDoneDt;

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

    // HodIcItem과의 연관관계 설정 (임시 주석처리 - 삭제 문제 해결 후 복원)
    // @ManyToOne(fetch = FetchType.LAZY)
    // @JoinColumn(name = "hod_ic_item_id", insertable = false, updatable = false)
    // private HodIcItem hodIcItem;
}