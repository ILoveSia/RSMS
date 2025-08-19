package org.itcen.domain.audit.repository;

import org.itcen.domain.audit.entity.AuditProgMngtDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 점검계획관리상세 Repository
 * 
 * 단일 책임 원칙(SRP): 점검계획관리상세 데이터 접근만 담당
 * 의존성 역전 원칙(DIP): JpaRepository 인터페이스에 의존
 */
@Repository
public interface AuditProgMngtDetailRepository extends JpaRepository<AuditProgMngtDetail, Long> {

    /**
     * 점검계획코드로 상세 목록 조회
     */
    List<AuditProgMngtDetail> findByAuditProgMngtCd(String auditProgMngtCd);
    
    /**
     * 점검계획코드로 상세 삭제
     */
    void deleteByAuditProgMngtCd(String auditProgMngtCd);
    
    /**
     * 점검계획ID로 상세 목록 조회
     */
    List<AuditProgMngtDetail> findByAuditProgMngtId(Long auditProgMngtId);
    
    /**
     * 점검계획ID로 상세 삭제
     */
    @Modifying
    @Query("DELETE FROM AuditProgMngtDetail d WHERE d.auditProgMngtId = :auditProgMngtId")
    void deleteByAuditProgMngtId(@Param("auditProgMngtId") Long auditProgMngtId);
    
    /**
     * 부서장 내부통제 항목 ID로 점검자 업데이트 (상태코드도 함께 변경)
     */
    @Modifying
    @Query("UPDATE AuditProgMngtDetail d SET d.auditMenId = :auditorEmpNo, d.auditResultStatusCd = 'INS01' WHERE d.hodIcItemId = :hodIcItemId")
    int updateAuditorByHodIcItemId(@Param("hodIcItemId") Long hodIcItemId, @Param("auditorEmpNo") String auditorEmpNo);
    
    /**
     * 점검결과상태코드로 상세 목록 조회
     */
    List<AuditProgMngtDetail> findByAuditResultStatusCd(String auditResultStatusCd);
    
    /**
     * 점검계획관리상세 ID 목록으로 조회
     */
    List<AuditProgMngtDetail> findByAuditProgMngtDetailIdIn(List<Long> auditProgMngtDetailIds);
    
    /**
     * 점검계획관리상세 ID로 개선계획상태코드를 PLI03(계획결재완료)으로 업데이트
     * 동시에 점검최종결과여부를 'Y'로 업데이트
     * 결재 승인 시 호출되는 메서드
     */
    @Modifying
    @Query("UPDATE AuditProgMngtDetail d SET d.impPlStatusCd = 'PLI03', d.auditFinalResultYn = 'Y' WHERE d.auditProgMngtDetailId = :auditProgMngtDetailId")
    int updateImpPlStatusToPLI03(@Param("auditProgMngtDetailId") Long auditProgMngtDetailId);
}