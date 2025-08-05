package org.itcen.domain.audit.repository;

import org.itcen.domain.audit.entity.HodIcItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 부서장 내부통제 항목 Repository
 * 
 * 단일 책임 원칙(SRP): 부서장 내부통제 항목 데이터 접근만 담당
 * 의존성 역전 원칙(DIP): JpaRepository 인터페이스에 의존
 */
@Repository
public interface HodIcItemRepository extends JpaRepository<HodIcItem, Long> {

    /**
     * 책무번호(원장차수)로 내부통제 항목 조회
     * 
     * @param ledgerOrders 책무번호
     * @return 내부통제 항목 목록
     */
    List<HodIcItem> findByLedgerOrdersAndDateExpiredAfter(Long ledgerOrders, java.time.LocalDate date);

    /**
     * 책무번호로 유효한 내부통제 항목 조회 (responsibility, responsibility_detail 조인)
     * 
     * @param ledgerOrders 책무번호
     * @return 유효한(만료되지 않은) 내부통제 항목 목록
     */
    @Query("SELECT h FROM HodIcItem h " +
           "LEFT JOIN FETCH h.responsibility r " +
           "LEFT JOIN FETCH h.responsibilityDetail rd " +
           "WHERE h.ledgerOrders = :ledgerOrders AND h.dateExpired >= CURRENT_DATE")
    List<HodIcItem> findActiveItemsByLedgerOrders(@Param("ledgerOrders") Long ledgerOrders);
}