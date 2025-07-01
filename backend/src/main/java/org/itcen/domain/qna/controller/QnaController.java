package org.itcen.domain.qna.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.common.dto.ApiResponse;
import org.itcen.domain.qna.dto.*;
import org.itcen.domain.qna.service.QnaService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Q&A 컨트롤러
 * 
 * Q&A 관련 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: Q&A API 요청 처리만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: REST 컨트롤러 인터페이스를 안전하게 구현
 * - Interface Segregation: 필요한 서비스만 의존
 * - Dependency Inversion: 구체 클래스가 아닌 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/qna")
@RequiredArgsConstructor
public class QnaController {

    private final QnaService qnaService;

    /**
     * Q&A 목록 조회
     * 
     * @param searchRequest 검색 조건
     * @return Q&A 목록 페이지
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<QnaListResponseDto>>> getQnaList(
            @ModelAttribute QnaSearchRequestDto searchRequest) {
        
        log.debug("Q&A 목록 조회 요청: {}", searchRequest);
        
        Page<QnaListResponseDto> qnaList = qnaService.getQnaList(searchRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A 목록 조회가 완료되었습니다.", qnaList)
        );
    }

    /**
     * Q&A 상세 조회
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return Q&A 상세 정보
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QnaDetailResponseDto>> getQnaDetail(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 상세 조회 요청: ID={}, 사용자={}", id, currentUserId);
        
        QnaDetailResponseDto qnaDetail = qnaService.getQnaDetail(id, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A 상세 조회가 완료되었습니다.", qnaDetail)
        );
    }

    /**
     * Q&A 생성
     * 
     * @param createRequest 생성 요청 데이터
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @param currentUserName 현재 사용자 이름 (헤더에서 추출)
     * @return 생성된 Q&A ID
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Long>> createQna(
            @Valid @RequestBody QnaCreateRequestDto createRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId,
            @RequestHeader(value = "X-User-Name", defaultValue = "익명") String currentUserName) {
        
        log.debug("Q&A 생성 요청: 사용자={}, 제목={}", currentUserId, createRequest.getTitle());
        
        Long qnaId = qnaService.createQna(createRequest, currentUserId, currentUserName);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Q&A가 성공적으로 생성되었습니다.", qnaId));
    }

    /**
     * Q&A 수정
     * 
     * @param id Q&A ID
     * @param updateRequest 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 성공 메시지
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateQna(
            @PathVariable Long id,
            @Valid @RequestBody QnaUpdateRequestDto updateRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 수정 요청: ID={}, 사용자={}", id, currentUserId);
        
        qnaService.updateQna(id, updateRequest, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A가 성공적으로 수정되었습니다.", null)
        );
    }

    /**
     * Q&A 삭제
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 성공 메시지
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteQna(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 삭제 요청: ID={}, 사용자={}", id, currentUserId);
        
        qnaService.deleteQna(id, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A가 성공적으로 삭제되었습니다.", null)
        );
    }

    /**
     * Q&A 답변 등록
     * 
     * @param id Q&A ID
     * @param answerRequest 답변 요청 데이터
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @param currentUserName 현재 사용자 이름 (헤더에서 추출)
     * @return 성공 메시지
     */
    @PostMapping("/{id}/answer")
    public ResponseEntity<ApiResponse<Void>> addAnswer(
            @PathVariable Long id,
            @Valid @RequestBody QnaAnswerRequestDto answerRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId,
            @RequestHeader(value = "X-User-Name", defaultValue = "익명") String currentUserName) {
        
        log.debug("Q&A 답변 등록 요청: ID={}, 답변자={}", id, currentUserId);
        
        qnaService.addAnswer(id, answerRequest, currentUserId, currentUserName);
        
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("답변이 성공적으로 등록되었습니다.", null));
    }

    /**
     * Q&A 답변 수정
     * 
     * @param id Q&A ID
     * @param answerRequest 답변 수정 요청 데이터
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 성공 메시지
     */
    @PutMapping("/{id}/answer")
    public ResponseEntity<ApiResponse<Void>> updateAnswer(
            @PathVariable Long id,
            @Valid @RequestBody QnaAnswerRequestDto answerRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 답변 수정 요청: ID={}, 답변자={}", id, currentUserId);
        
        qnaService.updateAnswer(id, answerRequest, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("답변이 성공적으로 수정되었습니다.", null)
        );
    }

    /**
     * Q&A 종료
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 성공 메시지
     */
    @PatchMapping("/{id}/close")
    public ResponseEntity<ApiResponse<Void>> closeQna(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 종료 요청: ID={}, 사용자={}", id, currentUserId);
        
        qnaService.closeQna(id, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A가 성공적으로 종료되었습니다.", null)
        );
    }

    /**
     * 내가 작성한 Q&A 목록 조회
     * 
     * @param searchRequest 검색 조건
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 내 Q&A 목록 페이지
     */
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<Page<QnaListResponseDto>>> getMyQnaList(
            @ModelAttribute QnaSearchRequestDto searchRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("내 Q&A 목록 조회 요청: 사용자={}", currentUserId);
        
        Page<QnaListResponseDto> myQnaList = qnaService.getMyQnaList(currentUserId, searchRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("내 Q&A 목록 조회가 완료되었습니다.", myQnaList)
        );
    }

    /**
     * 내가 답변한 Q&A 목록 조회
     * 
     * @param searchRequest 검색 조건
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 내가 답변한 Q&A 목록 페이지
     */
    @GetMapping("/my-answers")
    public ResponseEntity<ApiResponse<Page<QnaListResponseDto>>> getMyAnsweredQnaList(
            @ModelAttribute QnaSearchRequestDto searchRequest,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("내가 답변한 Q&A 목록 조회 요청: 사용자={}", currentUserId);
        
        Page<QnaListResponseDto> myAnsweredQnaList = qnaService.getMyAnsweredQnaList(currentUserId, searchRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("내가 답변한 Q&A 목록 조회가 완료되었습니다.", myAnsweredQnaList)
        );
    }

    /**
     * 최근 Q&A 목록 조회
     * 
     * @param limit 조회 개수 (기본값: 10)
     * @return 최근 Q&A 목록
     */
    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<QnaListResponseDto>>> getRecentQnaList(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.debug("최근 Q&A 목록 조회 요청: limit={}", limit);
        
        List<QnaListResponseDto> recentQnaList = qnaService.getRecentQnaList(limit);
        
        return ResponseEntity.ok(
            ApiResponse.success("최근 Q&A 목록 조회가 완료되었습니다.", recentQnaList)
        );
    }

    /**
     * 인기 Q&A 목록 조회
     * 
     * @param limit 조회 개수 (기본값: 10)
     * @return 인기 Q&A 목록
     */
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<QnaListResponseDto>>> getPopularQnaList(
            @RequestParam(defaultValue = "10") int limit) {
        
        log.debug("인기 Q&A 목록 조회 요청: limit={}", limit);
        
        List<QnaListResponseDto> popularQnaList = qnaService.getPopularQnaList(limit);
        
        return ResponseEntity.ok(
            ApiResponse.success("인기 Q&A 목록 조회가 완료되었습니다.", popularQnaList)
        );
    }

    /**
     * 미답변 Q&A 개수 조회
     * 
     * @return 미답변 Q&A 개수
     */
    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Long>> getPendingQnaCount() {
        
        log.debug("미답변 Q&A 개수 조회 요청");
        
        Long pendingCount = qnaService.getPendingQnaCount();
        
        return ResponseEntity.ok(
            ApiResponse.success("미답변 Q&A 개수 조회가 완료되었습니다.", pendingCount)
        );
    }

    /**
     * 부서별 Q&A 통계 조회
     * 
     * @return 부서별 통계 목록
     */
    @GetMapping("/statistics/department")
    public ResponseEntity<ApiResponse<List<QnaStatisticsDto>>> getDepartmentStatistics() {
        
        log.debug("부서별 Q&A 통계 조회 요청");
        
        List<QnaStatisticsDto> statistics = qnaService.getDepartmentStatistics();
        
        return ResponseEntity.ok(
            ApiResponse.success("부서별 Q&A 통계 조회가 완료되었습니다.", statistics)
        );
    }

    /**
     * 월별 Q&A 통계 조회
     * 
     * @param months 조회할 개월 수 (기본값: 6)
     * @return 월별 통계 목록
     */
    @GetMapping("/statistics/monthly")
    public ResponseEntity<ApiResponse<List<QnaMonthlyStatisticsDto>>> getMonthlyStatistics(
            @RequestParam(defaultValue = "6") int months) {
        
        log.debug("월별 Q&A 통계 조회 요청: {}개월", months);
        
        List<QnaMonthlyStatisticsDto> statistics = qnaService.getMonthlyStatistics(months);
        
        return ResponseEntity.ok(
            ApiResponse.success("월별 Q&A 통계 조회가 완료되었습니다.", statistics)
        );
    }

    /**
     * Q&A 존재 여부 확인
     * 
     * @param id Q&A ID
     * @return 존재 여부
     */
    @GetMapping("/{id}/exists")
    public ResponseEntity<ApiResponse<Boolean>> existsQna(@PathVariable Long id) {
        
        log.debug("Q&A 존재 여부 확인 요청: ID={}", id);
        
        boolean exists = qnaService.existsQna(id);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A 존재 여부 확인이 완료되었습니다.", exists)
        );
    }

    /**
     * Q&A 수정 권한 확인
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 수정 권한 여부
     */
    @GetMapping("/{id}/can-edit")
    public ResponseEntity<ApiResponse<Boolean>> canEditQna(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 수정 권한 확인 요청: ID={}, 사용자={}", id, currentUserId);
        
        boolean canEdit = qnaService.canEditQna(id, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A 수정 권한 확인이 완료되었습니다.", canEdit)
        );
    }

    /**
     * Q&A 답변 권한 확인
     * 
     * @param id Q&A ID
     * @param currentUserId 현재 사용자 ID (헤더에서 추출)
     * @return 답변 권한 여부
     */
    @GetMapping("/{id}/can-answer")
    public ResponseEntity<ApiResponse<Boolean>> canAnswerQna(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", defaultValue = "anonymous") String currentUserId) {
        
        log.debug("Q&A 답변 권한 확인 요청: ID={}, 사용자={}", id, currentUserId);
        
        boolean canAnswer = qnaService.canAnswerQna(id, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A 답변 권한 확인이 완료되었습니다.", canAnswer)
        );
    }

    /**
     * 전체 Q&A 개수 조회 (디버깅용)
     * 
     * @return 전체 Q&A 개수
     */
    @GetMapping("/debug/count")
    public ResponseEntity<ApiResponse<Long>> getTotalQnaCount() {
        
        log.debug("전체 Q&A 개수 조회 요청 (디버깅용)");
        
        Long totalCount = qnaService.getTotalQnaCount();
        
        return ResponseEntity.ok(
            ApiResponse.success("전체 Q&A 개수 조회가 완료되었습니다.", totalCount)
        );
    }

    /**
     * 테스트 Q&A 데이터 생성 (디버깅용)
     * 
     * @return 생성 결과
     */
    @PostMapping("/debug/create-test-data")
    public ResponseEntity<ApiResponse<String>> createTestData() {
        
        log.debug("테스트 Q&A 데이터 생성 요청 (디버깅용)");
        
        String result = qnaService.createTestData();
        
        return ResponseEntity.ok(
            ApiResponse.success("테스트 데이터 생성이 완료되었습니다.", result)
        );
    }
}