package org.itcen.domain.positions.repository;

import org.itcen.domain.positions.entity.LedgerOrders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * 원장차수 Repository
 * 
 * 원장차수 엔티티에 대한 데이터 액세스를 담당합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 데이터 액세스만 담당
 * - Open/Closed: 새로운 쿼리 메서드 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface LedgerOrdersRepository extends JpaRepository<LedgerOrders, Long> {

    /**
     * 가장 최근의 원장차수 조회 (ID 기준 최대값)
     * 
     * @return 가장 최근의 원장차수 정보
     */
    @Query("SELECT lo FROM LedgerOrders lo WHERE lo.ledgerOrdersId = (SELECT MAX(lo2.ledgerOrdersId) FROM LedgerOrders lo2)")
    Optional<LedgerOrders> findLatestLedgerOrder();

    /**
     * 특정 진행상태의 원장차수 존재 여부 확인
     * 
     * @param statusCd 진행상태 코드
     * @return 존재 여부
     */
    boolean existsByLedgerOrdersStatusCd(String statusCd);

    /**
     * 특정 제목의 원장차수 존재 여부 확인
     * 
     * @param title 원장차수 제목
     * @return 존재 여부
     */
    boolean existsByLedgerOrdersTitle(String title);

    /**
     * 제목으로 원장차수 조회
     * 
     * @param title 원장차수 제목
     * @return 원장차수 정보
     */
    Optional<LedgerOrders> findByLedgerOrdersTitle(String title);
}