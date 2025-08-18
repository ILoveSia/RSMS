package org.itcen.domain.positions.repository;

import org.itcen.domain.positions.entity.LedgerOrders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
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

    // ====== 메인 대시보드용 쿼리 메서드들 ======
    
    /**
     * 사용자와 관련된 원장관리 건수 조회
     * (담당자 또는 관련자로 배정된 건)
     */
    @Query(value = """
            SELECT COUNT(lo.ledger_orders_id)
            FROM ledger_orders lo
            LEFT JOIN positions p ON lo.ledger_orders_id = p.ledger_orders_id
            LEFT JOIN employee e ON p.emp_no = e.emp_no
            WHERE e.emp_no = :userId
            OR lo.created_by = :userId
            """, nativeQuery = true)
    Integer countManagementTasksByUserId(@Param("userId") String userId);

    /**
     * 사용자별 현재 진행 중인 원장관리 프로세스 정보
     * ORDER_STATUS 코드그룹 기반으로 단계 매핑
     */
    @Query(value = """
            SELECT lo.ledger_orders_id as processId,
                   lo.ledger_orders_title as processName,
                   CASE 
                       WHEN lo.ledger_orders_status_cd = 'OS01' THEN '신규'
                       WHEN lo.ledger_orders_status_cd = 'OS02' THEN '직책확정'
                       WHEN lo.ledger_orders_status_cd = 'OS03' THEN '직책별책무확정'
                       WHEN lo.ledger_orders_status_cd = 'OS04' THEN '임원확정'
                       WHEN lo.ledger_orders_status_cd = 'OS05' THEN '최종확정'
                       ELSE lo.ledger_orders_status_cd
                   END as currentStepTitle,
                   CASE 
                       WHEN lo.ledger_orders_status_cd = 'OS01' THEN 0
                       WHEN lo.ledger_orders_status_cd = 'OS02' THEN 1
                       WHEN lo.ledger_orders_status_cd = 'OS03' THEN 2
                       WHEN lo.ledger_orders_status_cd = 'OS04' THEN 3
                       WHEN lo.ledger_orders_status_cd = 'OS05' THEN 4
                       ELSE 0
                   END as currentStep,
                   5 as totalSteps,
                   CASE 
                       WHEN lo.ledger_orders_status_cd = 'OS01' THEN 20
                       WHEN lo.ledger_orders_status_cd = 'OS02' THEN 40
                       WHEN lo.ledger_orders_status_cd = 'OS03' THEN 60
                       WHEN lo.ledger_orders_status_cd = 'OS04' THEN 80
                       WHEN lo.ledger_orders_status_cd = 'OS05' THEN 100
                       ELSE 0
                   END as progress,
                   COALESCE(e.emp_name, lo.created_by) as assignee
            FROM ledger_orders lo
            LEFT JOIN positions p ON lo.ledger_orders_id = p.ledger_orders_id
            LEFT JOIN employee e ON p.emp_no = e.emp_no
            WHERE e.emp_no = :userId
            OR lo.created_by = :userId
            ORDER BY lo.created_at DESC
            LIMIT 1
            """, nativeQuery = true)
    List<Object[]> getCurrentManagementProcessByUserId(@Param("userId") String userId);
}