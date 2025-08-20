package org.itcen.domain.audit.service;

import org.itcen.domain.audit.dto.DeficiencyStatusDto;

import java.util.List;

/**
 * 미흡상황 현황 Service Interface
 * 
 * 인터페이스 분리 원칙(ISP): 필요한 메서드만 정의
 * 의존성 역전 원칙(DIP): 구현체가 아닌 인터페이스에 의존
 */
public interface DeficiencyStatusService {

    /**
     * 전체 미흡상황 현황 목록 조회
     * 
     * @param startDate 시작일
     * @param endDate 종료일
     * @return 미흡상황 현황 목록
     */
    List<DeficiencyStatusDto> getAllDeficiencyStatus(String startDate, String endDate);
    /**
     * 미흡상황 수정
     * 
     * @param dto 미흡상황 데이터
     * @return 수정된 미흡상황 DTO
     */
    DeficiencyStatusDto updateDeficiencyStatus(DeficiencyStatusDto dto);

    /**
     * 미흡상황 삭제
     * 
     * @param id 미흡상황 ID
     */
    void deleteDeficiencyStatus(Long id);
    /**
     * 이행결과 작성
     * 
     * @param ids 미흡상황 ID 목록
     * @param implementationResult 이행결과
     * @param completionDate 완료일자
     * @param statusCode 상태코드
     * @param remarks 비고
     */
    void updateImplementationResult(List<Long> ids, String implementationResult, 
            String completionDate, String statusCode, String remarks);

    /**
     * 승인 처리
     * 
     * @param ids 미흡상황 ID 목록
     * @param approvalStatus 승인상태
     * @param approvalComments 승인의견
     */
    void approveDeficiencyStatus(List<Long> ids, String approvalStatus, String approvalComments);

    /**
     * 점검회차 목록 조회
     * 
     * @return 점검회차 목록
     */
    List<String> getInspectionRoundList();

    /**
     * 부서 목록 조회
     * 
     * @return 부서 목록
     */
    List<String> getDepartmentList();
}