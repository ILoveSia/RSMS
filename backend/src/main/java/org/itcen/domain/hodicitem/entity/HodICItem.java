package org.itcen.domain.hodicitem.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;
import org.itcen.domain.responsibility.entity.Responsibility;
import org.itcen.domain.responsibility.entity.ResponsibilityDetail;
import org.itcen.domain.departments.entity.Department;

import java.time.LocalDate;

/**
 * 부서장 내부통제 항목 엔티티
 *
 * 부서장 내부통제 항목 정보를 저장하는 엔티티입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 내부통제 항목 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 상속
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "hod_ic_item")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HodICItem extends BaseTimeEntity {

    /**
     * 부서장 내부통제 항목 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "hod_ic_item_id", nullable = false)
    private Long hodIcItemId;

    /**
     * 책무 ID (Foreign Key)
     */
    @Column(name = "responsibility_id", nullable = false)
    private Long responsibilityId;

    /**
     * 책무상세 ID (Foreign Key)
     */
    @Column(name = "responsibility_detail_id")
    private Long responsibilityDetailId;

    /**
     * 책무번호(원장차수)
     */
    @Column(name = "ledger_orders")
    private Long ledgerOrders;

    /**
     * 부서장책무번호(원장차수)
     */
    @Column(name = "ledger_orders_hod")
    private Long ledgerOrdersHod;

    /**
     * 책무상태코드
     */
    @Column(name = "order_status", length = 20)
    private String orderStatus;

    /**
     * 결재 ID (Foreign Key)
     */
    @Column(name = "approval_id")
    private Long approvalId;

    /**
     * 만료일
     */
    @Column(name = "date_expired")
    @Builder.Default
    private LocalDate dateExpired = LocalDate.of(9999, 12, 31);

    /**
     * 항목구분 (부서공통항목, 부서고유항목) FIELD_TYPE
     */
    @Column(name = "field_type_cd", length = 10)
    private String fieldTypeCd;

    /**
     * 직무구분코드 (COM_ROLE_TYPE, UNI_ROLE_TYPE)
     */
    @Column(name = "role_type_cd", length = 10)
    private String roleTypeCd;

    /**
     * 부서코드
     */
    @Column(name = "dept_cd", length = 10)
    private String deptCd;

    /**
     * 내부통제업무
     */
    @Column(name = "ic_task", length = 1000)
    private String icTask;

    /**
     * 조치활동ID (삭제예정)
     */
    @Column(name = "measure_id", length = 100)
    private String measureId;

    /**
     * 조치활동내용
     */
    @Column(name = "measure_desc", length = 1000)
    private String measureDesc;

    /**
     * 조치유형
     */
    @Column(name = "measure_type", length = 1000)
    private String measureType;

    /**
     * 주기 (PERIOD)
     */
    @Column(name = "period_cd", length = 10)
    private String periodCd;

    /**
     * 관련근거
     */
    @Column(name = "support_doc", length = 1000)
    private String supportDoc;

    /**
     * 점검시기(MONTH)
     */
    @Column(name = "check_period", length = 10)
    private String checkPeriod;

    /**
     * 점검방법
     */
    @Column(name = "check_way", length = 1000)
    private String checkWay;

    /**
     * 증빙자료
     */
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

    /**
     * 부서와의 연관관계 (ManyToOne)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dept_cd", referencedColumnName = "department_id", insertable = false, updatable = false)
    private Department department;
}
