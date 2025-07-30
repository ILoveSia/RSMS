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
            COALESCE(apd.auditMenId, ''),
            COALESCE(apd.auditResultStatusCd, ''),
            COALESCE(rrs.roleSumm, ''),
            COALESCE(apm.ledgerOrdersHod, ''),
            COALESCE(apd.auditResult, ''),
            COALESCE(CAST(apd.auditDoneDt AS string), ''),
            COALESCE(apd.auditDetailContent, '')
        )
        FROM org.itcen.domain.audit.entity.AuditProgMngt apm
        INNER JOIN org.itcen.domain.audit.entity.AuditProgMngtDetail apd ON apm.auditProgMngtId = apd.auditProgMngtId
        INNER JOIN org.itcen.domain.audit.entity.HodIcItem hi ON apd.hodIcItemId = hi.hodIcItemId
        LEFT JOIN org.itcen.domain.responsibility.entity.Responsibility r ON hi.responsibilityId = r.id
        LEFT JOIN org.itcen.domain.responsibility.entity.ResponsibilityDetail rd ON hi.responsibilityDetailId = rd.responsibilityDetailId
        LEFT JOIN org.itcen.domain.audit.entity.RoleRespStatus rrs ON r.id = rrs.responsibilityId
        LEFT JOIN org.itcen.domain.positions.entity.Position p ON rrs.positionsId = p.positionsId
        WHERE (:ledgerOrdersHod IS NULL OR :ledgerOrdersHod = '' OR apm.ledgerOrdersHod = :ledgerOrdersHod)
        AND (:auditResultStatusCd IS NULL OR :auditResultStatusCd = '' OR apd.auditResultStatusCd = :auditResultStatusCd)
        ORDER BY apm.auditProgMngtCd, apd.auditProgMngtDetailId
        """)
    List<AuditItemStatusResponseDto> findAuditItemStatus(
        @Param("ledgerOrdersHod") String ledgerOrdersHod,
        @Param("auditResultStatusCd") String auditResultStatusCd
    );
    
    /**
     * 점검계획ID 목록으로 점검계획 목록 조회
     */
    List<AuditProgMngt> findByAuditProgMngtIdIn(List<Long> auditProgMngtIds);
}