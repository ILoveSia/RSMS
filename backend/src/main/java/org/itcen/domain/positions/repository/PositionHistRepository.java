package org.itcen.domain.positions.repository;

import org.itcen.domain.positions.entity.PositionHist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 직책 히스토리 Repository
 * 
 * 직책 히스토리 엔티티에 대한 데이터 액세스를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 히스토리 데이터 액세스만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface PositionHistRepository extends JpaRepository<PositionHist, Long> {

    /**
     * 특정 직책에 대한 모든 히스토리를 시간 역순으로 조회합니다.
     * @param positionsId 원본 직책 ID
     * @return 직책 히스토리 목록
     */
    List<PositionHist> findByPositionsIdOrderByHistoryIdDesc(Long positionsId);

    /**
     * 특정 직책의 히스토리 조회 (페이징)
     */
    Page<PositionHist> findByPositionsIdOrderByHistoryIdDesc(Long positionsId, Pageable pageable);

    /**
     * 특정 기간의 히스토리 조회
     */
    List<PositionHist> findByHistoryIdBetweenOrderByHistoryIdDesc(
            LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 특정 직책의 특정 기간 히스토리 조회
     */
    List<PositionHist> findByPositionsIdAndHistoryIdBetweenOrderByHistoryIdDesc(
            Long positionsId, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * 특정 직책의 히스토리 개수 조회
     */
    Long countByPositionsId(Long positionsId);
} 