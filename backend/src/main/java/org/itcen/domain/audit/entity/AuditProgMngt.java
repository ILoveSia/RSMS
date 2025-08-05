package org.itcen.domain.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * 점검계획관리 Entity
 * 
 * 단일 책임 원칙(SRP): 점검계획관리 데이터 관리만 담당
 * 개방-폐쇄 원칙(OCP): BaseTimeEntity를 확장하여 감사 필드 재사용
 */
@Entity
@Table(name = "audit_prog_mngt")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditProgMngt extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_prog_mngt_id")
    private Long auditProgMngtId;

    @Column(name = "audit_prog_mngt_cd", length = 100, nullable = false)
    private String auditProgMngtCd;

    @Column(name = "ledger_orders_hod", nullable = false)
    private Long ledgerOrdersHod;

    @Column(name = "audit_title", length = 300, nullable = false)
    private String auditTitle;

    @Column(name = "audit_start_dt", nullable = false)
    private LocalDate auditStartDt;

    @Column(name = "audit_end_dt", nullable = false)
    private LocalDate auditEndDt;

    @Column(name = "audit_status_cd", length = 100)
    private String auditStatusCd;

    @Column(name = "audit_contents", length = 1000)
    private String auditContents;

    // AuditProgMngtDetail과의 연관관계 설정
    @OneToMany(mappedBy = "auditProgMngt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AuditProgMngtDetail> details = new ArrayList<>();

    /**
     * 점검계획 상세 추가
     */
    public void addDetail(AuditProgMngtDetail detail) {
        this.details.add(detail);
        detail.setAuditProgMngt(this);
    }

    /**
     * 점검계획 상세 모두 제거
     */
    public void clearDetails() {
        this.details.clear();
    }
}