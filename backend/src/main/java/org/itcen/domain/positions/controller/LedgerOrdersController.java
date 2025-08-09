package org.itcen.domain.positions.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.positions.dto.LedgerOrdersGenerateResponseDto;
import org.itcen.domain.positions.dto.LedgerOrdersStatusCheckDto;
import org.itcen.domain.positions.service.LedgerOrdersService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 원장차수 Controller
 * 
 * 원장차수 관련 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 원장차수 API 요청 처리만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: HTTP 표준을 준수하여 일관된 응답 제공
 * - Interface Segregation: 필요한 기능만 제공
 * - Dependency Inversion: Service 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/ledger-orders")
@RequiredArgsConstructor
public class LedgerOrdersController {

    private final LedgerOrdersService ledgerOrdersService;

    /**
     * 현재 원장차수 상태 확인
     * 
     * GET /api/ledger-orders/status
     * 
     * @return 현재 상태 및 생성 가능 여부
     */
    @GetMapping("/status")
    public ResponseEntity<ApiResponse<LedgerOrdersStatusCheckDto>> checkGenerationStatus() {
        log.info("책무번호 생성 상태 확인 API 요청");
        
        try {
            LedgerOrdersStatusCheckDto response = ledgerOrdersService.checkGenerationStatus();
            log.info("책무번호 생성 상태 확인 완료: canGenerate={}", response.isCanGenerate());
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("책무번호 생성 상태 확인 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("상태 확인 중 오류가 발생했습니다."));
        }
    }

    /**
     * 새로운 책무번호(원장차수) 생성
     * 
     * POST /api/ledger-orders/generate
     * 
     * @return 생성된 원장차수 정보
     */
    @PostMapping("/generate")
    public ResponseEntity<ApiResponse<LedgerOrdersGenerateResponseDto>> generateLedgerOrder() {
        log.info("책무번호 생성 API 요청");
        
        try {
            LedgerOrdersGenerateResponseDto response = ledgerOrdersService.generateNewLedgerOrder();
            log.info("책무번호 생성 API 응답: {}", response.getLedgerOrdersTitle());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success("책무번호가 성공적으로 생성되었습니다.", response));
        } catch (Exception e) {
            log.error("책무번호 생성 실패", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 원장차수 제목으로 ledger_orders_id 조회
     * 
     * GET /api/ledger-orders/id-by-title?title={title}
     * 
     * @param title 원장차수 제목 (예: "2025-002")
     * @return ledger_orders_id
     */
    @GetMapping("/id-by-title")
    public ResponseEntity<ApiResponse<LedgerOrdersIdResponseDto>> getLedgerOrdersIdByTitle(
            @RequestParam("title") String title) {
        log.info("원장차수 ID 조회 API 요청: title={}", title);
        
        try {
            Long ledgerOrdersId = ledgerOrdersService.getLedgerOrdersIdByTitle(title);
            
            LedgerOrdersIdResponseDto response = LedgerOrdersIdResponseDto.builder()
                    .ledgerOrdersId(ledgerOrdersId)
                    .build();
                    
            log.info("원장차수 ID 조회 API 응답: title={}, id={}", title, ledgerOrdersId);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("원장차수 ID 조회 실패: title={}", title, e);
            // 데이터가 없을 경우 null 값으로 응답 (404 대신)
            LedgerOrdersIdResponseDto response = LedgerOrdersIdResponseDto.builder()
                    .ledgerOrdersId(null)
                    .build();
            return ResponseEntity.ok(ApiResponse.success(response));
        }
    }

    /**
     * 원장차수 확정 처리
     * 
     * PUT /api/ledger-orders/confirm
     * 
     * @param request 확정할 원장차수 정보
     * @return 확정 처리 결과
     */
    @PutMapping("/confirm")
    public ResponseEntity<ApiResponse<LedgerOrdersConfirmResponseDto>> confirmLedgerOrder(
            @RequestBody LedgerOrdersConfirmRequestDto request) {
        log.info("원장차수 확정 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.confirmLedgerOrder(request.getLedgerOrderValue());
            
            LedgerOrdersConfirmResponseDto response = LedgerOrdersConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("원장차수 확정 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("원장차수 확정 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 원장차수 확정취소 처리
     * 
     * PUT /api/ledger-orders/cancel-confirm
     * 
     * @param request 확정취소할 원장차수 정보
     * @return 확정취소 처리 결과
     */
    @PutMapping("/cancel-confirm")
    public ResponseEntity<ApiResponse<LedgerOrdersCancelConfirmResponseDto>> cancelConfirmLedgerOrder(
            @RequestBody LedgerOrdersCancelConfirmRequestDto request) {
        log.info("원장차수 확정취소 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.cancelConfirmLedgerOrder(request.getLedgerOrderValue());
            
            LedgerOrdersCancelConfirmResponseDto response = LedgerOrdersCancelConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("원장차수 확정취소 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("원장차수 확정취소 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 직책별 책무 확정 처리 (P2 → P3)
     * 
     * PUT /api/ledger-orders/position-responsibility-confirm
     * 
     * @param request 확정할 원장차수 정보
     * @return 확정 처리 결과
     */
    @PutMapping("/position-responsibility-confirm")
    public ResponseEntity<ApiResponse<LedgerOrdersConfirmResponseDto>> confirmPositionResponsibility(
            @RequestBody LedgerOrdersConfirmRequestDto request) {
        log.info("직책별 책무 확정 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.confirmPositionResponsibility(request.getLedgerOrderValue());
            
            LedgerOrdersConfirmResponseDto response = LedgerOrdersConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("직책별 책무 확정 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("직책별 책무 확정 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 직책별 책무 확정취소 처리 (P3 → P2)
     * 
     * PUT /api/ledger-orders/position-responsibility-cancel
     * 
     * @param request 확정취소할 원장차수 정보
     * @return 확정취소 처리 결과
     */
    @PutMapping("/position-responsibility-cancel")
    public ResponseEntity<ApiResponse<LedgerOrdersCancelConfirmResponseDto>> cancelPositionResponsibility(
            @RequestBody LedgerOrdersCancelConfirmRequestDto request) {
        log.info("직책별 책무 확정취소 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.cancelPositionResponsibility(request.getLedgerOrderValue());
            
            LedgerOrdersCancelConfirmResponseDto response = LedgerOrdersCancelConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("직책별 책무 확정취소 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("직책별 책무 확정취소 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 원장차수 ID 응답 DTO
     */
    public static class LedgerOrdersIdResponseDto {
        private final Long ledgerOrdersId;

        public LedgerOrdersIdResponseDto(Long ledgerOrdersId) {
            this.ledgerOrdersId = ledgerOrdersId;
        }

        public static LedgerOrdersIdResponseDtoBuilder builder() {
            return new LedgerOrdersIdResponseDtoBuilder();
        }

        public Long getLedgerOrdersId() {
            return ledgerOrdersId;
        }

        public static class LedgerOrdersIdResponseDtoBuilder {
            private Long ledgerOrdersId;

            public LedgerOrdersIdResponseDtoBuilder ledgerOrdersId(Long ledgerOrdersId) {
                this.ledgerOrdersId = ledgerOrdersId;
                return this;
            }

            public LedgerOrdersIdResponseDto build() {
                return new LedgerOrdersIdResponseDto(ledgerOrdersId);
            }
        }
    }

    /**
     * 원장차수 확정 요청 DTO
     */
    public static class LedgerOrdersConfirmRequestDto {
        private String ledgerOrderValue;

        public LedgerOrdersConfirmRequestDto() {}

        public LedgerOrdersConfirmRequestDto(String ledgerOrderValue) {
            this.ledgerOrderValue = ledgerOrderValue;
        }

        public String getLedgerOrderValue() {
            return ledgerOrderValue;
        }

        public void setLedgerOrderValue(String ledgerOrderValue) {
            this.ledgerOrderValue = ledgerOrderValue;
        }
    }

    /**
     * 원장차수 확정 응답 DTO
     */
    public static class LedgerOrdersConfirmResponseDto {
        private final String message;

        public LedgerOrdersConfirmResponseDto(String message) {
            this.message = message;
        }

        public static LedgerOrdersConfirmResponseDtoBuilder builder() {
            return new LedgerOrdersConfirmResponseDtoBuilder();
        }

        public String getMessage() {
            return message;
        }

        public static class LedgerOrdersConfirmResponseDtoBuilder {
            private String message;

            public LedgerOrdersConfirmResponseDtoBuilder message(String message) {
                this.message = message;
                return this;
            }

            public LedgerOrdersConfirmResponseDto build() {
                return new LedgerOrdersConfirmResponseDto(message);
            }
        }
    }

    /**
     * 원장차수 확정취소 요청 DTO
     */
    public static class LedgerOrdersCancelConfirmRequestDto {
        private String ledgerOrderValue;

        public LedgerOrdersCancelConfirmRequestDto() {}

        public LedgerOrdersCancelConfirmRequestDto(String ledgerOrderValue) {
            this.ledgerOrderValue = ledgerOrderValue;
        }

        public String getLedgerOrderValue() {
            return ledgerOrderValue;
        }

        public void setLedgerOrderValue(String ledgerOrderValue) {
            this.ledgerOrderValue = ledgerOrderValue;
        }
    }

    /**
     * 원장차수 확정취소 응답 DTO
     */
    public static class LedgerOrdersCancelConfirmResponseDto {
        private final String message;

        public LedgerOrdersCancelConfirmResponseDto(String message) {
            this.message = message;
        }

        public static LedgerOrdersCancelConfirmResponseDtoBuilder builder() {
            return new LedgerOrdersCancelConfirmResponseDtoBuilder();
        }

        public String getMessage() {
            return message;
        }

        public static class LedgerOrdersCancelConfirmResponseDtoBuilder {
            private String message;

            public LedgerOrdersCancelConfirmResponseDtoBuilder message(String message) {
                this.message = message;
                return this;
            }

            public LedgerOrdersCancelConfirmResponseDto build() {
                return new LedgerOrdersCancelConfirmResponseDto(message);
            }
        }
    }

    /**
     * 임원 확정 처리 (P3 → P4)
     * 
     * PUT /api/ledger-orders/executive-confirm
     * 
     * @param request 확정할 원장차수 정보
     * @return 확정 처리 결과
     */
    @PutMapping("/executive-confirm")
    public ResponseEntity<ApiResponse<LedgerOrdersConfirmResponseDto>> confirmExecutive(
            @RequestBody LedgerOrdersConfirmRequestDto request) {
        log.info("임원 확정 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.confirmExecutive(request.getLedgerOrderValue());
            
            LedgerOrdersConfirmResponseDto response = LedgerOrdersConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("임원 확정 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("임원 확정 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 임원 확정취소 처리 (P4 → P3)
     * 
     * PUT /api/ledger-orders/executive-cancel
     * 
     * @param request 확정취소할 원장차수 정보
     * @return 확정취소 처리 결과
     */
    @PutMapping("/executive-cancel")
    public ResponseEntity<ApiResponse<LedgerOrdersCancelConfirmResponseDto>> cancelExecutive(
            @RequestBody LedgerOrdersCancelConfirmRequestDto request) {
        log.info("임원 확정취소 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.cancelExecutive(request.getLedgerOrderValue());
            
            LedgerOrdersCancelConfirmResponseDto response = LedgerOrdersCancelConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("임원 확정취소 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("임원 확정취소 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * 임원 최종확정 처리 (P4 → P5)
     * 
     * PUT /api/ledger-orders/executive-final-confirm
     * 
     * @param request 최종확정할 원장차수 정보
     * @return 최종확정 처리 결과
     */
    @PutMapping("/executive-final-confirm")
    public ResponseEntity<ApiResponse<LedgerOrdersConfirmResponseDto>> finalConfirmExecutive(
            @RequestBody LedgerOrdersConfirmRequestDto request) {
        log.info("임원 최종확정 API 요청: ledgerOrderValue={}", request.getLedgerOrderValue());
        
        try {
            String message = ledgerOrdersService.finalConfirmExecutive(request.getLedgerOrderValue());
            
            LedgerOrdersConfirmResponseDto response = LedgerOrdersConfirmResponseDto.builder()
                    .message(message)
                    .build();
            
            log.info("임원 최종확정 API 응답: {}", message);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("임원 최종확정 실패: ledgerOrderValue={}", request.getLedgerOrderValue(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}