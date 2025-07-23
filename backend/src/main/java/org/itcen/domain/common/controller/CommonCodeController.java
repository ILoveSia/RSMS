package org.itcen.domain.common.controller;

import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.common.dto.CommonCodeDto;
import org.itcen.domain.common.service.CommonCodeService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;

/**
 * 공통코드 컨트롤러
 * 
 * 공통코드 관련 REST API 엔드포인트를 제공하는 컨트롤러입니다.
 * 클라이언트의 요청을 받아 서비스 계층에 위임하고, 결과를 응답으로 반환합니다.
 * 
 * 설계 원칙:
 * - Single Responsibility: HTTP 요청/응답 처리만 담당
 * - Open/Closed: 새로운 엔드포인트 추가에 열려있음
 * - Dependency Inversion: 서비스 인터페이스에 의존하여 결합도 감소
 * - RESTful API 설계: 명확하고 일관된 API 구조 제공
 */
@Slf4j
@RestController
@RequestMapping("/common-codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    /**
     * 모든 공통코드 조회
     * 
     * @return 모든 공통코드 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<CommonCodeDto.Response>>> getAllCommonCodes() {
        
        List<CommonCodeDto.Response> commonCodes = commonCodeService.findAll();
        
        return ResponseEntity.ok(
            ApiResponse.success("공통코드 목록 조회 성공", commonCodes)
        );
    }

    /**
     * 사용 가능한 모든 공통코드 조회
     * 
     * @return 사용 가능한 공통코드 목록
     */
    @GetMapping("/usable")
    public ResponseEntity<ApiResponse<List<CommonCodeDto.Response>>> getAllUsableCommonCodes() {
        
        List<CommonCodeDto.Response> commonCodes = commonCodeService.findAllUsable();
        
        return ResponseEntity.ok(
            ApiResponse.success("사용 가능한 공통코드 목록 조회 성공", commonCodes)
        );
    }

    /**
     * 그룹별 공통코드 목록 조회
     * 
     * @return 그룹별로 분류된 공통코드 목록
     */
    @GetMapping("/grouped")
    public ResponseEntity<ApiResponse<List<CommonCodeDto.GroupResponse>>> getAllGroupedCommonCodes() {
        
        List<CommonCodeDto.GroupResponse> groupedCodes = commonCodeService.findAllGrouped();
        
        return ResponseEntity.ok(
            ApiResponse.success("그룹별 공통코드 목록 조회 성공", groupedCodes)
        );
    }

    /**
     * 사용 가능한 그룹별 공통코드 목록 조회
     * 
     * @return 사용 가능한 그룹별 공통코드 목록
     */
    @GetMapping("/grouped/usable")
    public ResponseEntity<ApiResponse<List<CommonCodeDto.GroupResponse>>> getAllUsableGroupedCommonCodes() {
        
        List<CommonCodeDto.GroupResponse> groupedCodes = commonCodeService.findAllUsableGrouped();
        
        return ResponseEntity.ok(
            ApiResponse.success("사용 가능한 그룹별 공통코드 목록 조회 성공", groupedCodes)
        );
    }

    /**
     * 그룹코드별 공통코드 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 공통코드 목록
     */
    @GetMapping("/group/{groupCode}")
    public ResponseEntity<ApiResponse<List<CommonCodeDto.Response>>> getCommonCodesByGroup(
            @PathVariable String groupCode) {
        
        List<CommonCodeDto.Response> commonCodes = commonCodeService.findByGroupCode(groupCode);
        
        return ResponseEntity.ok(
            ApiResponse.success("그룹별 공통코드 조회 성공", commonCodes)
        );
    }

    /**
     * 그룹코드별 사용 가능한 공통코드 조회
     * 
     * @param groupCode 그룹코드
     * @return 해당 그룹의 사용 가능한 공통코드 목록
     */
    @GetMapping("/group/{groupCode}/usable")
    public ResponseEntity<ApiResponse<List<CommonCodeDto.Response>>> getUsableCommonCodesByGroup(
            @PathVariable String groupCode) {
        
        List<CommonCodeDto.Response> commonCodes = commonCodeService.findUsableByGroupCode(groupCode);
        
        return ResponseEntity.ok(
            ApiResponse.success("그룹별 사용 가능한 공통코드 조회 성공", commonCodes)
        );
    }

    /**
     * 특정 공통코드 조회
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 조건에 맞는 공통코드
     */
    @GetMapping("/{groupCode}/{code}")
    public ResponseEntity<ApiResponse<CommonCodeDto.Response>> getCommonCode(
            @PathVariable String groupCode,
            @PathVariable String code) {
        
        Optional<CommonCodeDto.Response> commonCode = commonCodeService.findByGroupCodeAndCode(groupCode, code);
        
        if (commonCode.isEmpty()) {
            log.warn("해당 공통코드를 찾을 수 없습니다. groupCode: {}, code: {}", groupCode, code);
            return ResponseEntity.ok(
                ApiResponse.success("해당 공통코드를 찾을 수 없습니다.", null)
            );
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("공통코드 조회 성공", commonCode.get())
        );
    }

    /**
     * 검색 조건으로 공통코드 조회
     * 
     * @param searchRequest 검색 조건
     * @return 조건에 맞는 공통코드 목록
     */
    @PostMapping("/search")
    public ResponseEntity<ApiResponse<List<CommonCodeDto.Response>>> searchCommonCodes(
            @RequestBody CommonCodeDto.SearchRequest searchRequest) {
        
        List<CommonCodeDto.Response> commonCodes = commonCodeService.findBySearchConditions(searchRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("공통코드 검색 성공", commonCodes)
        );
    }

    /**
     * 공통코드 생성
     * 
     * @param createRequest 생성 요청 DTO
     * @return 생성된 공통코드
     */
    @PostMapping
    public ResponseEntity<ApiResponse<CommonCodeDto.Response>> createCommonCode(
            @Valid @RequestBody CommonCodeDto.CreateRequest createRequest) {
        
        CommonCodeDto.Response createdCode = commonCodeService.create(createRequest);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("공통코드 생성 성공", createdCode));
    }

    /**
     * 공통코드 존재 여부 확인
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 존재 여부
     */
    @GetMapping("/{groupCode}/{code}/exists")
    public ResponseEntity<ApiResponse<Boolean>> checkCommonCodeExists(
            @PathVariable String groupCode,
            @PathVariable String code) {
        
        boolean exists = commonCodeService.exists(groupCode, code);
        
        return ResponseEntity.ok(
            ApiResponse.success("공통코드 존재 여부 확인 완료", exists)
        );
    }

    /**
     * 공통코드 활성화
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 활성화된 공통코드
     */
    @PutMapping("/{groupCode}/{code}/activate")
    public ResponseEntity<ApiResponse<CommonCodeDto.Response>> activateCommonCode(
            @PathVariable String groupCode,
            @PathVariable String code) {
        
        Optional<CommonCodeDto.Response> activatedCode = commonCodeService.activate(groupCode, code);
        
        if (activatedCode.isEmpty()) {
            log.warn("활성화할 공통코드를 찾을 수 없습니다. groupCode: {}, code: {}", groupCode, code);
            return ResponseEntity.ok(
                ApiResponse.success("해당 공통코드를 찾을 수 없습니다.", null)
            );
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("공통코드 활성화 성공", activatedCode.get())
        );
    }

    /**
     * 공통코드 비활성화
     * 
     * @param groupCode 그룹코드
     * @param code 코드
     * @return 비활성화된 공통코드
     */
    @PutMapping("/{groupCode}/{code}/deactivate")
    public ResponseEntity<ApiResponse<CommonCodeDto.Response>> deactivateCommonCode(
            @PathVariable String groupCode,
            @PathVariable String code) {
        
        Optional<CommonCodeDto.Response> deactivatedCode = commonCodeService.deactivate(groupCode, code);
        
        if (deactivatedCode.isEmpty()) {
            log.warn("비활성화할 공통코드를 찾을 수 없습니다. groupCode: {}, code: {}", groupCode, code);
            return ResponseEntity.ok(
                ApiResponse.success("해당 공통코드를 찾을 수 없습니다.", null)
            );
        }
        
        return ResponseEntity.ok(
            ApiResponse.success("공통코드 비활성화 성공", deactivatedCode.get())
        );
    }
} 