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
                COALESCE(app.appr_stat_cd, '') as approvalStatusCd
            FROM audit_prog_mngt apm
            INNER JOIN audit_prog_mngt_detail apd ON apm.audit_prog_mngt_id = apd.audit_prog_mngt_id
            INNER JOIN hod_ic_item hi ON apd.hod_ic_item_id = hi.hod_ic_item_id
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