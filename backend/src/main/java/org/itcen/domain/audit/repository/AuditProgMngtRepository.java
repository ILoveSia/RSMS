package org.itcen.domain.audit.repository;

import org.itcen.domain.audit.dto.AuditItemStatusResponseDto;
import org.itcen.domain.audit.entity.AuditProgMngt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 점검계획관리 Repository
 * 
 * 단일 책임 원칙(SRP): 점검계획관리 데이터 접근만 담당
 * 의존성 역전 원칙(DIP): JpaRepository 인터페이스에 의존
 */
@Repository
public interface AuditProgMngtRepository extends JpaRepository<AuditProgMngt, Long> {

    /**
     * 점검계획코드로 조회
     */
    Optional<AuditProgMngt> findByAuditProgMngtCd(String auditProgMngtCd);

    /**
     * 가장 최근 점검계획코드 조회 (자동채번용)
     */
    Optional<AuditProgMngt> findTopByOrderByAuditProgMngtCdDesc();

    /**
     * 점검시작일 기간으로 조회
     */
    List<AuditProgMngt> findByAuditStartDtBetween(LocalDate startDate, LocalDate endDate);

    /**
     * 점검시작일이 특정 날짜 이후인 데이터 조회
     */
    List<AuditProgMngt> findByAuditStartDtGreaterThanEqual(LocalDate startDate);

    /**
     * 점검시작일이 특정 날짜 이전인 데이터 조회
     */
    List<AuditProgMngt> findByAuditStartDtLessThanEqual(LocalDate endDate);

    /**
     * 점검 현황(항목별) 조회 - Native Query 사용
     */
    @Query(value = """
            SELECT 
                hi.hod_ic_item_id as hodIcItemId,
                apd.audit_prog_mngt_detail_id as auditProgMngtDetailId,
                COALESCE(r.responsibility_content, '') as responsibilityContent,
                COALESCE(rd.responsibility_detail_content, '') as responsibilityDetailContent,
                COALESCE(p.positions_nm, '미정') as positionsNm,
                COALESCE(hi.dept_cd, '') as deptCd,
                COALESCE(d.department_name, '') as deptName,
                COALESCE(hi.field_type_cd, '') as fieldTypeCd,
                COALESCE(hi.role_type_cd, '') as roleTypeCd,
                COALESCE(hi.ic_task, '') as icTask,
                COALESCE(emp.emp_name, apd.audit_men_id, '') as auditMenId,
                COALESCE(apd.audit_result_status_cd, '') as auditResultStatusCd,
                COALESCE(rrs.role_summ, '') as roleSumm,
                COALESCE(apm.ledger_orders_hod, 0) as ledgerOrdersHod,
                COALESCE(apd.audit_result, '') as auditResult,
                COALESCE(TO_CHAR(apd.audit_done_dt, 'YYYY-MM-DD'), '') as auditDoneDt,
                COALESCE(apd.audit_detail_content, '') as auditDetailContent,
                COALESCE(apm.audit_status_cd, '') as auditStatusCd,
                COALESCE(hi.responsibility_id, 0) as responsibilityId,
                COALESCE(apm.audit_title, '') as auditTitle,
                COALESCE(apm.audit_status_cd, '') as auditStatusCdFromProgMngt,
                COALESCE(apd.imp_pl_status_cd, '') as impPlStatusCd,
                COALESCE(apd.audit_done_content, '') as auditDoneContent,
                COALESCE(app.approval_id, 0) as approvalId,
                COALESCE(app.appr_stat_cd, '') as approvalStatusCd,
                COALESCE(apd.audit_final_result_yn, 'N') as auditFinalResultYn
            FROM audit_prog_mngt apm
            INNER JOIN audit_prog_mngt_detail apd ON apm.audit_prog_mngt_id = apd.audit_prog_mngt_id
            INNER JOIN hod_ic_item hi ON apd.hod_ic_item_id = hi.hod_ic_item_id
            LEFT JOIN departments d ON hi.dept_cd = d.department_id
            LEFT JOIN responsibility r ON hi.responsibility_id = r.responsibility_id
            LEFT JOIN responsibility_detail rd ON hi.responsibility_detail_id = rd.responsibility_detail_id
            LEFT JOIN role_resp_status rrs ON hi.responsibility_id = rrs.responsibility_id
            LEFT JOIN positions p ON rrs.positions_id = p.positions_id
            LEFT JOIN employee emp ON apd.audit_men_id = emp.emp_no
            LEFT JOIN approval app ON app.task_type_cd = 'audit_prog_mngt_detail' AND app.task_id = apd.audit_prog_mngt_detail_id
            WHERE (:ledgerOrdersHod IS NULL OR apm.ledger_orders_hod = :ledgerOrdersHod)
            AND (:auditResultStatusCd IS NULL OR :auditResultStatusCd = '' OR apd.audit_result_status_cd = :auditResultStatusCd)
            ORDER BY apm.audit_prog_mngt_cd, apd.audit_prog_mngt_detail_id
            """, nativeQuery = true)
    List<Object[]> findAuditItemStatusNative(
            @Param("ledgerOrdersHod") Long ledgerOrdersHod,
            @Param("auditResultStatusCd") String auditResultStatusCd);

    /**
     * 점검계획ID 목록으로 점검계획 목록 조회
     */
    List<AuditProgMngt> findByAuditProgMngtIdIn(List<Long> auditProgMngtIds);

    /**
     * 점검계획ID로 연결된 책무 내용들 조회
     * audit_prog_mngt_detail -> hod_ic_item -> responsibility 조인
     */
    @Query(value = """
            SELECT DISTINCT r.responsibility_content
            FROM audit_prog_mngt_detail apd
            INNER JOIN hod_ic_item hi ON apd.hod_ic_item_id = hi.hod_ic_item_id
            LEFT JOIN responsibility r ON hi.responsibility_id = r.responsibility_id
            WHERE apd.audit_prog_mngt_id = :auditProgMngtId
            AND r.responsibility_content IS NOT NULL
            AND r.responsibility_content != ''
            ORDER BY r.responsibility_content
            """, nativeQuery = true)
    List<String> findResponsibilityContentsByAuditProgMngtId(@Param("auditProgMngtId") Long auditProgMngtId);

    /**
     * 부서별 점검결과 현황 조회
     * 부서별로 audit_result_status_cd 코드별 집계
     * audit_result_report와 approval 테이블 조인 추가
     */
    @Query(value = """
            SELECT 
                hi.dept_cd as deptCd,
                d.department_name as deptName,
                COUNT(apd.audit_prog_mngt_detail_id) as totalCount,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS02' THEN 1 END) as appropriateCount,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' THEN 1 END) as inadequateCount,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS04' THEN 1 END) as excludedCount,
                CASE 
                    WHEN COUNT(apd.audit_prog_mngt_detail_id) > 0 
                    THEN ROUND((COUNT(CASE WHEN apd.audit_result_status_cd = 'INS02' THEN 1 END) * 100.0 / COUNT(apd.audit_prog_mngt_detail_id)), 2)
                    ELSE 0.0 
                END as appropriateRate,
                apm.audit_prog_mngt_id as auditProgMngtId,
                arr.audit_result_report_id as auditResultReportId,
                app.approval_id as approvalId,
                COALESCE(app.appr_stat_cd, 'NONE') as approvalStatusCd,
                CASE 
                    WHEN app.appr_stat_cd = 'SUBMITTED' THEN '상신'
                    WHEN app.appr_stat_cd = 'IN_PROGRESS' THEN '진행중'
                    WHEN app.appr_stat_cd = 'REJECTED' THEN '반려'
                    WHEN app.appr_stat_cd = 'APPROVED' THEN '승인'
                    ELSE '미결재'
                END as approvalStatusName
            FROM audit_prog_mngt apm
            INNER JOIN audit_prog_mngt_detail apd ON apm.audit_prog_mngt_id = apd.audit_prog_mngt_id
            INNER JOIN hod_ic_item hi ON apd.hod_ic_item_id = hi.hod_ic_item_id
            LEFT JOIN departments d ON hi.dept_cd = d.department_id
            LEFT JOIN ledger_orders_hod loh ON apm.ledger_orders_hod = loh.ledger_orders_hod_id
            LEFT JOIN audit_result_report arr ON apm.audit_prog_mngt_id = arr.audit_prog_mngt_id AND hi.dept_cd = arr.dept_cd
            LEFT JOIN approval app ON arr.audit_result_report_id = app.task_id AND app.task_type_cd = 'audit_result_report'
            WHERE (:ledgerOrdersId IS NULL OR loh.ledger_orders_hod_id = :ledgerOrdersId)
            AND (:deptCd IS NULL OR :deptCd = '' OR hi.dept_cd = :deptCd)
            AND apd.audit_result_status_cd IN ('INS02', 'INS03', 'INS04')
            GROUP BY hi.dept_cd, d.department_name, apm.audit_prog_mngt_id, arr.audit_result_report_id, app.approval_id, app.appr_stat_cd
            ORDER BY hi.dept_cd
            """, nativeQuery = true)
    List<Object[]> findDeptAuditResultStatusNative(@Param("ledgerOrdersId") Long ledgerOrdersId, @Param("deptCd") String deptCd);

    /**
     * 부서별 개선계획등록 현황 조회
     * 부서별로 미흡사항 대한 개선계획 진행 현황 집계
     */
    @Query(value = """
            SELECT 
                hi.dept_cd as deptCd,
                d.department_name as deptName,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' THEN 1 END) as inadequateCount,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' AND apd.imp_pl_status_cd = 'PLI01' THEN 1 END) as planCreatedCount,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' AND apd.imp_pl_status_cd = 'PLI02' THEN 1 END) as resultWrittenCount,
                COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' AND apd.imp_pl_status_cd = 'PLI03' THEN 1 END) as resultApprovedCount,
                CASE 
                    WHEN COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' THEN 1 END) > 0 
                    THEN ROUND((COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' AND apd.imp_pl_status_cd = 'PLI03' THEN 1 END) * 100.0 / COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' THEN 1 END)), 2)
                    ELSE 0.0 
                END as completionRate
            FROM audit_prog_mngt apm
            INNER JOIN audit_prog_mngt_detail apd ON apm.audit_prog_mngt_id = apd.audit_prog_mngt_id
            INNER JOIN hod_ic_item hi ON apd.hod_ic_item_id = hi.hod_ic_item_id
            LEFT JOIN departments d ON hi.dept_cd = d.department_id
            LEFT JOIN ledger_orders_hod loh ON apm.ledger_orders_hod = loh.ledger_orders_hod_id
            WHERE (:ledgerOrdersId IS NULL OR loh.ledger_orders_hod_id = :ledgerOrdersId)
            AND (:deptCd IS NULL OR :deptCd = '' OR hi.dept_cd = :deptCd)
            GROUP BY hi.dept_cd, d.department_name
            HAVING COUNT(CASE WHEN apd.audit_result_status_cd = 'INS03' THEN 1 END) > 0
            ORDER BY hi.dept_cd
            """, nativeQuery = true)
    List<Object[]> findDeptImprovementPlanStatusNative(@Param("ledgerOrdersId") Long ledgerOrdersId, @Param("deptCd") String deptCd);

    // ====== 메인 대시보드용 쿼리 메서드들 ======
    
    /**
     * 사용자별 점검 업무 건수 조회 (점검자로 배정된 건)
     */
    @Query("SELECT COUNT(apd) FROM AuditProgMngtDetail apd " +
           "WHERE apd.auditMenId = :userId")
    Integer countAuditTasksByUserId(@Param("userId") String userId);

    /**
     * 사용자별 현재 진행 중인 점검 프로세스 정보
     * PLAN_IMP 코드그룹 기반으로 단계 매핑
     */
    @Query(value = """
            SELECT apm.audit_prog_mngt_cd as processId,
                   apm.audit_prog_name as processName,
                   CASE 
                       WHEN apd.imp_pl_status_cd = 'PI01' THEN '계획작성'
                       WHEN apd.imp_pl_status_cd = 'PI02' THEN '계획결재요청'
                       WHEN apd.imp_pl_status_cd = 'PI03' THEN '계획결재완료'
                       WHEN apd.imp_pl_status_cd = 'PI04' THEN '이행작성'
                       WHEN apd.imp_pl_status_cd = 'PI05' THEN '이행결재요청'
                       WHEN apd.imp_pl_status_cd = 'PI06' THEN '이행결재완료'
                       ELSE apd.imp_pl_status_cd
                   END as currentStepTitle,
                   CASE 
                       WHEN apd.imp_pl_status_cd = 'PI01' THEN 0
                       WHEN apd.imp_pl_status_cd = 'PI02' THEN 1
                       WHEN apd.imp_pl_status_cd = 'PI03' THEN 2
                       WHEN apd.imp_pl_status_cd = 'PI04' THEN 3
                       WHEN apd.imp_pl_status_cd = 'PI05' THEN 4
                       WHEN apd.imp_pl_status_cd = 'PI06' THEN 5
                       ELSE 0
                   END as currentStep,
                   6 as totalSteps,
                   CASE 
                       WHEN apd.imp_pl_status_cd = 'PI01' THEN 17
                       WHEN apd.imp_pl_status_cd = 'PI02' THEN 33
                       WHEN apd.imp_pl_status_cd = 'PI03' THEN 50
                       WHEN apd.imp_pl_status_cd = 'PI04' THEN 67
                       WHEN apd.imp_pl_status_cd = 'PI05' THEN 83
                       WHEN apd.imp_pl_status_cd = 'PI06' THEN 100
                       ELSE 0
                   END as progress,
                   apd.audit_men_id as assignee
            FROM audit_prog_mngt apm
            INNER JOIN audit_prog_mngt_detail apd ON apm.audit_prog_mngt_id = apd.audit_prog_mngt_id
            WHERE apd.audit_men_id = :userId
            AND apd.inspect_result_cd = 'INS03'
            ORDER BY apm.created_at DESC
            LIMIT 1
            """, nativeQuery = true)
    List<Object[]> getCurrentAuditProcessByUserId(@Param("userId") String userId);
}