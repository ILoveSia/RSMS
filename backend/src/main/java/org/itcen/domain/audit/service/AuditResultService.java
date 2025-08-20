package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.AuditResultDetailRequestDto;
import org.itcen.domain.audit.dto.AuditResultDetailResponseDto;
import org.itcen.domain.audit.dto.AuditResultSaveRequestDto;
import org.itcen.domain.audit.dto.AuditResultSaveResponseDto;
import org.itcen.domain.audit.dto.ImplementationResultUpdateRequestDto;
import org.itcen.domain.audit.dto.ImplementationResultUpdateResponseDto;

import java.util.List;

/**
 * 점검결과 Service Interface
 * 
 * 인터페이스 분리 원칙(ISP): 필요한 메서드만 정의
 * 의존성 역전 원칙(DIP): 구현체가 아닌 인터페이스에 의존
 */
public interface AuditResultService {

    /**
     * 점검결과 저장
     * 
     * @param request 점검결과 저장 요청 데이터
     * @return 저장 결과
     */
    AuditResultSaveResponseDto saveAuditResult(AuditResultSaveRequestDto request);

    /**
     * 점검결과 수정
     * 
     * @param request 점검결과 수정 요청 데이터
     * @return 수정 결과
     */
    AuditResultSaveResponseDto updateAuditResult(AuditResultSaveRequestDto request);

    /**
     * 점검결과 상세 조회
     * 
     * @param request 점검결과 상세 조회 요청 데이터
     * @return 조회 결과
     */
    List<AuditResultDetailResponseDto> getAuditResultDetail(AuditResultDetailRequestDto request);

    /**
     * 이행결과 업데이트
     * 
     * @param request 이행결과 업데이트 요청 데이터
     * @return 업데이트 결과
     */
    ImplementationResultUpdateResponseDto updateImplementationResult(ImplementationResultUpdateRequestDto request);
}