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
                    h.hod_ic_item_id as "hodIcItemId",
                    r.responsibility_id as "responsibilityId",
                    r.responsibility_content as "responsibilityContent",
                    h.responsibility_detail_id as "responsibilityDetailId",
                    rd.responsibility_detail_content as "responsibilityDetailContent",
                    rd.responsibility_rel_evid as "responsibilityRelEvid",
                    h.dept_cd as "deptCd",
                    d.department_name as "deptName",
                    h.field_type_cd as "fieldTypeCd",
                    cc1.code_name as "fieldTypeName",
                    h.role_type_cd as "roleTypeCd",
                    cc2.code_name as "roleTypeName",
                    h.ic_task as "icTask",
                    h.measure_desc as "measureDesc",
                    h.measure_type as "measureType",
                    h.period_cd as "periodCd",
                    cc3.code_name as "periodName",
                    h.support_doc as "supportDoc",
                    h.check_period as "checkPeriod",
                    cc4.code_name as "checkPeriodName",
                    h.check_way as "checkWay",
                    h.created_at as "createdAt",
                    h.updated_at as "updatedAt",
                    COALESCE(a.appr_stat_cd, 'NONE') as "approvalStatus",
                    h.ledger_orders as "ledgerOrders"
                FROM hod_ic_item h
                INNER JOIN responsibility r ON h.responsibility_id = r.responsibility_id
                LEFT JOIN responsibility_detail rd ON h.responsibility_detail_id = rd.responsibility_detail_id
                LEFT JOIN departments d ON h.dept_cd = d.department_id
                LEFT JOIN common_code cc1 ON h.field_type_cd = cc1.code AND cc1.group_code = 'FIELD_TYPE' AND cc1.use_yn = 'Y'
                LEFT JOIN common_code cc2 ON h.role_type_cd = cc2.code AND (cc2.group_code = 'UNI_ROLE_TYPE' OR cc2.group_code = 'COM_ROLE_TYPE') AND cc2.use_yn = 'Y'
                LEFT JOIN common_code cc3 ON h.period_cd = cc3.code AND cc3.group_code = 'PERIOD' AND cc3.use_yn = 'Y'
                LEFT JOIN common_code cc4 ON h.check_period = cc4.code AND cc4.group_code = 'MONTH' AND cc4.use_yn = 'Y'
                LEFT JOIN approval a ON h.hod_ic_item_id = a.task_id AND a.task_type_cd = 'hod_ic_item'
                WHERE (:ledgerOrders IS NULL OR h.ledger_orders = :ledgerOrders)
                  AND (:fieldType IS NULL OR h.field_type_cd = :fieldType)
                ORDER BY h.hod_ic_item_id
            """, nativeQuery = true)
    List<HodICItemStatusProjection> findHodICItemStatusList(
            @Param("ledgerOrders") Long ledgerOrders,
            @Param("fieldType") String fieldType);

    /**
     * 특정 책무번호로 부서장 내부통제 항목 조회
     */
    @Query("SELECT h FROM HodICItem h WHERE h.ledgerOrders = :ledgerOrders")
    List<HodICItem> findByLedgerOrders(@Param("ledgerOrders") Long ledgerOrders);

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
                LEFT JOIN approval a ON h.hod_ic_item_id = a.task_id AND a.task_type_cd = 'hod_ic_item'
                WHERE (:approvalStatus IS NULL OR COALESCE(a.appr_stat_cd, 'NONE') = :approvalStatus)
            """,
            nativeQuery = true)
    List<HodICItem> findByApprovalStatus(@Param("approvalStatus") String approvalStatus);
}
