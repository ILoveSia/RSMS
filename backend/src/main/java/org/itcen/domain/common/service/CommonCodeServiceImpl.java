package org.itcen.domain.common.service;

import org.itcen.common.exception.BusinessException;
import org.itcen.domain.common.dto.CommonCodeDto;
import org.itcen.domain.common.entity.CommonCode;
import org.itcen.domain.common.repository.CommonCodeRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * 공통코드 서비스 구현체
 * 
 * 공통코드 관련 비즈니스 로직을 구현하는 서비스 클래스입니다.
 * 레포지토리를 통해 데이터에 접근하고, 비즈니스 규칙을 적용합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: 공통코드 도메인의 비즈니스 로직만 담당
 * - Open/Closed: 확장에는 열려있고 수정에는 닫혀있는 구조
 * - Dependency Inversion: 인터페이스에 의존하여 결합도 감소
 * - 트랜잭션 관리: 데이터 일관성 보장을 위한 적절한 트랜잭션 경계 설정
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommonCodeServiceImpl implements CommonCodeService {

    private final CommonCodeRepository commonCodeRepository;

    @Override
    public List<CommonCodeDto.Response> findAll() {
        log.debug("모든 공통코드 조회 요청");
        
        List<CommonCode> commonCodes = commonCodeRepository.findAll();
        List<CommonCodeDto.Response> responses = commonCodes.stream()
                .map(CommonCodeDto.Response::from)
                .toList();
        
        log.debug("공통코드 조회 완료. 총 {}개", responses.size());
        return responses;
    }

    @Override
    public List<CommonCodeDto.Response> findAllUsable() {
        log.debug("사용 가능한 모든 공통코드 조회 요청");
        
        List<CommonCode> commonCodes = commonCodeRepository.findAllUsable();
        List<CommonCodeDto.Response> responses = commonCodes.stream()
                .map(CommonCodeDto.Response::from)
                .toList();
        
        log.debug("사용 가능한 공통코드 조회 완료. 총 {}개", responses.size());
        return responses;
    }

    @Override
    public List<CommonCodeDto.Response> findByGroupCode(String groupCode) {
        log.debug("그룹코드별 공통코드 조회 요청. groupCode: {}", groupCode);
        
        validateGroupCode(groupCode);
        
        List<CommonCode> commonCodes = commonCodeRepository.findByGroupCodeOrderBySortOrderAscCodeAsc(groupCode);
        List<CommonCodeDto.Response> responses = commonCodes.stream()
                .map(CommonCodeDto.Response::from)
                .toList();
        
        log.debug("그룹코드별 공통코드 조회 완료. groupCode: {}, 개수: {}", groupCode, responses.size());
        return responses;
    }

    @Override
    public List<CommonCodeDto.Response> findUsableByGroupCode(String groupCode) {
        log.debug("그룹코드별 사용 가능한 공통코드 조회 요청. groupCode: {}", groupCode);
        
        validateGroupCode(groupCode);
        
        List<CommonCode> commonCodes = commonCodeRepository.findUsableByGroupCode(groupCode);
        List<CommonCodeDto.Response> responses = commonCodes.stream()
                .map(CommonCodeDto.Response::from)
                .toList();
        
        log.debug("그룹코드별 사용 가능한 공통코드 조회 완료. groupCode: {}, 개수: {}", groupCode, responses.size());
        return responses;
    }

    @Override
    public Optional<CommonCodeDto.Response> findByGroupCodeAndCode(String groupCode, String code) {
        log.debug("특정 공통코드 조회 요청. groupCode: {}, code: {}", groupCode, code);
        
        validateGroupCode(groupCode);
        validateCode(code);
        
        Optional<CommonCode> commonCode = commonCodeRepository.findByGroupCodeAndCode(groupCode, code);
        Optional<CommonCodeDto.Response> response = commonCode.map(CommonCodeDto.Response::from);
        
        log.debug("특정 공통코드 조회 완료. groupCode: {}, code: {}, 존재여부: {}", 
                 groupCode, code, response.isPresent());
        return response;
    }

    @Override
    public List<CommonCodeDto.Response> findBySearchConditions(CommonCodeDto.SearchRequest searchRequest) {
        log.debug("검색 조건으로 공통코드 조회 요청. 조건: {}", searchRequest);
        
        if (searchRequest == null) {
            return findAll();
        }
        
        List<CommonCode> commonCodes = commonCodeRepository.findBySearchConditions(
                searchRequest.hasGroupCode() ? searchRequest.getGroupCode() : null,
                searchRequest.hasCode() ? searchRequest.getCode() : null,
                searchRequest.hasCodeName() ? searchRequest.getCodeName() : null,
                searchRequest.hasUseYn() ? searchRequest.getUseYn() : null
        );
        
        List<CommonCodeDto.Response> responses = commonCodes.stream()
                .map(CommonCodeDto.Response::from)
                .toList();
        
        log.debug("검색 조건으로 공통코드 조회 완료. 개수: {}", responses.size());
        return responses;
    }

    @Override
    public List<CommonCodeDto.Response> findByCodeNameContaining(String codeName) {
        log.debug("코드명으로 공통코드 검색 요청. codeName: {}", codeName);
        
        if (codeName == null || codeName.trim().isEmpty()) {
            throw new IllegalArgumentException("코드명은 필수입니다.");
        }
        
        List<CommonCode> commonCodes = commonCodeRepository.findByCodeNameContainingIgnoreCase(codeName.trim());
        List<CommonCodeDto.Response> responses = commonCodes.stream()
                .map(CommonCodeDto.Response::from)
                .toList();
        
        log.debug("코드명으로 공통코드 검색 완료. codeName: {}, 개수: {}", codeName, responses.size());
        return responses;
    }

    @Override
    public List<CommonCodeDto.GroupResponse> findAllGrouped() {
        log.debug("그룹별 공통코드 목록 조회 요청");
        
        List<CommonCode> allCodes = commonCodeRepository.findAll();
        Map<String, List<CommonCode>> groupedCodes = allCodes.stream()
                .collect(Collectors.groupingBy(CommonCode::getGroupCode));
        
        List<CommonCodeDto.GroupResponse> responses = groupedCodes.entrySet().stream()
                .map(entry -> CommonCodeDto.GroupResponse.builder()
                        .groupCode(entry.getKey())
                        .groupName(entry.getKey()) // 실제로는 그룹명 매핑 로직 필요
                        .codes(entry.getValue().stream()
                                .map(CommonCodeDto.Response::from)
                                .toList())
                        .build())
                .toList();
        
        log.debug("그룹별 공통코드 목록 조회 완료. 그룹 수: {}", responses.size());
        return responses;
    }

    @Override
    public List<CommonCodeDto.GroupResponse> findAllUsableGrouped() {
        log.debug("사용 가능한 그룹별 공통코드 목록 조회 요청");
        
        List<CommonCode> usableCodes = commonCodeRepository.findAllUsable();
        Map<String, List<CommonCode>> groupedCodes = usableCodes.stream()
                .collect(Collectors.groupingBy(CommonCode::getGroupCode));
        
        List<CommonCodeDto.GroupResponse> responses = groupedCodes.entrySet().stream()
                .map(entry -> CommonCodeDto.GroupResponse.builder()
                        .groupCode(entry.getKey())
                        .groupName(entry.getKey()) // 실제로는 그룹명 매핑 로직 필요
                        .codes(entry.getValue().stream()
                                .map(CommonCodeDto.Response::from)
                                .toList())
                        .build())
                .toList();
        
        log.debug("사용 가능한 그룹별 공통코드 목록 조회 완료. 그룹 수: {}", responses.size());
        return responses;
    }

    @Override
    public Optional<CommonCodeDto.GroupResponse> findGroupedByGroupCode(String groupCode) {
        log.debug("특정 그룹의 공통코드 조회 요청. groupCode: {}", groupCode);
        
        validateGroupCode(groupCode);
        
        List<CommonCode> codes = commonCodeRepository.findByGroupCodeOrderBySortOrderAscCodeAsc(groupCode);
        
        if (codes.isEmpty()) {
            log.debug("해당 그룹에 공통코드가 없습니다. groupCode: {}", groupCode);
            return Optional.empty();
        }
        
        CommonCodeDto.GroupResponse response = CommonCodeDto.GroupResponse.builder()
                .groupCode(groupCode)
                .groupName(groupCode) // 실제로는 그룹명 매핑 로직 필요
                .codes(codes.stream()
                        .map(CommonCodeDto.Response::from)
                        .toList())
                .build();
        
        log.debug("특정 그룹의 공통코드 조회 완료. groupCode: {}, 개수: {}", groupCode, response.getCodeCount());
        return Optional.of(response);
    }

    @Override
    public List<String> findAllGroupCodes() {
        log.debug("모든 그룹코드 목록 조회 요청");
        
        List<String> groupCodes = commonCodeRepository.findDistinctGroupCodes();
        
        log.debug("모든 그룹코드 목록 조회 완료. 개수: {}", groupCodes.size());
        return groupCodes;
    }

    @Override
    public List<String> findUsableGroupCodes() {
        log.debug("사용 가능한 그룹코드 목록 조회 요청");
        
        List<String> groupCodes = commonCodeRepository.findDistinctUsableGroupCodes();
        
        log.debug("사용 가능한 그룹코드 목록 조회 완료. 개수: {}", groupCodes.size());
        return groupCodes;
    }

    @Override
    @Transactional
    public CommonCodeDto.Response create(CommonCodeDto.CreateRequest createRequest) {
        log.debug("공통코드 생성 요청. request: {}", createRequest);
        
        validateCreateRequest(createRequest);
        
        // 중복 확인
        if (commonCodeRepository.existsByGroupCodeAndCode(createRequest.getGroupCode(), createRequest.getCode())) {
            throw new BusinessException("이미 존재하는 공통코드입니다. groupCode: " + 
                                      createRequest.getGroupCode() + ", code: " + createRequest.getCode());
        }
        
        // 정렬순서가 없으면 자동 설정
        CommonCodeDto.CreateRequest requestToUse = createRequest;
        if (createRequest.getSortOrder() == null) {
            Integer nextSortOrder = getNextSortOrder(createRequest.getGroupCode());
            requestToUse = CommonCodeDto.CreateRequest.builder()
                    .groupCode(createRequest.getGroupCode())
                    .code(createRequest.getCode())
                    .codeName(createRequest.getCodeName())
                    .description(createRequest.getDescription())
                    .sortOrder(nextSortOrder)
                    .useYn(createRequest.getUseYn())
                    .build();
        }
        
        CommonCode commonCode = requestToUse.toEntity();
        CommonCode savedCommonCode = commonCodeRepository.save(commonCode);
        CommonCodeDto.Response response = CommonCodeDto.Response.from(savedCommonCode);
        
        log.info("공통코드 생성 완료. groupCode: {}, code: {}", 
                savedCommonCode.getGroupCode(), savedCommonCode.getCode());
        return response;
    }

    @Override
    public boolean exists(String groupCode, String code) {
        log.debug("공통코드 존재 여부 확인 요청. groupCode: {}, code: {}", groupCode, code);
        
        validateGroupCode(groupCode);
        validateCode(code);
        
        boolean exists = commonCodeRepository.existsByGroupCodeAndCode(groupCode, code);
        
        log.debug("공통코드 존재 여부 확인 완료. groupCode: {}, code: {}, 존재여부: {}", 
                 groupCode, code, exists);
        return exists;
    }

    @Override
    public long countByGroupCode(String groupCode) {
        log.debug("그룹코드별 공통코드 개수 조회 요청. groupCode: {}", groupCode);
        
        validateGroupCode(groupCode);
        
        long count = commonCodeRepository.countByGroupCode(groupCode);
        
        log.debug("그룹코드별 공통코드 개수 조회 완료. groupCode: {}, 개수: {}", groupCode, count);
        return count;
    }

    @Override
    public long countByGroupCodeAndUseYn(String groupCode, String useYn) {
        log.debug("그룹코드와 사용여부별 공통코드 개수 조회 요청. groupCode: {}, useYn: {}", groupCode, useYn);
        
        validateGroupCode(groupCode);
        validateUseYn(useYn);
        
        long count = commonCodeRepository.countByGroupCodeAndUseYn(groupCode, useYn);
        
        log.debug("그룹코드와 사용여부별 공통코드 개수 조회 완료. groupCode: {}, useYn: {}, 개수: {}", 
                 groupCode, useYn, count);
        return count;
    }

    @Override
    @Transactional
    public Optional<CommonCodeDto.Response> activate(String groupCode, String code) {
        log.debug("공통코드 활성화 요청. groupCode: {}, code: {}", groupCode, code);
        
        validateGroupCode(groupCode);
        validateCode(code);
        
        Optional<CommonCode> commonCodeOpt = commonCodeRepository.findByGroupCodeAndCode(groupCode, code);
        
        if (commonCodeOpt.isEmpty()) {
            log.warn("활성화할 공통코드를 찾을 수 없습니다. groupCode: {}, code: {}", groupCode, code);
            return Optional.empty();
        }
        
        CommonCode commonCode = commonCodeOpt.get();
        commonCode.activate();
        CommonCode savedCommonCode = commonCodeRepository.save(commonCode);
        CommonCodeDto.Response response = CommonCodeDto.Response.from(savedCommonCode);
        
        log.info("공통코드 활성화 완료. groupCode: {}, code: {}", groupCode, code);
        return Optional.of(response);
    }

    @Override
    @Transactional
    public Optional<CommonCodeDto.Response> deactivate(String groupCode, String code) {
        log.debug("공통코드 비활성화 요청. groupCode: {}, code: {}", groupCode, code);
        
        validateGroupCode(groupCode);
        validateCode(code);
        
        Optional<CommonCode> commonCodeOpt = commonCodeRepository.findByGroupCodeAndCode(groupCode, code);
        
        if (commonCodeOpt.isEmpty()) {
            log.warn("비활성화할 공통코드를 찾을 수 없습니다. groupCode: {}, code: {}", groupCode, code);
            return Optional.empty();
        }
        
        CommonCode commonCode = commonCodeOpt.get();
        commonCode.deactivate();
        CommonCode savedCommonCode = commonCodeRepository.save(commonCode);
        CommonCodeDto.Response response = CommonCodeDto.Response.from(savedCommonCode);
        
        log.info("공통코드 비활성화 완료. groupCode: {}, code: {}", groupCode, code);
        return Optional.of(response);
    }

    @Override
    public Integer getNextSortOrder(String groupCode) {
        log.debug("다음 정렬순서 조회 요청. groupCode: {}", groupCode);
        
        validateGroupCode(groupCode);
        
        Integer maxSortOrder = commonCodeRepository.findMaxSortOrderByGroupCode(groupCode);
        Integer nextSortOrder = maxSortOrder + 1;
        
        log.debug("다음 정렬순서 조회 완료. groupCode: {}, nextSortOrder: {}", groupCode, nextSortOrder);
        return nextSortOrder;
    }

    /**
     * 그룹코드 유효성 검증
     */
    private void validateGroupCode(String groupCode) {
        if (groupCode == null || groupCode.trim().isEmpty()) {
            throw new IllegalArgumentException("그룹코드는 필수입니다.");
        }
    }

    /**
     * 코드 유효성 검증
     */
    private void validateCode(String code) {
        if (code == null || code.trim().isEmpty()) {
            throw new IllegalArgumentException("코드는 필수입니다.");
        }
    }

    /**
     * 사용여부 유효성 검증
     */
    private void validateUseYn(String useYn) {
        if (useYn == null || (!useYn.equals("Y") && !useYn.equals("N"))) {
            throw new IllegalArgumentException("사용여부는 Y 또는 N이어야 합니다.");
        }
    }

    /**
     * 생성 요청 유효성 검증
     */
    private void validateCreateRequest(CommonCodeDto.CreateRequest createRequest) {
        if (createRequest == null) {
            throw new IllegalArgumentException("생성 요청 정보는 필수입니다.");
        }
        
        if (!createRequest.isValid()) {
            throw new IllegalArgumentException("필수 필드가 누락되었습니다. (그룹코드, 코드, 코드명)");
        }
        
        if (createRequest.getUseYn() != null) {
            validateUseYn(createRequest.getUseYn());
        }
    }
} 