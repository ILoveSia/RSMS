package org.itcen.domain.positions.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.itcen.common.entity.BaseTimeEntity;

/**
 * 직책 소관부서 엔티티
 * 
 * 직책별 소관부서 정보를 저장하는 엔티티입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책-소관부서 관계 데이터 저장만 담당
 * - Open/Closed: 새로운 필드 추가 시 확장 가능
 * - Liskov Substitution: BaseTimeEntity를 올바르게 상속
 * - Interface Segregation: 필요한 인터페이스만 구현
 * - Dependency Inversion: 구체적인 구현에 의존하지 않음
 */
@Entity
@Table(name = "positions_owner_dept")
@Data
@EqualsAndHashCode(callSuper = false)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PositionOwnerDept extends BaseTimeEntity {

    /**
     * 직책 소관부서 ID (Primary Key)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "positions_owner_dept_id", nullable = false)
    private Long positionsOwnerDeptId;

    /**
     * 원본 직책등록ID
     */
    @Column(name = "positions_id", nullable = false)
    private Long positionsId;

    /**
     * 소관부서코드
     */
    @Column(name = "owner_dept_cd", length = 10)
    private String ownerDeptCd;

    /**
     * 직책과의 연관관계 (옵션)
     * 필요 시 fetch join 등에 활용 가능
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "positions_id", referencedColumnName = "positions_id", insertable = false, updatable = false)
    private Position position;
} 