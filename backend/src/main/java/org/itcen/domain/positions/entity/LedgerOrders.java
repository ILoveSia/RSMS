package org.itcen.domain.positions.entity;

import org.itcen.common.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

/**
 * 원장차수 엔티티
 * 
 * ledger_orders 테이블과 매핑됩니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 데이터만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 확장
 * - Interface Segregation: 필요한 데이터만 정의
 * - Dependency Inversion: 구체적인 구현이 아닌 추상화에 의존
 */
@Entity
@Table(name = "ledger_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerOrders extends BaseTimeEntity {

    /**
     * 원장차수 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ledger_orders_id")
    private Long ledgerOrdersId;

    /**
     * 원장차수 제목 (예: "2025-001")
     */
    @Column(name = "ledger_orders_title", length = 300)
    private String ledgerOrdersTitle;

    /**
     * 원장차수 진행상태 코드 (commonCode: ORDER_STATUS)
     * P1: 계획중, P2: 진행중, P3: 완료, P4: 차수생성가능
     */
    @Column(name = "ledger_orders_status_cd", length = 2)
    private String ledgerOrdersStatusCd;

    /**
     * 원장차수 확정코드
     */
    @Column(name = "ledger_orders_conf_cd", length = 2)
    private String ledgerOrdersConfCd;

    /**
     * 원장차수 상태코드 업데이트
     * 
     * @param newStatusCd 새로운 상태코드
     */
    public void updateStatusCd(String newStatusCd) {
        this.ledgerOrdersStatusCd = newStatusCd;
    }
}