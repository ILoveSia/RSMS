package org.itcen.domain.positions.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

/**
 * 직책 엔티티
 *
 * 직책 정보를 저장하는 메인 엔티티입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 직책 데이터 저장만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 상속
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "positions")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Position extends BaseTimeEntity {

    /**
     * 직책등록ID (Primary Key)
     * 데이터베이스에서 자동 생성 (IDENTITY)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    /**
     * 원장차수
     */
    @Column(name = "ledger_order")
    private Long ledgerOrder;

    /**
     * 직책명
     */
    @Column(name = "positions_nm", length = 200)
    private String positionsNm;

    /**
     * 확정구분코드
     */
    @Column(name = "confirm_gubun_cd", length = 10)
    private String confirmGubunCd;

    /**
     * 책무기술서 작성 부서코드
     */
    @Column(name = "write_dept_cd", length = 10)
    private String writeDeptCd;
}
