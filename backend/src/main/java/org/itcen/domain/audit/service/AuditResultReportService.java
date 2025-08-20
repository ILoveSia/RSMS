package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.AuditResultReportDto;

import java.util.List;

/**
 * 점검결과보고 Service 인터페이스
 * 
 * 단일 책임 원칙(SRP): 점검결과보고 비즈니스 로직 정의만 담당
 * 인터페이스 분리 원칙(ISP): 클라이언트가 사용하지 않는 메서드에 의존하지 않도록 분리
 */
public interface AuditResultReportService {

    /**
     * 점검결과보고서 등록
     */
    AuditResultReportDto createAuditResultReport(AuditResultReportDto dto);

    /**
     * 점검결과보고서 수정
     */
    AuditResultReportDto updateAuditResultReport(AuditResultReportDto dto);

    /**
     * 점검결과보고서 상세 조회
     */
    AuditResultReportDto getAuditResultReport(Long auditResultReportId);

    /**
     * 점검계획관리ID로 결과보고서 조회
     */
    AuditResultReportDto getAuditResultReportByAuditProgMngtId(Long auditProgMngtId);

    /**
     * 점검계획관리ID와 부서코드로 결과보고서 조회
     */
    AuditResultReportDto getAuditResultReportByAuditProgMngtIdAndDeptCd(Long auditProgMngtId, String deptCd);

    /**
     * 점검계획관리ID로 모든 부서 결과보고서 목록 조회
     */
    List<AuditResultReportDto> getAuditResultReportsByAuditProgMngtId(Long auditProgMngtId);

    /**
     * 점검결과보고서 삭제
     */
    void deleteAuditResultReport(Long auditResultReportId);
}