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
        
        qnaService.updateAnswer(id, answerRequest, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("답변이 성공적으로 수정되었습니다.", null)
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
        
        Page<QnaListResponseDto> myAnsweredQnaList = qnaService.getMyAnsweredQnaList(currentUserId, searchRequest);
        
        return ResponseEntity.ok(
            ApiResponse.success("내가 답변한 Q&A 목록 조회가 완료되었습니다.", myAnsweredQnaList)
        );
    }

    /**
     * 미답변 Q&A 개수 조회
     * 
     * @return 미답변 Q&A 개수
     */
    @GetMapping("/pending-count")
    public ResponseEntity<ApiResponse<Long>> getPendingQnaCount() {
        
        Long pendingCount = qnaService.getPendingQnaCount();
        
        return ResponseEntity.ok(
            ApiResponse.success("미답변 Q&A 개수 조회가 완료되었습니다.", pendingCount)
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
        
        boolean canAnswer = qnaService.canAnswerQna(id, currentUserId);
        
        return ResponseEntity.ok(
            ApiResponse.success("Q&A 답변 권한 확인이 완료되었습니다.", canAnswer)
        );
    }
}