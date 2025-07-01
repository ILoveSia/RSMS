package org.itcen.domain.positions.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.positions.dto.*;
import org.itcen.domain.positions.service.PositionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 직책 통합 Controller
 * 
 * 직책 및 관련 테이블들(소관부서, 회의체, 관리자, 히스토리)의 REST API를 통합 제공합니다.
 * PositionStatusPage.tsx에서 5개 테이블을 모두 관리하기 위한 통합 컨트롤러입니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 직책 도메인 전체 API 요청 처리 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: HTTP 표준을 준수하여 일관된 응답 제공
 * - Interface Segregation: 필요한 기능만 제공
 * - Dependency Inversion: Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/positions")
@RequiredArgsConstructor
@Validated
public class PositionController {

    /**
     * 원장차수+진행상태 목록 조회 (SelectBox)
     */
    @GetMapping("/ledger-orders/select-list")
    public ResponseEntity<ApiResponse<List<LedgerOrderSelectDto>>> getLedgerOrderSelectList() {
        List<LedgerOrderSelectDto> list = positionService.getLedgerOrderSelectList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * 직책 일괄 삭제
     */
    @DeleteMapping("/bulk-delete")
    public ResponseEntity<ApiResponse<Void>> deleteBulk(@RequestBody PositionBulkDeleteRequestDto requestDto) {
        log.info("직책 일괄 삭제 API 호출: {}", requestDto.getPositionsIds());
        positionService.deleteBulk(requestDto.getPositionsIds());
        return ResponseEntity.ok(ApiResponse.success("직책이 성공적으로 삭제되었습니다."));
    }

    private final PositionService positionService;

    /**
     * 직책 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createPosition(
            @Valid @RequestBody PositionCreateRequestDto createRequestDto) {
        log.info("직책 생성 API 호출: {}", createRequestDto.getPositionsNm());
        Long positionId = positionService.createPosition(createRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("직책이 성공적으로 생성되었습니다.", positionId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Long>> updatePosition(
            @PathVariable("id") Long id,
            @Valid @RequestBody PositionUpdateRequestDto updateRequestDto) {
        log.info("직책 수정 API 호출: {}", id);
        Long positionId = positionService.updatePosition(id, updateRequestDto);
        return ResponseEntity.ok(ApiResponse.success("직책이 성공적으로 수정되었습니다.", positionId));
    }

    /**
     * 직책 현황 목록 조회
     */
    @GetMapping("/status-list")
    public ResponseEntity<ApiResponse<List<PositionStatusDto>>> getPositionStatusList() {
        List<PositionStatusDto> positionStatusList = positionService.getPositionStatusList();
        return ResponseEntity.ok(ApiResponse.success(positionStatusList));
    }

    /**
     * 직책 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDetailDto>> getPositionDetail(@PathVariable("id") Long id) {
        PositionDetailDto positionDetail = positionService.getPositionDetail(id);
        return ResponseEntity.ok(ApiResponse.success(positionDetail));
    }
} 