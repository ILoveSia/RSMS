package org.itcen.domain.handover.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.itcen.domain.handover.dto.HandoverAssignmentDto;
import org.itcen.domain.handover.service.HandoverAssignmentService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * 인수인계 지정 컨트롤러
 */
@RestController
@RequestMapping("/handover/assignments")
@RequiredArgsConstructor
@Slf4j
public class HandoverAssignmentController {

    private final HandoverAssignmentService handoverAssignmentService;

    /**
     * 인수인계 지정 목록 조회
     */
    @GetMapping("/list")
    public ResponseEntity<Page<HandoverAssignmentDto>> getAssignments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "assignmentId") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        log.info("인수인계 지정 목록 조회 요청 - 페이지: {}, 크기: {}", page, size);
        
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<HandoverAssignmentDto> assignments = handoverAssignmentService.getAssignments(pageable);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 인수인계 지정 검색
     */
    @GetMapping("/search")
    public ResponseEntity<Page<HandoverAssignmentDto>> searchAssignments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String handoverType,
            @RequestParam(required = false) String fromEmpNo,
            @RequestParam(required = false) String toEmpNo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "assignmentId") String sort,
            @RequestParam(defaultValue = "desc") String direction) {
        
        log.info("인수인계 지정 검색 요청 - 상태: {}, 유형: {}", status, handoverType);
        
        Sort.Direction sortDirection = "desc".equalsIgnoreCase(direction) 
                ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sort));
        
        Page<HandoverAssignmentDto> assignments = handoverAssignmentService.searchAssignments(
                status, handoverType, fromEmpNo, toEmpNo, startDate, endDate, pageable);
        
        return ResponseEntity.ok(assignments);
    }

    /**
     * 인수인계 지정 상세 조회
     */
    @GetMapping("/{assignmentId}")
    public ResponseEntity<HandoverAssignmentDto> getAssignment(@PathVariable Long assignmentId) {
        log.info("인수인계 지정 상세 조회 요청 - ID: {}", assignmentId);
        
        HandoverAssignmentDto assignment = handoverAssignmentService.getAssignment(assignmentId);
        return ResponseEntity.ok(assignment);
    }

    /**
     * 인수인계 지정 생성
     */
    @PostMapping
    public ResponseEntity<HandoverAssignmentDto> createAssignment(
            @RequestBody HandoverAssignmentDto dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String actorId) {
        
        log.info("인수인계 지정 생성 요청 - 인계자: {}, 인수자: {}", 
                dto.getAssignorEmpNo(), dto.getAssigneeEmpNo());
        
        HandoverAssignmentDto createdAssignment = handoverAssignmentService.createAssignment(dto, actorId);
        return ResponseEntity.ok(createdAssignment);
    }

    /**
     * 인수인계 지정 수정
     */
    @PutMapping("/{assignmentId}")
    public ResponseEntity<HandoverAssignmentDto> updateAssignment(
            @PathVariable Long assignmentId,
            @RequestBody HandoverAssignmentDto dto,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String actorId) {
        
        log.info("인수인계 지정 수정 요청 - ID: {}", assignmentId);
        
        HandoverAssignmentDto updatedAssignment = handoverAssignmentService.updateAssignment(assignmentId, dto, actorId);
        return ResponseEntity.ok(updatedAssignment);
    }

    /**
     * 인수인계 지정 삭제
     */
    @DeleteMapping("/{assignmentId}")
    public ResponseEntity<Void> deleteAssignment(
            @PathVariable Long assignmentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String actorId) {
        
        log.info("인수인계 지정 삭제 요청 - ID: {}", assignmentId);
        
        handoverAssignmentService.deleteAssignment(assignmentId, actorId);
        return ResponseEntity.ok().build();
    }

    /**
     * 인수인계 시작
     */
    @PostMapping("/{assignmentId}/start")
    public ResponseEntity<HandoverAssignmentDto> startHandover(
            @PathVariable Long assignmentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String actorId) {
        
        log.info("인수인계 시작 요청 - ID: {}", assignmentId);
        
        HandoverAssignmentDto assignment = handoverAssignmentService.startHandover(assignmentId, actorId);
        return ResponseEntity.ok(assignment);
    }

    /**
     * 인수인계 완료
     */
    @PostMapping("/{assignmentId}/complete")
    public ResponseEntity<HandoverAssignmentDto> completeHandover(
            @PathVariable Long assignmentId,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String actorId) {
        
        log.info("인수인계 완료 요청 - ID: {}", assignmentId);
        
        HandoverAssignmentDto assignment = handoverAssignmentService.completeHandover(assignmentId, actorId);
        return ResponseEntity.ok(assignment);
    }

    /**
     * 인수인계 취소
     */
    @PostMapping("/{assignmentId}/cancel")
    public ResponseEntity<HandoverAssignmentDto> cancelHandover(
            @PathVariable Long assignmentId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-User-Id", defaultValue = "system") String actorId) {
        
        String reason = request.get("reason");
        log.info("인수인계 취소 요청 - ID: {}, 사유: {}", assignmentId, reason);
        
        HandoverAssignmentDto assignment = handoverAssignmentService.cancelHandover(assignmentId, reason, actorId);
        return ResponseEntity.ok(assignment);
    }
    /**
     * 사용자별 인수인계 목록 조회
     */
    @GetMapping("/employee/{empNo}")
    public ResponseEntity<List<HandoverAssignmentDto>> getAssignmentsByEmployee(@PathVariable String empNo) {
        log.info("사용자별 인수인계 목록 조회 요청 - 사번: {}", empNo);
        
        List<HandoverAssignmentDto> assignments = handoverAssignmentService.getAssignmentsByEmployee(empNo);
        return ResponseEntity.ok(assignments);
    }

    /**
     * 지연된 인수인계 목록 조회
     */
    @GetMapping("/delayed")
    public ResponseEntity<List<HandoverAssignmentDto>> getDelayedAssignments() {
        log.info("지연된 인수인계 목록 조회 요청");
        
        List<HandoverAssignmentDto> assignments = handoverAssignmentService.getDelayedAssignments();
        return ResponseEntity.ok(assignments);
    }

}