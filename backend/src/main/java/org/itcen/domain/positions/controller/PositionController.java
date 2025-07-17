package org.itcen.domain.positions.controller;

import java.util.ArrayList;
import java.util.List;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.positions.dto.LedgerOrderSelectDto;
import org.itcen.domain.positions.dto.PositionBulkDeleteRequestDto;
import org.itcen.domain.positions.dto.PositionCreateRequestDto;
import org.itcen.domain.positions.dto.PositionDetailDto;
import org.itcen.domain.positions.dto.PositionMeetingDto;
import org.itcen.domain.positions.dto.PositionStatusDto;
import org.itcen.domain.positions.dto.PositionUpdateRequestDto;
import org.itcen.domain.positions.service.PositionService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * 직책 통합 Controller
 *
 * 직책 및 관련 테이블들(소관부서, 회의체, 관리자, 히스토리)의 REST API를 통합 제공합니다. PositionStatusPage.tsx에서 5개 테이블을 모두 관리하기
 * 위한 통합 컨트롤러입니다.
 *
 * SOLID 원칙: - Single Responsibility: 직책 도메인 전체 API 요청 처리 담당 - Open/Closed: 새로운 API 추가 시 확장 가능 -
 * Liskov Substitution: HTTP 표준을 준수하여 일관된 응답 제공 - Interface Segregation: 필요한 기능만 제공 - Dependency
 * Inversion: Service 인터페이스에 의존
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
    public ResponseEntity<ApiResponse<Void>> deleteBulk(
            @RequestBody PositionBulkDeleteRequestDto requestDto) {
        log.info("직책 일괄 삭제 API 호출: {}", requestDto.getPositionsIds());
        positionService.deleteBulk(requestDto.getPositionsIds());
        return ResponseEntity.ok(ApiResponse.success("직책이 성공적으로 삭제되었습니다."));
    }

    private final PositionService positionService;

    /**
     * 직책 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<PositionDetailDto>> createPosition(
            @Valid @RequestBody PositionCreateRequestDto createRequestDto) {
        log.info("직책 생성 API 호출: {}", createRequestDto);
        Long positionId = positionService.createPosition(createRequestDto);
        PositionDetailDto detail = positionService.getPositionDetail(positionId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("직책이 성공적으로 생성되었습니다.", detail));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PositionDetailDto>> updatePosition(
            @PathVariable("id") Long id,
            @Valid @RequestBody PositionUpdateRequestDto updateRequestDto) {
        log.info("직책 수정 API 호출: {}", id);
        System.out.println("updateRequestDto23452345");
        System.out.println(updateRequestDto);
        positionService.updatePosition(id, updateRequestDto);
        PositionDetailDto detail = positionService.getPositionDetail(id);
        return ResponseEntity.ok(ApiResponse.success("직책이 성공적으로 수정되었습니다.", detail));
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
    public ResponseEntity<ApiResponse<PositionDetailDto>> getPositionDetail(
            @PathVariable("id") Long id) {
        PositionDetailDto positionDetail = positionService.getPositionDetail(id);
        System.out.println("78097890"+positionDetail);
        return ResponseEntity.ok(ApiResponse.success(positionDetail));
    }

    @GetMapping("/{id}/meetings")
    public ResponseEntity<ApiResponse<List<PositionMeetingDto>>> getPositionMeetings(
            @PathVariable("id") Long id) {
        List<PositionMeetingDto> meetings = positionService.getPositionMeetings(id);
        return ResponseEntity.ok(ApiResponse.success(meetings));
    }

    /**
     * 사용자별 회의체 목록 조회
     */
    @GetMapping("/employee/{employeeId}/meetings")
    public ResponseEntity<ApiResponse<List<PositionMeetingDto>>> getEmployeeMeetings(
            @PathVariable("employeeId") String employeeId) {
        log.info("사용자별 회의체 목록 조회 API 호출: employeeId={}23452345", employeeId);
        List<PositionMeetingDto> positionMeetings = new ArrayList<>();
        // 현재는 임시로 빈 목록 반환
        return ResponseEntity.ok(ApiResponse.success(positionMeetings));
    }

    /**
     * 사용자별 소관부서 목록 조회
     */
    @GetMapping("/employee/{employeeId}/owner-departments")
    public ResponseEntity<ApiResponse<List<PositionDetailDto.OwnerDeptInfo>>> getEmployeeOwnerDepartments(
            @PathVariable("employeeId") String employeeId) {
        log.info("사용자별 소관부서 목록 조회 API 호출: employeeId={}", employeeId);
        // 현재는 임시로 빈 목록 반환
        return ResponseEntity.ok(ApiResponse.success(new ArrayList<>()));
    }
}
