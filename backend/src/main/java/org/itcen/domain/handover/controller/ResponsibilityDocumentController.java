package org.itcen.domain.handover.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.dto.DocumentSearchDto;
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
        log.debug("책무기술서 생성 요청 - positionId: {}, title: {}", 
                  document.getPositionId(), document.getDocumentTitle());
        
        ResponsibilityDocument created = responsibilityDocumentService.createDocument(document);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 책무기술서 수정
     */
    @PutMapping("/{documentId}")
    public ResponseEntity<ResponsibilityDocument> updateDocument(
            @PathVariable Long documentId,
            @RequestBody ResponsibilityDocument document) {
        log.debug("책무기술서 수정 요청 - documentId: {}", documentId);
        
        ResponsibilityDocument updated = responsibilityDocumentService.updateDocument(documentId, document);
        return ResponseEntity.ok(updated);
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
     * 검토 단계로 제출
     */
    @PostMapping("/{documentId}/submit")
    public ResponseEntity<Void> submitForReview(
            @PathVariable Long documentId,
            @RequestParam String reviewerEmpNo,
            @RequestParam String actorEmpNo) {
        log.debug("검토 제출 요청 - documentId: {}, reviewerEmpNo: {}", documentId, reviewerEmpNo);
        
        responsibilityDocumentService.submitForReview(documentId, reviewerEmpNo, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 문서 승인
     */
    @PostMapping("/{documentId}/approve")
    public ResponseEntity<Void> approveDocument(
            @PathVariable Long documentId,
            @RequestParam String approverEmpNo,
            @RequestParam String actorEmpNo) {
        log.debug("문서 승인 요청 - documentId: {}, approverEmpNo: {}", documentId, approverEmpNo);
        
        responsibilityDocumentService.approveDocument(documentId, approverEmpNo, actorEmpNo);
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
     * 초안으로 되돌리기
     */
    @PostMapping("/{documentId}/revert")
    public ResponseEntity<Void> revertToDraft(
            @PathVariable Long documentId,
            @RequestParam String actorEmpNo,
            @RequestParam(required = false) String reason) {
        log.debug("초안 되돌리기 요청 - documentId: {}, reason: {}", documentId, reason);
        
        responsibilityDocumentService.revertToDraft(documentId, actorEmpNo, reason);
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
     * 직책별 책무기술서 조회
     */
    @GetMapping("/position/{positionId}")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getDocumentsByPosition(
            @PathVariable Long positionId) {
        log.debug("직책별 책무기술서 조회 요청 - positionId: {}", positionId);
        
        List<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.getDocumentsByPosition(positionId);
        return ResponseEntity.ok(documents);
    }

    /**
     * 상태별 책무기술서 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getDocumentsByStatus(
            @PathVariable ResponsibilityDocument.DocumentStatus status) {
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
     * 직책의 최신 발행 문서 조회
     */
    @GetMapping("/position/{positionId}/latest")
    public ResponseEntity<ResponsibilityDocumentService.ResponsibilityDocumentDto> getLatestPublishedDocument(
            @PathVariable Long positionId) {
        log.debug("최신 발행 문서 조회 요청 - positionId: {}", positionId);
        
        return responsibilityDocumentService.getLatestPublishedDocument(positionId)
                .map(document -> ResponseEntity.ok(document))
                .orElse(ResponseEntity.notFound().build());
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
     * 만료 예정 문서 조회
     */
    @GetMapping("/expiring")
    public ResponseEntity<List<ResponsibilityDocumentService.ResponsibilityDocumentDto>> getExpiringDocuments(
            @RequestParam(defaultValue = "30") int daysFromNow) {
        log.debug("만료 예정 문서 조회 요청 - daysFromNow: {}", daysFromNow);
        
        List<ResponsibilityDocumentService.ResponsibilityDocumentDto> documents = 
                responsibilityDocumentService.getExpiringDocuments(daysFromNow);
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
     * 문서 통계
     */
    @GetMapping("/statistics")
    public ResponseEntity<ResponsibilityDocumentService.DocumentStatisticsDto> getDocumentStatistics() {
        log.debug("문서 통계 조회 요청");
        
        ResponsibilityDocumentService.DocumentStatisticsDto statistics = 
                responsibilityDocumentService.getDocumentStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 월별 생성 통계
     */
    @GetMapping("/statistics/monthly")
    public ResponseEntity<List<ResponsibilityDocumentService.MonthlyStatisticsDto>> getMonthlyCreationStatistics() {
        log.debug("월별 생성 통계 조회 요청");
        
        List<ResponsibilityDocumentService.MonthlyStatisticsDto> statistics = 
                responsibilityDocumentService.getMonthlyCreationStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 상태별 통계
     */
    @GetMapping("/statistics/status")
    public ResponseEntity<List<ResponsibilityDocumentService.StatusStatisticsDto>> getStatusStatistics() {
        log.debug("상태별 통계 조회 요청");
        
        List<ResponsibilityDocumentService.StatusStatisticsDto> statistics = 
                responsibilityDocumentService.getStatusStatistics();
        return ResponseEntity.ok(statistics);
    }
}