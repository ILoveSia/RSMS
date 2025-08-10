package org.itcen.domain.positions.repository;

import java.util.List;
import java.util.Optional;
import org.itcen.domain.positions.entity.LedgerOrdersHod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 부서장 원장차수 Repository
 *
 * 부서장 원장차수 엔티티에 대한 데이터 액세스를 담당합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 원장차수 데이터 액세스만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface LedgerOrdersHodRepository extends JpaRepository<LedgerOrdersHod, Long> {

    /**
     * 모든 부서장 원장차수 목록 조회 (SelectBox용)
     */
    @Query("SELECT l FROM LedgerOrdersHod l ORDER BY l.ledgerOrdersHodId DESC")
    List<LedgerOrdersHod> findAllOrderByIdDesc();

    /**
     * 필드타입코드로 부서장 원장차수 목록 조회
     */
    List<LedgerOrdersHod> findByLedgerOrdersHodFieldTypeCd(String fieldTypeCd);

    /**
     * 상태코드로 부서장 원장차수 목록 조회
     */
    List<LedgerOrdersHod> findByLedgerOrdersHodStatusCd(String statusCd);

    /**
     * 확정코드로 부서장 원장차수 목록 조회
     */
    List<LedgerOrdersHod> findByLedgerOrdersHodConfCd(String confCd);

    /**
     * 제목으로 부서장 원장차수 검색 (부분 검색)
     */
    List<LedgerOrdersHod> findByLedgerOrdersHodTitleContaining(String title);

    /**
     * 복합 조건 검색 (동적 쿼리)
     */
    @Query("SELECT l FROM LedgerOrdersHod l WHERE "
            + "(:fieldTypeCd IS NULL OR l.ledgerOrdersHodFieldTypeCd = :fieldTypeCd) AND "
            + "(:statusCd IS NULL OR l.ledgerOrdersHodStatusCd = :statusCd) AND "
            + "(:confCd IS NULL OR l.ledgerOrdersHodConfCd = :confCd) AND "
            + "(:title IS NULL OR l.ledgerOrdersHodTitle LIKE %:title%) "
            + "ORDER BY l.ledgerOrdersHodId DESC")
    List<LedgerOrdersHod> findBySearchConditions(
            @Param("fieldTypeCd") String fieldTypeCd,
            @Param("statusCd") String statusCd,
            @Param("confCd") String confCd,
            @Param("title") String title);

    /**
     * 제목 중복 체크
     */
    boolean existsByLedgerOrdersHodTitle(String title);

    /**
     * 제목 중복 체크 (수정 시)
     */
    boolean existsByLedgerOrdersHodTitleAndLedgerOrdersHodIdNot(String title, Long id);

    /**
     * 원장차수 ID로 중복 체크
     * 같은 원장차수에 대해 부서장차수가 이미 생성되었는지 확인
     */
    boolean existsByLedgerOrdersId(Long ledgerOrdersId);

    /**
     * 최신 부서장 원장차수 조회 (ID 기준 최대값)
     */
    @Query("SELECT l FROM LedgerOrdersHod l WHERE l.ledgerOrdersHodId = (SELECT MAX(h.ledgerOrdersHodId) FROM LedgerOrdersHod h)")
    Optional<LedgerOrdersHod> findLatestLedgerOrdersHod();
}