package org.itcen.domain.positions.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.positions.dto.LedgerOrdersHodGenerateResponseDto;
import org.itcen.domain.positions.dto.LedgerOrdersHodSelectDto;
import org.itcen.domain.positions.entity.LedgerOrdersHod;
import org.itcen.domain.positions.service.LedgerOrdersHodService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 부서장 원장차수 Controller
 *
 * 부서장 원장차수에 대한 REST API를 제공합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: 부서장 원장차수 API 요청 처리만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: HTTP 표준을 준수하여 일관된 응답 제공
 * - Interface Segregation: 필요한 기능만 제공
 * - Dependency Inversion: Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/positions/ledger-orders-hod")
@RequiredArgsConstructor
@Validated
public class LedgerOrdersHodController {

    private final LedgerOrdersHodService ledgerOrdersHodService;

    /**
     * 부서장 원장차수 SelectBox용 목록 조회
     */
    @GetMapping("/select-list")
    public ResponseEntity<ApiResponse<List<LedgerOrdersHodSelectDto>>> getLedgerOrdersHodSelectList() {
        List<LedgerOrdersHodSelectDto> list = ledgerOrdersHodService.getLedgerOrdersHodSelectList();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * 모든 부서장 원장차수 목록 조회
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<LedgerOrdersHod>>> getAllLedgerOrdersHod() {
        List<LedgerOrdersHod> list = ledgerOrdersHodService.getAllLedgerOrdersHod();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * 부서장 원장차수 상세 조회
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<LedgerOrdersHod>> getLedgerOrdersHodById(@PathVariable("id") Long id) {
        LedgerOrdersHod ledgerOrdersHod = ledgerOrdersHodService.getLedgerOrdersHodById(id);
        return ResponseEntity.ok(ApiResponse.success(ledgerOrdersHod));
    }

    /**
     * 필드타입코드로 부서장 원장차수 목록 조회
     */
    @GetMapping("/field-type/{fieldTypeCd}")
    public ResponseEntity<ApiResponse<List<LedgerOrdersHod>>> getLedgerOrdersHodByFieldType(
            @PathVariable("fieldTypeCd") String fieldTypeCd) {
        List<LedgerOrdersHod> list = ledgerOrdersHodService.getLedgerOrdersHodByFieldType(fieldTypeCd);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * 부서장 원장차수 생성
     */
    @PostMapping
    public ResponseEntity<ApiResponse<LedgerOrdersHod>> createLedgerOrdersHod(
            @Valid @RequestBody LedgerOrdersHod ledgerOrdersHod) {
        LedgerOrdersHod result = ledgerOrdersHodService.createLedgerOrdersHod(ledgerOrdersHod);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("부서장 원장차수가 성공적으로 생성되었습니다.", result));
    }

    /**
     * 부서장 원장차수 수정
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<LedgerOrdersHod>> updateLedgerOrdersHod(
            @PathVariable("id") Long id,
            @Valid @RequestBody LedgerOrdersHod ledgerOrdersHod) {
        LedgerOrdersHod result = ledgerOrdersHodService.updateLedgerOrdersHod(id, ledgerOrdersHod);
        return ResponseEntity.ok(ApiResponse.success("부서장 원장차수가 성공적으로 수정되었습니다.", result));
    }

    /**
     * 부서장 원장차수 삭제
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLedgerOrdersHod(@PathVariable("id") Long id) {
        ledgerOrdersHodService.deleteLedgerOrdersHod(id);
        return ResponseEntity.ok(ApiResponse.success("부서장 원장차수가 성공적으로 삭제되었습니다."));
    }

    /**
     * 부서장 원장차수 일괄 삭제
     */
    @DeleteMapping("/bulk")
    public ResponseEntity<ApiResponse<Void>> deleteBulkLedgerOrdersHod(@RequestBody List<Long> ids) {
        ledgerOrdersHodService.deleteBulkLedgerOrdersHod(ids);
        return ResponseEntity.ok(ApiResponse.success("부서장 원장차수가 성공적으로 일괄 삭제되었습니다."));
    }

    /**
     * 부서장차수 생성
     * 
     * POST /api/positions/ledger-orders-hod/generate
     * 
     * @return 생성된 부서장 원장차수 정보
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<LedgerOrdersHodGenerateResponseDto>> generateHodLedgerOrder() {
        log.info("부서장차수 생성 API 요청");
        
        try {
            LedgerOrdersHodGenerateResponseDto response = ledgerOrdersHodService.generateHodLedgerOrder();
            log.info("부서장차수 생성 API 응답: {}", response.getLedgerOrdersHodTitle());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("부서장차수가 성공적으로 생성되었습니다.", response));
        } catch (Exception e) {
            log.error("부서장차수 생성 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 부서장차수 확정
     * 
     * PUT /api/positions/ledger-orders-hod/{id}/confirm
     * 
     * 확정 조건:
     * 1. 해당 부서장차수의 status가 P6이어야 함
     * 2. 해당 부서장차수에 속한 모든 HodICItem의 approvalStatus가 APPROVED이어야 함
     * 
     * @param id 확정할 부서장차수 ID
     * @return 확정 완료 응답
     */
    @PutMapping("/{id}/confirm")
    public ResponseEntity<ApiResponse<Void>> confirmHodLedgerOrder(@PathVariable("id") Long id) {
        log.info("부서장차수 확정 API 요청: id={}", id);
        
        try {
            ledgerOrdersHodService.confirmHodLedgerOrder(id);
            log.info("부서장차수 확정 완료: id={}", id);
            
            return ResponseEntity.ok(ApiResponse.success("부서장차수가 성공적으로 확정되었습니다."));
        } catch (Exception e) {
            log.error("부서장차수 확정 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}