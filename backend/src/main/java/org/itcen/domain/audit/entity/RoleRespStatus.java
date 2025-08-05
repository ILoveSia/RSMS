package org.itcen.domain.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

import java.time.LocalDate;

/**
 * 직책별 책무 현황 Entity
 * 
 * 단일 책임 원칙(SRP): 직책별 책무 현황 데이터 관리만 담당
 * 개방-폐쇄 원칙(OCP): BaseTimeEntity를 확장하여 감사 필드 재사용
 */
@Entity
@Table(name = "role_resp_status")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleRespStatus extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_resp_status_id")
    private Long roleRespStatusId;

    @Column(name = "role_summ", length = 100)
    private String roleSumm;

    @Column(name = "role_start_dt", length = 8)
    private String roleStartDt;

    @Column(name = "ledger_order")
    private Long ledgerOrder;

    @Column(name = "approval_id")
    private Long approvalId;

    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    @Column(name = "responsibility_id", nullable = false)
    private Long responsibilityId;

    @Column(name = "date_expired")
    @Builder.Default
    private LocalDate dateExpired = LocalDate.of(9999, 12, 31);
}