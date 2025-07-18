package org.itcen.domain.common.service;

import org.itcen.domain.common.dto.CommonCodeDto;

import java.util.List;
import java.util.Optional;

/**
 * 공통코드 서비스 인터페이스
 * 
 * 공통코드 관련 비즈니스 로직의 계약을 정의하는 인터페이스입니다.
 * 구체적인 구현은 서비스 구현체에서 담당하며, 이 인터페이스는
 * 클라이언트 코드와 구현체 사이의 결합도를 낮추는 역할을 합니다.
 * 
 * 설계 원칙:
 * - Interface Segregation: 공통코드 관련 비즈니스 로직만 정의
 * - Dependency Inversion: 구체적인 구현이 아닌 인터페이스에 의존
 * - Single Responsibility: 공통코드 도메인의 비즈니스 로직만 담당
 */
public interface CommonCodeService {

    /**
     * 모든 공통코드 조회
     * 
     * @return 모든 공통코드 목록
     */
    List<CommonCodeDto.Response> findAll();

    /**
     * 사용 가능한 모든 공통코드 조회
     * 
     * @return 사용 가능한 공통코드 목록
     */
    List<CommonCodeDto.Response> findAllUsable();

    /**
     * 그룹코드로 공통코드 목록 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 공통코드 목록
     */
    List<CommonCodeDto.Response> findByGroupCode(String groupCode);

    /**
     * 그룹코드로 사용 가능한 공통코드 목록 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 사용 가능한 공통코드 목록
     */
    List<CommonCodeDto.Response> findUsableByGroupCode(String groupCode);

    /**
     * 특정 공통코드 조회
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 조건에 맞는 공통코드 (없으면 empty)
     */
    Optional<CommonCodeDto.Response> findByGroupCodeAndCode(String groupCode, String code);

    /**
     * 검색 조건으로 공통코드 목록 조회
     * 
     * @param searchRequest 검색 조건
     * @return 조건에 맞는 공통코드 목록
     */
    List<CommonCodeDto.Response> findBySearchConditions(CommonCodeDto.SearchRequest searchRequest);

    /**
     * 코드명으로 공통코드 검색 (부분 일치)
     * 
     * @param codeName 코드명
     * @return 코드명이 포함된 공통코드 목록
     */
    List<CommonCodeDto.Response> findByCodeNameContaining(String codeName);

    /**
     * 그룹별 공통코드 목록 조회
     * 
     * @return 그룹별로 분류된 공통코드 목록
     */
    List<CommonCodeDto.GroupResponse> findAllGrouped();

    /**
     * 사용 가능한 그룹별 공통코드 목록 조회
     * 
     * @return 사용 가능한 그룹별 공통코드 목록
     */
    List<CommonCodeDto.GroupResponse> findAllUsableGrouped();

    /**
     * 특정 그룹의 공통코드를 그룹 응답 형태로 조회
     * 
     * @param groupCode 그룹코드
     * @return 그룹 응답 DTO (없으면 empty)
     */
    Optional<CommonCodeDto.GroupResponse> findGroupedByGroupCode(String groupCode);

    /**
     * 모든 그룹코드 목록 조회
     * 
     * @return 시스템에 등록된 모든 그룹코드 목록
     */
    List<String> findAllGroupCodes();

    /**
     * 사용 가능한 그룹코드 목록 조회
     * 
     * @return 사용 가능한 그룹코드 목록
     */
    List<String> findUsableGroupCodes();

    /**
     * 공통코드 생성
     * 
     * @param createRequest 생성 요청 DTO
     * @return 생성된 공통코드
     * @throws IllegalArgumentException 잘못된 입력값인 경우
     * @throws IllegalStateException 이미 존재하는 코드인 경우
     */
    CommonCodeDto.Response create(CommonCodeDto.CreateRequest createRequest);

    /**
     * 공통코드 존재 여부 확인
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 존재 여부
     */
    boolean exists(String groupCode, String code);

    /**
     * 그룹코드별 공통코드 개수 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 공통코드 개수
     */
    long countByGroupCode(String groupCode);

    /**
     * 그룹코드와 사용여부별 공통코드 개수 조회
     * 
     * @param groupCode 그룹코드
     * @param useYn 사용여부
     * @return 조건에 맞는 공통코드 개수
     */
    long countByGroupCodeAndUseYn(String groupCode, String useYn);

    /**
     * 공통코드 활성화
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 활성화된 공통코드 (없으면 empty)
     */
    Optional<CommonCodeDto.Response> activate(String groupCode, String code);

    /**
     * 공통코드 비활성화
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 비활성화된 공통코드 (없으면 empty)
     */
    Optional<CommonCodeDto.Response> deactivate(String groupCode, String code);

    /**
     * 특정 그룹에서 다음 정렬순서 조회
     * 
     * 새로운 공통코드를 추가할 때 사용할 정렬순서를 반환합니다.
     * 
     * @param groupCode 그룹코드
     * @return 다음 정렬순서
     */
    Integer getNextSortOrder(String groupCode);
} 