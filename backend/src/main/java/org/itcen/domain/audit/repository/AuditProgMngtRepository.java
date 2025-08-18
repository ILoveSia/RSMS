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
     * 점검 현황(항목별) 조회
     * 
     * audit_prog_mngt와 audit_prog_mngt_detail 조인 후
     * hod_ic_item과 responsibility, role_resp_status, positions 조인
     * 
     * 조회조건: ledger_orders_hod(원장차수), audit_result_status_cd(점검결과)
     */
    @Query("""
            SELECT new org.itcen.domain.audit.dto.AuditItemStatusResponseDto(
                hi.hodIcItemId,
                apd.auditProgMngtDetailId,
                COALESCE(r.responsibilityContent, ''),
                COALESCE(rd.responsibilityDetailContent, ''),
                COALESCE(p.positionsNm, '미정'),
                COALESCE(hi.deptCd, ''),
                COALESCE(hi.fieldTypeCd, ''),
                COALESCE(hi.roleTypeCd, ''),
                COALESCE(hi.icTask, ''),
                COALESCE(emp.empName, apd.auditMenId, ''),
                COALESCE(apd.auditResultStatusCd, ''),
                COALESCE(rrs.roleSumm, ''),
                COALESCE(apm.ledgerOrdersHod, 0L),
                COALESCE(apd.auditResult, ''),
                COALESCE(CAST(apd.auditDoneDt AS string), ''),
                COALESCE(apd.auditDetailContent, ''),
                COALESCE(apm.auditStatusCd, ''),
                COALESCE(hi.responsibilityId, 0L)
            )
            FROM org.itcen.domain.audit.entity.AuditProgMngt apm
            INNER JOIN org.itcen.domain.audit.entity.AuditProgMngtDetail apd ON apm.auditProgMngtId = apd.auditProgMngtId
            INNER JOIN org.itcen.domain.audit.entity.HodIcItem hi ON apd.hodIcItemId = hi.hodIcItemId
            LEFT JOIN org.itcen.domain.responsibility.entity.Responsibility r ON hi.responsibilityId = r.id
            LEFT JOIN org.itcen.domain.responsibility.entity.ResponsibilityDetail rd ON hi.responsibilityDetailId = rd.responsibilityDetailId
            LEFT JOIN org.itcen.domain.audit.entity.RoleRespStatus rrs ON hi.responsibilityId = rrs.responsibilityId
            LEFT JOIN org.itcen.domain.positions.entity.Position p ON rrs.positionsId = p.positionsId
            LEFT JOIN org.itcen.domain.employee.entity.Employee emp ON apd.auditMenId = emp.empNo
            WHERE (:ledgerOrdersHod IS NULL OR apm.ledgerOrdersHod = :ledgerOrdersHod)
            AND (:auditResultStatusCd IS NULL OR :auditResultStatusCd = '' OR apd.auditResultStatusCd = :auditResultStatusCd)
            ORDER BY apm.auditProgMngtCd, apd.auditProgMngtDetailId
            """)
    List<AuditItemStatusResponseDto> findAuditItemStatus(
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