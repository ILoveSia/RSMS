package org.itcen.domain.hodicitem.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.hodicitem.dto.HodICItemCreateRequestDto;
import org.itcen.domain.hodicitem.dto.HodICItemResponseDto;
import org.itcen.domain.hodicitem.dto.HodICItemStatusProjection;
import org.itcen.domain.hodicitem.service.HodICItemService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

/**
 * 부서장 내부통제 항목 컨트롤러
 *
 * 부서장 내부통제 항목 관련 HTTP 요청을 처리합니다.
 *
 * SOLID 원칙:
 * - Single Responsibility: HTTP 요청/응답 처리만 담당
 * - Open/Closed: 새로운 엔드포인트 추가 시 확장 가능
 * - Interface Segregation: 필요한 의존성만 주입
 * - Dependency Inversion: 구체 클래스가 아닌 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/hod-ic-items")
@RequiredArgsConstructor
public class HodICItemController {

    private final HodICItemService hodICItemService;

    /**
     * 부서장 내부통제 항목 현황 조회
     *
     * @param ledgerOrders 책무번호(원장차수) 필터 (선택사항)
     * @param fieldType 항목구분 필터 (선택사항)
     * @return 부서장 내부통제 항목 현황 목록
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<HodICItemStatusProjection>>> getHodICItemStatusList(
            @RequestParam(value = "ledgerOrders", required = false) Long ledgerOrders,
            @RequestParam(value = "fieldType", required = false) String fieldType) {

        List<HodICItemStatusProjection> statusList = hodICItemService.getHodICItemStatusList(ledgerOrders, fieldType);
        return ResponseEntity.ok(
            ApiResponse.success("부서장 내부통제 항목 현황 조회 성공", statusList)
        );
    }

    /**
     * 부서장 내부통제 항목 상세 조회
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @return 부서장 내부통제 항목 상세 정보
     */
    @GetMapping("/{hodIcItemId}")
    public ResponseEntity<ApiResponse<HodICItemResponseDto>> getHodICItemById(
            @PathVariable Long hodIcItemId) {

        HodICItemResponseDto responseDto = hodICItemService.getHodICItemById(hodIcItemId);
        return ResponseEntity.ok(
            ApiResponse.success("부서장 내부통제 항목 상세 조회 성공", responseDto)
        );
    }

    /**
     * 부서장 내부통제 항목 등록
     *
     * @param createRequest 등록 요청 데이터
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 등록된 부서장 내부통제 항목 ID
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createHodICItem(
            @Valid @RequestBody HodICItemCreateRequestDto createRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String currentUserId) {

        Long hodIcItemId = hodICItemService.createHodICItem(createRequest, currentUserId);
        return ResponseEntity.ok(
            ApiResponse.success("부서장 내부통제 항목이 성공적으로 등록되었습니다.", hodIcItemId)
        );
    }

    /**
     * 부서장 내부통제 항목 수정
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param updateRequest 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 수정된 부서장 내부통제 항목 정보
     */
    @PutMapping("/{hodIcItemId}")
    public ResponseEntity<ApiResponse<HodICItemResponseDto>> updateHodICItem(
            @PathVariable Long hodIcItemId,
            @Valid @RequestBody HodICItemCreateRequestDto updateRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String currentUserId) {

        HodICItemResponseDto responseDto = hodICItemService.updateHodICItem(hodIcItemId, updateRequest, currentUserId);
        return ResponseEntity.ok(
            ApiResponse.success("부서장 내부통제 항목이 성공적으로 수정되었습니다.", responseDto)
        );
    }

    /**
     * 부서장 내부통제 항목 삭제
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/{hodIcItemId}")
    public ResponseEntity<ApiResponse<Void>> deleteHodICItem(
            @PathVariable Long hodIcItemId,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String currentUserId) {

        hodICItemService.deleteHodICItem(hodIcItemId, currentUserId);
        return ResponseEntity.ok(
            ApiResponse.success("부서장 내부통제 항목이 성공적으로 삭제되었습니다.", null)
        );
    }

    /**
     * 부서장 내부통제 항목 다중 삭제
     *
     * @param hodIcItemIds 삭제할 부서장 내부통제 항목 ID 목록
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 삭제 성공 메시지
     */
    @DeleteMapping("/batch")
    public ResponseEntity<ApiResponse<Void>> deleteMultipleHodICItems(
            @RequestBody List<Long> hodIcItemIds,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String currentUserId) {

        hodICItemService.deleteMultipleHodICItems(hodIcItemIds, currentUserId);
        return ResponseEntity.ok(
            ApiResponse.success("선택한 부서장 내부통제 항목들이 성공적으로 삭제되었습니다.", null)
        );
    }

    /**
     * 결재 승인 요청
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 생성된 결재 ID
     */
    @PostMapping("/{hodIcItemId}/approval")
    public ResponseEntity<ApiResponse<Long>> requestApproval(
            @PathVariable Long hodIcItemId,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String currentUserId) {

        Long approvalId = hodICItemService.requestApproval(hodIcItemId, currentUserId);
        return ResponseEntity.ok(
            ApiResponse.success("결재 승인 요청이 성공적으로 처리되었습니다.", approvalId)
        );
    }

    /**
     * 작성자 권한 확인
     *
     * @param hodIcItemId 부서장 내부통제 항목 ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 작성자 여부
     */
    @GetMapping("/{hodIcItemId}/is-created-by")
    public ResponseEntity<ApiResponse<Boolean>> isCreatedBy(
            @PathVariable Long hodIcItemId,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String currentUserId) {

        boolean isCreatedBy = hodICItemService.isCreatedBy(hodIcItemId, currentUserId);
        return ResponseEntity.ok(
            ApiResponse.success("작성자 권한 확인 완료", isCreatedBy)
        );
    }
}
