package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.AuditProgMngtDto;

import java.util.List;

/**
 * 점검계획관리 Service Interface
 * 
 * 인터페이스 분리 원칙(ISP): 필요한 메서드만 정의
 * 의존성 역전 원칙(DIP): 구현체가 아닌 인터페이스에 의존
 */
public interface AuditProgMngtService {

    /**
     * 점검계획 등록
     * 
     * @param dto 점검계획 데이터
     * @return 등록된 점검계획 DTO
     */
    AuditProgMngtDto createAuditProgMngt(AuditProgMngtDto dto);

    /**
     * 점검계획 수정
     * 
     * @param dto 점검계획 데이터
     * @return 수정된 점검계획 DTO
     */
    AuditProgMngtDto updateAuditProgMngt(AuditProgMngtDto dto);

    /**
     * 점검계획 조회
     * 
     * @param auditProgMngtCd 점검계획코드
     * @return 점검계획 DTO
     */
    AuditProgMngtDto getAuditProgMngt(String auditProgMngtCd);

    /**
     * 점검계획 삭제
     * 
     * @param auditProgMngtCd 점검계획코드
     */
    void deleteAuditProgMngt(String auditProgMngtCd);

    /**
     * 점검계획관리 현황 목록 조회 (전체)
     * 
     * @param startDate 시작일
     * @param endDate 종료일
     * @return 점검계획관리 현황 목록
     */
    List<AuditProgMngtDto> getAllAuditProgMngtStatus(String startDate, String endDate);

    /**
     * 점검계획관리 현황 조회 (파라미터 기반)
     * 
     * @param auditTypeCd 점검유형코드
     * @param auditStatusCd 점검상태코드
     * @param auditTeamLeader 점검팀장
     * @param startDate 시작일
     * @param endDate 종료일
     * @return 점검계획관리 현황 목록
     */
    List<AuditProgMngtDto> getAuditProgMngtStatus(String auditTypeCd, String auditStatusCd, String auditTeamLeader, String startDate, String endDate);
}