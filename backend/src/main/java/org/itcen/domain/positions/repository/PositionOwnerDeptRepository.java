package org.itcen.domain.positions.repository;

import org.itcen.domain.positions.entity.PositionOwnerDept;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 직책 소관부서 Repository
 * 
 * 직책 소관부서 엔티티에 대한 데이터 액세스를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 소관부서 데이터 액세스만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface PositionOwnerDeptRepository extends JpaRepository<PositionOwnerDept, Long> {

    /**
     * 특정 직책의 소관부서 목록 조회
     */
    List<PositionOwnerDept> findByPositionsId(Long positionsId);

    /**
     * 특정 부서코드의 직책 목록 조회
     */
    List<PositionOwnerDept> findByOwnerDeptCd(String ownerDeptCd);

    /**
     * 특정 직책의 모든 소관부서 삭제
     */
    void deleteByPositionsId(Long positionsId);

    /**
     * 직책-부서 조합 존재 여부 확인
     */
    boolean existsByPositionsIdAndOwnerDeptCd(Long positionsId, String ownerDeptCd);

    /**
     * 특정 직책의 소관부서 개수 조회
     */
    Long countByPositionsId(Long positionsId);

    /**
     * 특정 부서의 직책 개수 조회
     */
    Long countByOwnerDeptCd(String ownerDeptCd);

    void deleteByPosition_PositionsId(Long positionsId);

    List<PositionOwnerDept> findByPosition_PositionsId(Long positionsId);
} 