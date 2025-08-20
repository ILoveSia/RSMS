package org.itcen.domain.handover.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.dto.DocumentSearchDto;
import org.itcen.domain.handover.dto.ApprovalStartRequestDto;
import org.itcen.domain.handover.dto.ApprovalActionRequestDto;
import org.itcen.domain.handover.entity.ResponsibilityDocument;
import org.itcen.domain.handover.service.ResponsibilityDocumentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 책무기술서 컨트롤러
 * 책무기술서 관련 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 책무기술서 API 엔드포인트만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: Spring MVC 컨트롤러 규약 준수
 * - Interface Segregation: 책무기술서 관련 API만 제공
 * - Dependency Inversion: ResponsibilityDocumentService 인터페이스에 의존
 */
@Slf4j
@RestController
@RequestMapping("/handover/documents")
@RequiredArgsConstructor
public class ResponsibilityDocumentController {

    private final ResponsibilityDocumentService responsibilityDocumentService;

    /**
     * 책무기술서 생성
     */
    @PostMapping
    public ResponseEntity<ResponsibilityDocument> createDocument(@RequestBody ResponsibilityDocument document) {
        // log.debug("책무기술서 생성 요청 - positionId: {}, title: {}", 
        //           document.getPositionId(), document.getDocumentTitle());
        
        ResponsibilityDocument created = responsibilityDocumentService.createDocument(document);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무기술서 수정
     */
    @PutMapping("/{documentId}")
    public ResponseEntity<Void> updateDocument(
            @PathVariable Long documentId,
            @RequestBody ResponsibilityDocument document) {
        log.debug("책무기술서 수정 요청 - documentId: {}", documentId);
        
        responsibilityDocumentService.updateDocument(documentId, document);
        return ResponseEntity.ok().build();
    }

    /**
     * 책무기술서 조회
     */
    @GetMapping("/{documentId}")
    public ResponseEntity<ResponsibilityDocument> getDocument(@PathVariable Long documentId) {
        log.debug("책무기술서 조회 요청 - documentId: {}", documentId);
        
        return responsibilityDocumentService.getDocument(documentId)
                .map(document -> ResponseEntity.ok(document))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 책무기술서 삭제
     */
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long documentId) {
        log.debug("책무기술서 삭제 요청 - documentId: {}", documentId);
        
        responsibilityDocumentService.deleteDocument(documentId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 모든 책무기술서 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<ResponsibilityDocument>> getAllDocuments(@PageableDefault Pageable pageable) {
        log.debug("모든 책무기술서 조회 요청 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<ResponsibilityDocument> documents = responsibilityDocumentService.getAllDocuments(pageable);
        return ResponseEntity.ok(documents);
    }

    /**
     * 검토 단계로 제출 (deprecated - approval 테이블 사용)
     */
    @PostMapping("/{documentId}/submit")
    @Deprecated
    public ResponseEntity<Void> submitForReview(
            @PathVariable Long documentId,
            @RequestParam String actorEmpNo) {
        log.debug("검토 제출 요청 - documentId: {}", documentId);
        
        responsibilityDocumentService.submitForReview(documentId, null, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 문서 승인 (deprecated - approval 테이블 사용)
     */
    @PostMapping("/{documentId}/approve")
    @Deprecated
    public ResponseEntity<Void> approveDocument(
            @PathVariable Long documentId,
            @RequestParam String actorEmpNo) {
        log.debug("문서 승인 요청 - documentId: {}", documentId);
        
        responsibilityDocumentService.approveDocument(documentId, null, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 문서 발행
     */
    @PostMapping("/{documentId}/publish")
    public ResponseEntity<Void> publishDocument(
            @PathVariable Long documentId,
            @RequestParam String actorEmpNo) {
        log.debug("문서 발행 요청 - documentId: {}", documentId);
        
        responsibilityDocumentService.publishDocument(documentId, actorEmpNo);
        return ResponseEntity.ok().build();
    }
    /**
     * 문서 버전 업데이트
     */
    @PostMapping("/{documentId}/version")
    public ResponseEntity<ResponsibilityDocument> updateVersion(
            @PathVariable Long documentId,
            @RequestParam String newVersion,
            @RequestParam String actorEmpNo) {
        log.debug("버전 업데이트 요청 - documentId: {}, newVersion: {}", documentId, newVersion);
        
        ResponsibilityDocument updated = responsibilityDocumentService.updateVersion(documentId, newVersion, actorEmpNo);
        return ResponseEntity.ok(updated);
    }

    /**
     * 상태별 책무기술서 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getDocumentsByStatus(
            @PathVariable String status) {
        log.debug("상태별 책무기술서 조회 요청 - status: {}", status);
        
        List<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.getDocumentsByStatus(status);
        return ResponseEntity.ok(documents);
    }

    /**
     * 작성자별 책무기술서 조회
     */
    @GetMapping("/author/{authorEmpNo}")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getDocumentsByAuthor(
            @PathVariable String authorEmpNo) {
        log.debug("작성자별 책무기술서 조회 요청 - authorEmpNo: {}", authorEmpNo);
        
        List<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.getDocumentsByAuthor(authorEmpNo);
        return ResponseEntity.ok(documents);
    }
    /**
     * 유효한 문서 조회
     */
    @GetMapping("/valid")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getValidDocuments() {
        log.debug("유효한 문서 조회 요청");
        
        List<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.getValidDocuments();
        return ResponseEntity.ok(documents);
    }
    /**
     * 승인 대기중인 문서 조회
     */
    @GetMapping("/pending-approval")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getPendingApprovalDocuments() {
        log.debug("승인 대기 문서 조회 요청");
        
        List<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.getPendingApprovalDocuments();
        return ResponseEntity.ok(documents);
    }

    /**
     * 복합 조건 검색
     */
    @PostMapping("/search")
    public ResponseEntity<Page<ResponsibilityDocumentService.ResponsibilityDocumentDto>> searchDocuments(
            @RequestBody DocumentSearchDto searchDto,
            @PageableDefault Pageable pageable) {
        log.debug("복합 조건 검색 요청 - searchDto: {}", searchDto);
        
        Page<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.searchDocuments(searchDto, pageable);
        return ResponseEntity.ok(documents);
    }
    /**
     * 결재 연동 검색 - 결재 테이블과 조인하여 문서 검색
     */
    @PostMapping("/search-with-approval")
    public ResponseEntity<Page<ResponsibilityDocumentService.ResponsibilityDocumentWithApprovalDto>> searchDocumentsWithApproval(
            @RequestBody DocumentSearchDto searchDto,
            @PageableDefault Pageable pageable) {
        log.info("결재 연동 검색 요청 - searchDto: {}", searchDto);
        log.info("검색 파라미터 - documentTitle: '{}', authorEmpNo: '{}'", searchDto.getDocumentTitle(), searchDto.getAuthorEmpNo());
        
        Page<ResponsibilityDocumentService.ResponsibilityDocumentWithApprovalDto> documents = 
                responsibilityDocumentService.searchDocumentsWithApproval(searchDto, pageable);
        return ResponseEntity.ok(documents);
    }

    /**
     * 결재 요청 시작
     */
    @PostMapping("/{documentId}/approval/start")
    public ResponseEntity<Void> startApproval(
            @PathVariable Long documentId,
            @RequestBody ApprovalStartRequestDto request) {
        log.debug("결재 요청 시작 - documentId: {}, taskType: {}", documentId, request.getTaskTypeCode());
        
        responsibilityDocumentService.startApproval(documentId, request);
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 승인
     */
    @PostMapping("/{documentId}/approval/approve")
    public ResponseEntity<Void> approveApproval(
            @PathVariable Long documentId,
            @RequestBody(required = false) ApprovalActionRequestDto request) {
        log.debug("결재 승인 - documentId: {}", documentId);
        
        String comment = request != null ? request.getComment() : null;
        responsibilityDocumentService.approveApproval(documentId, comment);
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 반려
     */
    @PostMapping("/{documentId}/approval/reject")
    public ResponseEntity<Void> rejectApproval(
            @PathVariable Long documentId,
            @RequestBody ApprovalActionRequestDto request) {
        log.debug("결재 반려 - documentId: {}, reason: {}", documentId, request.getReason());
        
        responsibilityDocumentService.rejectApproval(documentId, request != null ? request.getReason() : "");
        return ResponseEntity.ok().build();
    }

    /**
     * 결재 취소
     */
    @PostMapping("/{documentId}/approval/cancel")
    public ResponseEntity<Void> cancelApproval(@PathVariable Long documentId) {
        log.debug("결재 취소 - documentId: {}", documentId);
        
        responsibilityDocumentService.cancelApproval(documentId);
        return ResponseEntity.ok().build();
    }
}