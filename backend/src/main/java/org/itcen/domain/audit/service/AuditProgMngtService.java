package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.AuditItemStatusResponseDto;
import org.itcen.domain.audit.dto.AuditProgMngtDto;
import org.itcen.domain.audit.dto.DeptAuditResultStatusDto;
import org.itcen.domain.audit.dto.DeptImprovementPlanStatusDto;

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

    /**
     * 점검 현황(항목별) 조회
     * 
     * audit_prog_mngt와 audit_prog_mngt_detail 조인 후
     * hod_ic_item과 responsibility, positions 조인
     * role_resp_status는 left outer 조인
     * 
     * @param ledgerOrdersHod 원장차수 (조회조건)
     * @param auditResultStatusCd 점검결과 (조회조건)
     * @return 점검 현황(항목별) 목록
     */
    List<AuditItemStatusResponseDto> getAuditItemStatus(Long ledgerOrdersHod, String auditResultStatusCd);

    /**
     * 결재 승인 시 점검계획관리상세의 개선계획상태코드를 PLI03으로 업데이트
     * 동시에 점검최종결과여부를 'Y'로 업데이트
     * 
     * @param auditProgMngtDetailId 점검계획관리상세 ID
     * @return 업데이트된 레코드 수
     */
    int updateImpPlStatusToPLI03(Long auditProgMngtDetailId);

    /**
     * 부서별 점검결과 현황 조회
     * 
     * @param ledgerOrdersId 원장차수 ID (조회조건)
     * @param deptCd 부서코드 (조회조건)
     * @return 부서별 점검결과 현황 목록
     */
    List<DeptAuditResultStatusDto> getDeptAuditResultStatus(Long ledgerOrdersId, String deptCd);

    /**
     * 부서별 개선계획등록 현황 조회
     * 
     * @param ledgerOrdersId 원장차수 ID (조회조건)
     * @param deptCd 부서코드 (조회조건)
     * @return 부서별 개선계획등록 현황 목록
     */
    List<DeptImprovementPlanStatusDto> getDeptImprovementPlanStatus(Long ledgerOrdersId, String deptCd);
}