package org.itcen.domain.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;
import org.itcen.domain.responsibility.entity.Responsibility;
import org.itcen.domain.responsibility.entity.ResponsibilityDetail;

import java.time.LocalDate;

/**
 * 부서장 내부통제 항목 Entity
 * 
 * 단일 책임 원칙(SRP): 부서장 내부통제 항목 데이터 관리만 담당
 * 개방-폐쇄 원칙(OCP): BaseTimeEntity를 확장하여 감사 필드 재사용
 */
@Entity
@Table(name = "hod_ic_item")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HodIcItem extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hod_ic_item_id")
    private Long hodIcItemId;

    @Column(name = "responsibility_id", nullable = false)
    private Long responsibilityId;

    @Column(name = "responsibility_detail_id")
    private Long responsibilityDetailId;

    @Column(name = "ledger_orders")
    private Long ledgerOrders;

    @Column(name = "ledger_orders_hod")
    private Long ledgerOrdersHod;

    @Column(name = "order_status", length = 20)
    private String orderStatus;

    @Column(name = "approval_id")
    private Long approvalId;

    @Column(name = "date_expired")
    @Builder.Default
    private LocalDate dateExpired = LocalDate.of(9999, 12, 31);

    @Column(name = "field_type_cd", length = 10)
    private String fieldTypeCd;

    @Column(name = "role_type_cd", length = 10)
    private String roleTypeCd;

    @Column(name = "dept_cd", length = 10)
    private String deptCd;

    @Column(name = "ic_task", length = 1000)
    private String icTask;

    @Column(name = "measure_id", length = 100)
    private String measureId;

    @Column(name = "measure_desc", length = 1000)
    private String measureDesc;

    @Column(name = "measure_type", length = 1000)
    private String measureType;

    @Column(name = "period_cd", length = 10)
    private String periodCd;

    @Column(name = "support_doc", length = 1000)
    private String supportDoc;

    @Column(name = "check_period", length = 10)
    private String checkPeriod;

    @Column(name = "check_way", length = 1000)
    private String checkWay;

    @Column(name = "proof_doc", length = 1000)
    private String proofDoc;

    /**
     * 책무와의 연관관계 (ManyToOne)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_id", referencedColumnName = "responsibility_id", insertable = false, updatable = false)
    private Responsibility responsibility;

    /**
     * 책무상세와의 연관관계 (ManyToOne)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsibility_detail_id", referencedColumnName = "responsibility_detail_id", insertable = false, updatable = false)
    private ResponsibilityDetail responsibilityDetail;
}