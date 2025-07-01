package org.itcen.domain.positions.repository;

import org.itcen.domain.positions.entity.PositionAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 직책 관리자 Repository
 * 
 * 직책 관리자 엔티티에 대한 데이터 액세스를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 관리자 데이터 액세스만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface PositionAdminRepository extends JpaRepository<PositionAdmin, Long> {

    /**
     * 특정 직책의 관리자 목록 조회
     */
    List<PositionAdmin> findByPositionsId(Long positionsId);

    /**
     * 특정 관리자가 관리하는 직책 목록 조회
     */
    List<PositionAdmin> findByPositionsAdminId(String positionsAdminId);

    /**
     * 특정 직책의 모든 관리자 삭제
     */
    void deleteByPositionsId(Long positionsId);

    /**
     * 특정 관리자의 모든 직책 삭제
     */
    void deleteByPositionsAdminId(String positionsAdminId);

    /**
     * 직책-관리자 조합 존재 여부 확인
     */
    boolean existsByPositionsIdAndPositionsAdminId(Long positionsId, String positionsAdminId);

    /**
     * 특정 직책의 관리자 개수 조회
     */
    Long countByPositionsId(Long positionsId);

    /**
     * 특정 관리자의 직책 개수 조회
     */
    Long countByPositionsAdminId(String positionsAdminId);

    List<PositionAdmin> findByPosition_PositionsId(Long positionsId);
    void deleteByPosition_PositionsId(Long positionsId);
} 