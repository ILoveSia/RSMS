package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.AuditorDto;

import java.util.List;

/**
 * 점검자 서비스 인터페이스
 * 점검자 조회 및 지정 기능을 제공
 */
public interface AuditorService {

    /**
     * 점검자 검색
     * 
     * @param searchRequest 검색 조건
     * @return 점검자 목록
     */
    List<AuditorDto.AuditorInfoResponse> searchAuditors(AuditorDto.AuditorSearchRequest searchRequest);

    /**
     * 성명으로 점검자 검색
     * 
     * @param empName 성명 (부분일치)
     * @return 점검자 목록
     */
    List<AuditorDto.AuditorInfoResponse> searchAuditorsByName(String empName);

    /**
     * 점검자 지정
     * 
     * @param assignmentRequest 점검자 지정 요청
     * @return 점검자 지정 결과
     */
    AuditorDto.AuditorAssignmentResponse assignAuditor(AuditorDto.AuditorAssignmentRequest assignmentRequest);
}