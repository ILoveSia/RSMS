package org.itcen.domain.hodicitem.repository;

import java.util.List;
import org.itcen.domain.hodicitem.dto.HodICItemStatusProjection;
import org.itcen.domain.hodicitem.entity.HodICItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 부서장 내부통제 항목 Repository
 *
 * 부서장 내부통제 항목 엔티티에 대한 데이터 액세스를 담당합니다. JOIN 쿼리를 통해 관련 테이블의 데이터를 함께 조회합니다.
 *
 * SOLID 원칙: - Single Responsibility: 부서장 내부통제 항목 데이터 액세스만 담당 - Interface Segregation: 필요한 메서드만 정의 -
 * Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
@Repository
public interface HodICItemRepository extends JpaRepository<HodICItem, Long> {

    /**
     * 부서장 내부통제 항목 현황 조회 (JOIN 쿼리) hod_ic_item, responsibility INNER JOIN approval은 OUTER JOIN하여
     * 결재상태 조회 (Native Query 사용)
     */
    @Query(value = """
                SELECT
                    h.hod_ic_item_id as hodIcItemId,
                    r.responsibility_id as responsibilityId,
                    r.responsibility_content as responsibilityContent,
                    h.dept_cd as deptCd,
                    h.field_type_cd as fieldTypeCd,
                    h.role_type_cd as roleTypeCd,
                    h.ic_task as icTask,
                    h.measure_desc as measureDesc,
                    h.measure_type as measureType,
                    h.period_cd as periodCd,
                    h.support_doc as supportDoc,
                    h.check_period as checkPeriod,
                    h.check_way as checkWay,
                    h.created_at as createdAt,
                    h.updated_at as updatedAt,
                    COALESCE(a.appr_stat_cd, 'NONE') as approvalStatus,
                    h.ledger_order as ledgerOrder
                FROM hod_ic_item h
                INNER JOIN responsibility r ON h.responsibility_id = r.responsibility_id
                LEFT JOIN approval a ON h.approval_id = a.approval_id
                WHERE (:ledgerOrder IS NULL OR h.ledger_order = :ledgerOrder)
                ORDER BY h.hod_ic_item_id
            """, nativeQuery = true)
    List<HodICItemStatusProjection> findHodICItemStatusList(
            @Param("ledgerOrder") String ledgerOrder);

    /**
     * 특정 책무번호로 부서장 내부통제 항목 조회
     */
    @Query("SELECT h FROM HodICItem h WHERE h.ledgerOrder = :ledgerOrder")
    List<HodICItem> findByLedgerOrder(@Param("ledgerOrder") String ledgerOrder);

    /**
     * 특정 부서코드로 부서장 내부통제 항목 조회
     */
    @Query("SELECT h FROM HodICItem h WHERE h.deptCd = :deptCd")
    List<HodICItem> findByDeptCd(@Param("deptCd") String deptCd);

    /**
     * 작성자ID로 부서장 내부통제 항목 조회 (결재 승인 요청을 위한 권한 확인용)
     */
    @Query("SELECT h FROM HodICItem h WHERE h.createdId = :createdId")
    List<HodICItem> findByCreatedId(@Param("createdId") String createdId);

    /**
     * 승인 상태별 부서장 내부통제 항목 조회
     */
    @Query(value = """
                SELECT h.* FROM hod_ic_item h
                LEFT JOIN approval a ON h.approval_id = a.approval_id
                WHERE (:approvalStatus IS NULL OR COALESCE(a.appr_stat_cd, 'NONE') = :approvalStatus)
            """,
            nativeQuery = true)
    List<HodICItem> findByApprovalStatus(@Param("approvalStatus") String approvalStatus);
}
