package org.itcen.domain.audit.repository;

import org.itcen.domain.audit.entity.AuditProgMngt;
import org.springframework.data.jpa.repository.JpaRepository;
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
}