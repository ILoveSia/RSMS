package org.itcen.domain.positions.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

/**
 * 부서장 원장차수 엔티티
 *
 * 부서장 원장차수 정보를 저장하는 엔티티입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 원장차수 데이터 저장만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 상속
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "ledger_orders_hod")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerOrdersHod extends BaseTimeEntity {

    /**
     * 원장차수ID (Primary Key)
     * 데이터베이스에서 자동 생성 (IDENTITY)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ledger_orders_hod_id", nullable = false)
    private Long ledgerOrdersHodId;

    /**
     * 원장차수제목
     */
    @Column(name = "ledger_orders_hod_title", length = 300)
    private String ledgerOrdersHodTitle;

    /**
     * 원장차수필드타입코드
     */
    @Column(name = "ledger_orders_hod_field_type_cd", length = 2)
    private String ledgerOrdersHodFieldTypeCd;

    /**
     * 원장차수상태코드
     */
    @Column(name = "ledger_orders_hod_status_cd", length = 2)
    private String ledgerOrdersHodStatusCd;

    /**
     * 원장차수확정코드
     */
    @Column(name = "ledger_orders_hod_conf_cd", length = 2)
    private String ledgerOrdersHodConfCd;

    /**
     * 원장차수 ID (외래키)
     * ledger_orders 테이블의 ledger_orders_id 참조
     */
    @Column(name = "ledger_orders_id")
    private Long ledgerOrdersId;
}