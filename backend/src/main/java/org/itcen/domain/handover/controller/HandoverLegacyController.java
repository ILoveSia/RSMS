package org.itcen.domain.handover.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.entity.HandoverAssignment;
import org.itcen.domain.handover.service.HandoverService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 인수인계 지정 컨트롤러
 * 인수인계 지정 관련 REST API를 제공합니다.
 * 
 * SOLID 원칙:
 * - Single Responsibility: 인수인계 지정 API 엔드포인트만 담당
 * - Open/Closed: 새로운 API 추가 시 확장 가능
 * - Liskov Substitution: Spring MVC 컨트롤러 규약 준수
 * - Interface Segregation: 인수인계 관련 API만 제공
 * - Dependency Inversion: HandoverService 인터페이스에 의존
 */
@Slf4j
// @RestControl 비활성화
@RequestMapping("/handover/legacy-assignments")
@RequiredArgsConstructor
public class HandoverLegacyController {

    private final HandoverService handoverService;

    /**
     * 인수인계 지정 생성
     */
    @PostMapping
    public ResponseEntity<HandoverAssignment> createHandoverAssignment(@RequestBody HandoverAssignment handoverAssignment) {
        log.debug("인수인계 지정 생성 요청 - positionId: {}", handoverAssignment.getPositionId());
        
        HandoverAssignment created = handoverService.createHandoverAssignment(handoverAssignment);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * 인수인계 지정 수정
     */
    @PutMapping("/{assignmentId}")
    public ResponseEntity<HandoverAssignment> updateHandoverAssignment(
            @PathVariable Long assignmentId,
            @RequestBody HandoverAssignment handoverAssignment) {
        log.debug("인수인계 지정 수정 요청 - assignmentId: {}", assignmentId);
        
        HandoverAssignment updated = handoverService.updateHandoverAssignment(assignmentId, handoverAssignment);
        return ResponseEntity.ok(updated);
    }

    /**
     * 인수인계 지정 조회
     */
    @GetMapping("/{assignmentId}")
    public ResponseEntity<HandoverAssignment> getHandoverAssignment(@PathVariable Long assignmentId) {
        log.debug("인수인계 지정 조회 요청 - assignmentId: {}", assignmentId);
        
        return handoverService.getHandoverAssignment(assignmentId)
                .map(assignment -> ResponseEntity.ok(assignment))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 인수인계 지정 삭제
     */
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteHandoverAssignment(@PathVariable Long assignmentId) {
        log.debug("인수인계 지정 삭제 요청 - assignmentId: {}", assignmentId);
        
        handoverService.deleteHandoverAssignment(assignmentId);
        return ResponseEntity.noContent().build();
    }

    /**
     * 모든 인수인계 지정 조회 (페이징)
     */
    @GetMapping
    public ResponseEntity<Page<HandoverAssignment>> getAllHandoverAssignments(@PageableDefault Pageable pageable) {
        log.debug("모든 인수인계 지정 조회 요청 - page: {}, size: {}", pageable.getPageNumber(), pageable.getPageSize());
        
        Page<HandoverAssignment> assignments = handoverService.getAllHandoverAssignments(pageable);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 인수인계 시작
     */
    @PostMapping("/{assignmentId}/start")
    public ResponseEntity<Void> startHandover(
            @PathVariable Long assignmentId,
            @RequestParam String actorEmpNo) {
        log.debug("인수인계 시작 요청 - assignmentId: {}, actorEmpNo: {}", assignmentId, actorEmpNo);
        
        handoverService.startHandover(assignmentId, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 인수인계 완료
     */
    @PostMapping("/{assignmentId}/complete")
    public ResponseEntity<Void> completeHandover(
            @PathVariable Long assignmentId,
            @RequestParam String actorEmpNo) {
        log.debug("인수인계 완료 요청 - assignmentId: {}, actorEmpNo: {}", assignmentId, actorEmpNo);
        
        handoverService.completeHandover(assignmentId, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 인수인계 취소
     */
    @PostMapping("/{assignmentId}/cancel")
    public ResponseEntity<Void> cancelHandover(
            @PathVariable Long assignmentId,
            @RequestParam String actorEmpNo,
            @RequestParam(required = false) String reason) {
        log.debug("인수인계 취소 요청 - assignmentId: {}, actorEmpNo: {}, reason: {}", assignmentId, actorEmpNo, reason);
        
        handoverService.cancelHandover(assignmentId, actorEmpNo, reason);
        return ResponseEntity.ok().build();
    }

    /**
     * 진행률 업데이트
     */
    @PostMapping("/{assignmentId}/progress")
    public ResponseEntity<Void> updateProgress(
            @PathVariable Long assignmentId,
            @RequestParam Integer progressRate,
            @RequestParam String actorEmpNo) {
        log.debug("진행률 업데이트 요청 - assignmentId: {}, progressRate: {}", assignmentId, progressRate);
        
        handoverService.updateProgress(assignmentId, progressRate, actorEmpNo);
        return ResponseEntity.ok().build();
    }

    /**
     * 직책별 인수인계 지정 조회
     */
    @GetMapping("/position/{positionId}")
    public ResponseEntity<List<HandoverService.HandoverAssignmentDto>> getHandoverAssignmentsByPosition(
            @PathVariable Long positionId) {
        log.debug("직책별 인수인계 지정 조회 요청 - positionId: {}", positionId);
        
        List<HandoverService.HandoverAssignmentDto> assignments = 
                handoverService.getHandoverAssignmentsByPosition(positionId);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 사용자별 인수인계 현황 조회
     */
    @GetMapping("/employee/{empNo}")
    public ResponseEntity<List<HandoverService.HandoverAssignmentDto>> getHandoverAssignmentsByEmployee(
            @PathVariable String empNo) {
        log.debug("사용자별 인수인계 현황 조회 요청 - empNo: {}", empNo);
        
        List<HandoverService.HandoverAssignmentDto> assignments = 
                handoverService.getHandoverAssignmentsByEmployee(empNo);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 상태별 인수인계 지정 조회
     */
    @GetMapping("/status/{status}")
    public ResponseEntity<List<HandoverService.HandoverAssignmentDto>> getHandoverAssignmentsByStatus(
            @PathVariable HandoverAssignment.HandoverStatus status) {
        log.debug("상태별 인수인계 지정 조회 요청 - status: {}", status);
        
        List<HandoverService.HandoverAssignmentDto> assignments = 
                handoverService.getHandoverAssignmentsByStatus(status);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 진행중인 인수인계 조회
     */
    @GetMapping("/active")
    public ResponseEntity<List<HandoverService.HandoverAssignmentDto>> getActiveHandovers() {
        log.debug("진행중인 인수인계 조회 요청");
        
        List<HandoverService.HandoverAssignmentDto> assignments = handoverService.getActiveHandovers();
        return ResponseEntity.ok(assignments);
    }

    /**
     * 지연된 인수인계 조회
     */
    @GetMapping("/delayed")
    public ResponseEntity<List<HandoverService.HandoverAssignmentDto>> getDelayedHandovers() {
        log.debug("지연된 인수인계 조회 요청");
        
        List<HandoverService.HandoverAssignmentDto> assignments = handoverService.getDelayedHandovers();
        return ResponseEntity.ok(assignments);
    }

    /**
     * 복합 조건 검색
     */
    @PostMapping("/search")
    public ResponseEntity<Page<HandoverService.HandoverAssignmentDto>> searchHandoverAssignments(
            @RequestBody HandoverService.HandoverAssignmentSearchDto searchDto,
            @PageableDefault Pageable pageable) {
        log.debug("복합 조건 검색 요청 - searchDto: {}", searchDto);
        
        Page<HandoverService.HandoverAssignmentDto> assignments = 
                handoverService.searchHandoverAssignments(searchDto, pageable);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 인수인계 통계
     */
    @GetMapping("/statistics")
    public ResponseEntity<HandoverService.HandoverStatisticsDto> getHandoverStatistics() {
        log.debug("인수인계 통계 조회 요청");
        
        HandoverService.HandoverStatisticsDto statistics = handoverService.getHandoverStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 월별 완료 통계
     */
    @GetMapping("/statistics/monthly")
    public ResponseEntity<List<HandoverService.MonthlyStatisticsDto>> getMonthlyCompletionStatistics() {
        log.debug("월별 완료 통계 조회 요청");
        
        List<HandoverService.MonthlyStatisticsDto> statistics = handoverService.getMonthlyCompletionStatistics();
        return ResponseEntity.ok(statistics);
    }

    /**
     * 상태별 통계
     */
    @GetMapping("/statistics/status")  
    public ResponseEntity<List<HandoverService.StatusStatisticsDto>> getStatusStatistics() {
        log.debug("상태별 통계 조회 요청");
        
        List<HandoverService.StatusStatisticsDto> statistics = handoverService.getStatusStatistics();
        return ResponseEntity.ok(statistics);
    }
}