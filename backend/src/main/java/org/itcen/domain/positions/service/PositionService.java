package org.itcen.domain.positions.service;

import org.itcen.domain.positions.dto.PositionCreateRequestDto;
import org.itcen.domain.positions.dto.PositionDetailDto;
import org.itcen.domain.positions.dto.PositionMeetingDto;
import org.itcen.domain.positions.dto.PositionStatusDto;
import org.itcen.domain.positions.dto.PositionUpdateRequestDto;
import org.itcen.domain.positions.dto.LedgerOrderSelectDto;
import org.itcen.domain.positions.dto.PositionDto;
import org.itcen.domain.positions.dto.PositionSearchRequestDto;
import org.itcen.domain.positions.dto.ExecutiveInfoDto;

import java.util.List;

/**
 * 직책 통합 Service 인터페이스
 *
 * 직책 및 관련 테이블들의 비즈니스 로직을 통합 관리하는 인터페이스입니다.
 * PositionStatusPage.tsx에서 5개 테이블을 모두 관리하기 위한 통합 서비스입니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 직책 도메인 전체 비즈니스 로직 담당
 * - Open/Closed: 새로운 기능 추가 시 확장 가능
 * - Interface Segregation: 필요한 메서드만 정의
 * - Dependency Inversion: 구현체에 의존하지 않고 인터페이스에 의존
 */
public interface PositionService {
    /**
     * 원장차수+진행상태 목록 조회 (SelectBox용)
     */
    List<LedgerOrderSelectDto> getLedgerOrderSelectList();

    /**
     * 직책 일괄 삭제
     * 
     * @param positionsIds 삭제할 직책 ID 목록
     */
    void deleteBulk(List<Long> positionsIds);

    /**
     * 직책 생성
     * 
     * @param createRequestDto 직책 생성 정보
     * @return 생성된 직책의 ID
     */
    Long createPosition(PositionCreateRequestDto createRequestDto);

    /**
     * 직책 수정
     * 
     * @param positionId       수정할 직책 ID
     * @param updateRequestDto 수정할 정보
     * @return 수정된 직책 ID
     */
    Long updatePosition(Long positionId, PositionUpdateRequestDto updateRequestDto);

    /**
     * 직책 현황 목록 조회
     * 
     * @param ledgerOrdersId 원장차수 ID (선택적)
     * @return 직책 현황 목록
     */
    List<PositionStatusDto> getPositionStatusList(Long ledgerOrdersId);

    /**
     * 직책 상세 조회
     * 
     * @param id 직책 ID
     * @return 직책 상세 정보
     */
    PositionDetailDto getPositionDetail(Long id);

    /**
     * 직책 검색
     * @param searchRequest 검색 조건
     * @return 검색된 직책 목록
     */
    List<PositionDto> searchPositions(PositionSearchRequestDto searchRequest);

    /**
     * 직책별 회의체 목록 조회
     * 
     * @param id 직책 ID
     * @return 회의체 목록
     */
    List<PositionMeetingDto> getPositionMeetings(Long id);

    /**
     * 직책 ID로 임원 정보 조회
     * 
     * @param positionsId 직책 ID
     * @return 임원 정보
     */
    ExecutiveInfoDto getExecutiveByPositionId(Long positionsId);
}
